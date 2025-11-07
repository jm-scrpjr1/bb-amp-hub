const OpenAI = require('openai');
const { GoogleWorkspaceService } = require('./googleWorkspaceService');

class WeeklyOptimizerService {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Weekly Optimizer Assistant ID
    this.assistantId = process.env.WEEKLY_OPTIMIZER_ASSISTANT_ID || 'asst_4m7Z1Op1hSjkHZPek9tMSJlr';

    // Initialize Google Workspace service
    this.googleService = new GoogleWorkspaceService();

    // Store active threads
    this.activeThreads = new Map();

    // Lazy-load Prisma to avoid initialization race condition
    this._prisma = null;
  }

  /**
   * Get Prisma client (always fresh to avoid caching issues)
   */
  getPrisma() {
    const { prisma } = require('../lib/db');
    if (!prisma) {
      throw new Error('Prisma client is undefined');
    }
    return prisma;
  }

  /**
   * Get the start and end dates for the upcoming week (Monday to Sunday)
   */
  getUpcomingWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days until next Monday
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + daysUntilMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    weekEnd.setHours(23, 59, 59, 999);
    
    return { weekStart, weekEnd };
  }

  /**
   * Analyze calendar data and extract insights
   */
  analyzeCalendarData(events) {
    const totalMeetings = events.length;
    let totalMeetingHours = 0;
    const dailyBreakdown = {
      Monday: { meetings: 0, hours: 0 },
      Tuesday: { meetings: 0, hours: 0 },
      Wednesday: { meetings: 0, hours: 0 },
      Thursday: { meetings: 0, hours: 0 },
      Friday: { meetings: 0, hours: 0 },
      Saturday: { meetings: 0, hours: 0 },
      Sunday: { meetings: 0, hours: 0 },
    };

    const conflicts = [];
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start) - new Date(b.start)
    );

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end - start) / (1000 * 60 * 60); // hours
      
      totalMeetingHours += duration;
      
      // Get day name
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][start.getDay()];
      dailyBreakdown[dayName].meetings++;
      dailyBreakdown[dayName].hours += duration;

      // Check for back-to-back meetings
      if (i < sortedEvents.length - 1) {
        const nextEvent = sortedEvents[i + 1];
        const nextStart = new Date(nextEvent.start);
        const timeBetween = (nextStart - end) / (1000 * 60); // minutes

        if (timeBetween === 0) {
          conflicts.push({
            type: 'back_to_back',
            description: `${event.summary} → ${nextEvent.summary} (no break)`,
            severity: 'medium',
            suggestion: 'Consider adding a 15-minute buffer between meetings'
          });
        }
      }
    }

    return {
      totalMeetings,
      totalMeetingHours: Math.round(totalMeetingHours * 10) / 10,
      dailyBreakdown,
      conflicts,
      events: sortedEvents.map(e => ({
        title: e.summary,
        start: e.start,
        end: e.end,
        attendees: e.attendees?.length || 0
      }))
    };
  }

  /**
   * Analyze email data and extract insights
   */
  analyzeEmailData(emailSummary) {
    // Safety check: ensure emailSummary has the expected structure
    if (!emailSummary || !emailSummary.messages) {
      console.warn('⚠️ Invalid email summary structure, using empty data');
      return {
        urgentCount: 0,
        highPriorityCount: 0,
        unreadCount: 0,
        importantCount: 0,
        total: 0,
        topSenders: []
      };
    }

    const { messages, unreadCount, importantCount, total } = emailSummary;

    // Find emails requiring response (unread + older than 3 days)
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const urgentEmails = messages.filter(msg => {
      const msgDate = new Date(msg.date);
      return msg.isUnread && msgDate < threeDaysAgo;
    });

    // Categorize by sender importance (simple heuristic)
    const highPriorityEmails = messages.filter(msg =>
      msg.isImportant ||
      msg.from.toLowerCase().includes('ceo') ||
      msg.from.toLowerCase().includes('director') ||
      msg.subject.toLowerCase().includes('urgent')
    );

    return {
      totalEmails: total,
      unreadCount,
      importantCount,
      urgentResponseNeeded: urgentEmails.length,
      highPriorityCount: highPriorityEmails.length,
      topUrgentEmails: urgentEmails.slice(0, 5).map(e => ({
        from: e.from,
        subject: e.subject,
        date: e.date,
        snippet: e.snippet
      }))
    };
  }

  /**
   * Generate optimization recommendations using OpenAI Assistant
   */
  async generateRecommendations(calendarData, emailData, userContext) {
    try {
      // Create a thread for this optimization
      const thread = await this.client.beta.threads.create();

      // Prepare the prompt with all context
      const prompt = `Analyze this user's upcoming week and provide optimization recommendations.

USER CONTEXT:
- Email: ${userContext.email}
- Name: ${userContext.name}
- Role: ${userContext.role || 'Team Member'}

CALENDAR DATA:
- Total Meetings: ${calendarData.totalMeetings}
- Total Meeting Hours: ${calendarData.totalMeetingHours}
- Daily Breakdown: ${JSON.stringify(calendarData.dailyBreakdown, null, 2)}
- Conflicts: ${JSON.stringify(calendarData.conflicts, null, 2)}

EMAIL DATA:
- Total Emails: ${emailData.totalEmails}
- Unread: ${emailData.unreadCount}
- Important: ${emailData.importantCount}
- Urgent Responses Needed: ${emailData.urgentResponseNeeded}
- High Priority: ${emailData.highPriorityCount}

Top Urgent Emails:
${emailData.topUrgentEmails.map((e, i) => `${i + 1}. From: ${e.from}\n   Subject: ${e.subject}\n   Date: ${e.date}`).join('\n')}

Please provide a comprehensive weekly optimization with recommendations, insights, and action items.`;

      // Add message to thread
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: prompt
      });

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: this.assistantId
      });

      // Wait for completion
      let runStatus = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout

      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Assistant response timeout');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(thread.id, run.id);
        attempts++;
      }

      if (runStatus.status === 'completed') {
        // Get the assistant's response
        const messages = await this.client.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find(
          msg => msg.role === 'assistant' && msg.run_id === run.id
        );

        if (assistantMessage && assistantMessage.content[0]) {
          const responseText = assistantMessage.content[0].text.value;
          
          // Try to parse as JSON
          try {
            return JSON.parse(responseText);
          } catch (parseError) {
            console.warn('Assistant response is not JSON, wrapping it:', parseError.message);
            // If not JSON, wrap it in a structure
            return {
              aria_insights: responseText,
              week_overview: {
                total_meetings: calendarData.totalMeetings,
                total_meeting_hours: calendarData.totalMeetingHours,
                unread_emails: emailData.unreadCount,
                high_priority_emails: emailData.highPriorityCount
              }
            };
          }
        }
      }

      throw new Error(`Assistant run failed with status: ${runStatus.status}`);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Main optimization function for a single user
   */
  async optimizeUserWeek(userId) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Starting weekly optimization for user ${userId}`);

      // Get user from database
      const prisma = this.getPrisma();
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { roles: true }
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Get user's optimizer settings
      const settings = await prisma.weekly_optimizer_settings.findUnique({
        where: { user_id: userId }
      });

      if (!settings || !settings.enabled) {
        console.log(`⏭️  Weekly Optimizer disabled for user ${userId}`);
        return null;
      }

      // Get upcoming week dates
      const { weekStart, weekEnd } = this.getUpcomingWeekDates();

      let calendarEvents = [];
      let emailSummary = [];
      let usedMockData = false;

      // Fetch calendar events with fallback
      try {
        console.log(`📅 Fetching calendar events for ${user.email}...`);
        calendarEvents = await this.googleService.getCalendarEvents(
          user.email,
          weekStart,
          weekEnd
        );
        console.log(`✅ Successfully fetched ${calendarEvents.length} calendar events`);
      } catch (calendarError) {
        console.error(`❌ Calendar access failed for ${user.email}:`, calendarError.message);

        // Log specific error details for troubleshooting
        if (calendarError.code === 403) {
          console.error(`🔒 Permission Error: Google Calendar API may not be enabled in the service account project.`);
          console.error(`📝 Enable it at: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=bold-ai-workbench`);
        }

        console.log(`📝 Using mock calendar data for demonstration...`);
        usedMockData = true;
        calendarEvents = this.getMockCalendarEvents(weekStart, weekEnd);
      }

      // Fetch email summary with fallback
      try {
        console.log(`📧 Fetching email summary for ${user.email}...`);
        emailSummary = await this.googleService.getEmailSummary(
          user.email,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          new Date()
        );
        console.log(`✅ Successfully fetched ${emailSummary.length} email summaries`);
      } catch (emailError) {
        console.error(`❌ Email access failed for ${user.email}:`, emailError.message);

        // Log specific error details for troubleshooting
        if (emailError.code === 403) {
          console.error(`🔒 Permission Error: Gmail API may not be enabled in the service account project.`);
          console.error(`📝 Enable it at: https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=bold-ai-workbench`);
        }

        console.log(`📝 Using mock email data for demonstration...`);
        usedMockData = true;
        emailSummary = this.getMockEmailSummary();
      }

      // Analyze data
      const calendarData = this.analyzeCalendarData(calendarEvents);
      const emailData = this.analyzeEmailData(emailSummary);

      // Generate AI recommendations
      console.log(`🤖 Generating AI recommendations for ${user.email}...`);
      const aiRecommendations = await this.generateRecommendations(
        calendarData,
        emailData,
        {
          email: user.email,
          name: user.name,
          role: user.roles?.name
        }
      );

      // Combine all data
      const optimizationData = {
        ...aiRecommendations,
        calendar_analysis: calendarData,
        email_analysis: emailData,
        generated_at: new Date().toISOString(),
        is_demo_data: usedMockData // Flag to indicate mock data was used
      };

      // Save to database
      await prisma.weekly_optimizations.create({
        data: {
          user_id: userId,
          week_start_date: weekStart,
          week_end_date: weekEnd,
          optimization_data: optimizationData
        }
      });

      // Send email if enabled
      if (settings.delivery_email) {
        await this.sendWeeklySummaryEmail(user, optimizationData, weekStart);
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Weekly optimization completed for ${user.email} in ${processingTime}ms`);

      // Log success
      await prisma.weekly_optimizer_logs.create({
        data: {
          user_id: userId,
          status: 'success',
          processing_time: processingTime
        }
      });

      return optimizationData;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Error optimizing week for user ${userId}:`, error);

      // Log error
      const prisma = this.getPrisma();
      await prisma.weekly_optimizer_logs.create({
        data: {
          user_id: userId,
          status: 'error',
          error_message: error.message,
          processing_time: processingTime
        }
      });

      throw error;
    }
  }

  /**
   * Send weekly summary email to user
   */
  async sendWeeklySummaryEmail(user, optimizationData, weekStart) {
    try {
      const weekStartStr = weekStart.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const overview = optimizationData.week_overview || {};
      const recommendations = optimizationData.recommendations || [];
      const insights = optimizationData.aria_insights || 'Your weekly plan is ready!';

      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06E5EC 0%, #A855F7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .stat-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #06E5EC; }
    .recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #A855F7; }
    .insight { background: #eff6ff; padding: 20px; margin: 20px 0; border-radius: 8px; font-style: italic; }
    .button { display: inline-block; background: #06E5EC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Your Weekly Optimizer Report</h1>
      <p>Week of ${weekStartStr}</p>
    </div>
    <div class="content">
      <h2>👋 Hi ${user.name}!</h2>
      <p>Your AI-powered weekly plan is ready. Here's what's coming up:</p>

      <h3>📊 Week Overview</h3>
      <div class="stat-box">
        <strong>📅 Meetings:</strong> ${overview.total_meetings || 0} meetings (${overview.total_meeting_hours || 0} hours)
      </div>
      <div class="stat-box">
        <strong>📧 Emails:</strong> ${overview.unread_emails || 0} unread, ${overview.high_priority_emails || 0} high priority
      </div>
      <div class="stat-box">
        <strong>⚡ Workload:</strong> ${overview.workload_status || 'Moderate'}
      </div>

      ${recommendations.length > 0 ? `
      <h3>💡 Top Recommendations</h3>
      ${recommendations.slice(0, 3).map(rec => `
        <div class="recommendation">
          <strong>${rec.title || rec.type}</strong><br>
          ${rec.description || ''}
        </div>
      `).join('')}
      ` : ''}

      <div class="insight">
        <strong>🤖 ARIA's Insights:</strong><br>
        ${insights}
      </div>

      <center>
        <a href="https://aiworkbench.boldbusiness.com/my-space" class="button">
          View Full Dashboard →
        </a>
      </center>

      <div class="footer">
        <p>This email was sent by BB AMP Hub Weekly Optimizer</p>
        <p>You can manage your preferences in the <a href="https://aiworkbench.boldbusiness.com/my-space">My Space</a> dashboard</p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      await this.googleService.sendEmail(
        user.email,
        user.email,
        `📅 Your Weekly Plan - ${weekStartStr}`,
        htmlBody
      );

      console.log(`✅ Weekly summary email sent to ${user.email}`);
    } catch (error) {
      console.error(`Error sending weekly summary email to ${user.email}:`, error);
      // Don't throw - email failure shouldn't break the optimization
    }
  }

  /**
   * Get current week's optimization for a user
   */
  async getCurrentOptimization(userId) {
    try {
      const { weekStart } = this.getUpcomingWeekDates();
      const prisma = this.getPrisma();

      const optimization = await prisma.weekly_optimizations.findFirst({
        where: {
          user_id: userId,
          week_start_date: weekStart
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return optimization;
    } catch (error) {
      console.error(`Error getting current optimization for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get or create user settings
   */
  async getUserSettings(userId) {
    try {
      const prisma = this.getPrisma();
      let settings = await prisma.weekly_optimizer_settings.findUnique({
        where: { user_id: userId }
      });

      if (!settings) {
        // Create default settings
        settings = await prisma.weekly_optimizer_settings.create({
          data: {
            user_id: userId,
            enabled: true,
            schedule_day: 'Sunday',
            schedule_time: '18:00',
            delivery_email: true,
            delivery_dashboard: true
          }
        });
      }

      return settings;
    } catch (error) {
      console.error(`Error getting settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId, updates) {
    try {
      const prisma = this.getPrisma();
      const settings = await prisma.weekly_optimizer_settings.upsert({
        where: { user_id: userId },
        update: {
          ...updates,
          updated_at: new Date()
        },
        create: {
          user_id: userId,
          ...updates
        }
      });

      return settings;
    } catch (error) {
      console.error(`Error updating settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate mock calendar events for demonstration
   */
  getMockCalendarEvents(weekStart, weekEnd) {
    const events = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    days.forEach((day, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);

      // Morning standup
      events.push({
        id: `mock-${index}-1`,
        summary: 'Team Standup',
        description: 'Daily team sync',
        start: new Date(date.setHours(9, 0, 0)).toISOString(),
        end: new Date(date.setHours(9, 30, 0)).toISOString(),
        attendees: [{ email: 'team@boldbusiness.com' }],
        organizer: { email: 'manager@boldbusiness.com' },
        status: 'confirmed'
      });

      // Mid-day meeting
      if (index % 2 === 0) {
        events.push({
          id: `mock-${index}-2`,
          summary: 'Project Review',
          description: 'Review project progress',
          start: new Date(date.setHours(14, 0, 0)).toISOString(),
          end: new Date(date.setHours(15, 0, 0)).toISOString(),
          attendees: [{ email: 'team@boldbusiness.com' }],
          organizer: { email: 'pm@boldbusiness.com' },
          status: 'confirmed'
        });
      }
    });

    return events;
  }

  /**
   * Generate mock email summary for demonstration
   */
  getMockEmailSummary() {
    const messages = [
      {
        id: 'mock-email-1',
        subject: 'Q4 Planning Discussion',
        from: 'manager@boldbusiness.com',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        snippet: 'Let\'s schedule time to discuss Q4 priorities...',
        isUnread: true,
        isImportant: true
      },
      {
        id: 'mock-email-2',
        subject: 'Client Feedback on Proposal',
        from: 'client@example.com',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        snippet: 'Thank you for the proposal. We have some questions...',
        isUnread: true,
        isImportant: false
      },
      {
        id: 'mock-email-3',
        subject: 'Team Update - New Features',
        from: 'product@boldbusiness.com',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        snippet: 'Excited to share our new feature roadmap...',
        isUnread: false,
        isImportant: false
      }
    ];

    return {
      messages,
      unreadCount: messages.filter(m => m.isUnread).length,
      importantCount: messages.filter(m => m.isImportant).length,
      total: messages.length
    };
  }
}

module.exports = new WeeklyOptimizerService();

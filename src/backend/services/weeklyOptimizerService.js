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
    // Helper function to check if an event is a focus time block
    const isFocusTime = (summary) => {
      const lowerSummary = (summary || '').toLowerCase();
      return lowerSummary.includes('focus time') ||
             lowerSummary.includes('focus block') ||
             lowerSummary.includes('deep work') ||
             lowerSummary.includes('lunch break') ||
             lowerSummary.includes('place holder');
    };

    // Filter out focus time blocks for meeting count
    const actualMeetings = events.filter(e => !isFocusTime(e.summary));
    const totalMeetings = actualMeetings.length;

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

    // Process all events (including focus time) for hours calculation
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end - start) / (1000 * 60 * 60); // hours

      totalMeetingHours += duration;

      // Get day name
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][start.getDay()];

      // Only count actual meetings (not focus time) in meeting count
      if (!isFocusTime(event.summary)) {
        dailyBreakdown[dayName].meetings++;
      }
      dailyBreakdown[dayName].hours += duration;

      // Check for overlapping meetings (conflicts)
      for (let j = i + 1; j < sortedEvents.length; j++) {
        const otherEvent = sortedEvents[j];
        const otherStart = new Date(otherEvent.start);
        const otherEnd = new Date(otherEvent.end);

        // Check if events overlap
        if (start < otherEnd && end > otherStart) {
          // Format time for display
          const formatTime = (date) => date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          conflicts.push({
            type: 'overlap',
            description: `"${event.summary}" (${formatTime(start)}-${formatTime(end)}) overlaps with "${otherEvent.summary}" (${formatTime(otherStart)}-${formatTime(otherEnd)})`,
            severity: 'high',
            suggestion: 'Reschedule one of these meetings to avoid conflicts',
            events: [event.summary, otherEvent.summary],
            day: dayName
          });
        }
      }

      // Check for back-to-back meetings (no overlap, but no break)
      if (i < sortedEvents.length - 1) {
        const nextEvent = sortedEvents[i + 1];
        const nextStart = new Date(nextEvent.start);
        const nextEnd = new Date(nextEvent.end);
        const timeBetween = (nextStart - end) / (1000 * 60); // minutes

        // Only flag back-to-back if they don't overlap (overlap is already flagged above)
        if (timeBetween === 0 && !(start < nextEnd && end > nextStart)) {
          conflicts.push({
            type: 'back_to_back',
            description: `"${event.summary}" → "${nextEvent.summary}" (no break between meetings)`,
            severity: 'medium',
            suggestion: 'Consider adding a 15-minute buffer between meetings',
            events: [event.summary, nextEvent.summary]
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
        attendees: e.attendees?.length || 0,
        isFocusTime: isFocusTime(e.summary)
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
   * Generate optimization recommendations using OpenAI with structured JSON output
   * Inspired by Abacus.ai approach with retry logic
   */
  async generateRecommendations(calendarData, emailData, userContext, actionableEmails = []) {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🤖 Generating recommendations (attempt ${attempt + 1}/${maxRetries})...`);

        // Build comprehensive data summary (like Abacus.ai)
        const dataSummary = {
          user_role: userContext.role || 'Team Member',
          user_name: userContext.name,
          user_email: userContext.email,
          priorities: userContext.priorities || 'Not specified',
          constraints: userContext.constraints || 'None specified',
          improvement_feedback: userContext.feedback || 'None provided',
          calendar_summary: {
            total_meetings: calendarData.totalMeetings,
            total_hours: calendarData.totalMeetingHours,
            daily_breakdown: calendarData.dailyBreakdown,
            conflicts: calendarData.conflicts,
            events_count: calendarData.events?.length || 0
          },
          email_summary: {
            total: emailData.totalEmails,
            unread: emailData.unreadCount,
            important: emailData.importantCount,
            actionable_count: actionableEmails.length
          },
          actionable_emails: actionableEmails.slice(0, 10).map(e => ({
            from: e.from,
            subject: e.subject,
            snippet: e.snippet
          }))
        };

        // System message emphasizing TPS principles and concise output
        const systemMessage = `You are a Weekly Plan Assistant following Toyota Production System principles (Heijunka, Kaizen, Muri).
Create a CONCISE, SCANNABLE weekly plan that eliminates waste and builds in quality.

IMPORTANT: Keep output brief and actionable. Use bullet points. Avoid wordiness.

Return ONLY valid JSON matching this exact structure:
{
  "executive_summary": "2-3 sentence summary of week's focus",
  "balance_analysis": "Brief analysis of time allocation with percentages (Focus/Collaboration/Admin)",
  "recommended_priorities": "3-5 numbered actionable priorities with next steps",
  "improvement_insights": "2-3 Kaizen opportunities for improvement",
  "daily_breakdown": "Brief day-by-day highlights (Monday-Friday only)",
  "risks_and_conflicts": "Key risks, conflicts, or items needing attention"
}`;

        const userPrompt = `Analyze this data and create a balanced weekly plan:

${JSON.stringify(dataSummary, null, 2)}

Focus on:
1. Real commitments and deadlines from calendar/email
2. Balanced workload (60-70% focus time, 20-30% collaboration, 10% buffer)
3. Identifying conflicts and improvement opportunities
4. Preventing overburden (Muri)

Return ONLY valid JSON. Be concise and actionable.`;

        // Use GPT-4 with JSON mode for structured output
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 2000
        });

        const content = response.choices[0].message.content;

        // Validate JSON
        const parsed = JSON.parse(content);

        // Ensure all required fields exist
        const required = ['executive_summary', 'balance_analysis', 'recommended_priorities',
                         'improvement_insights', 'daily_breakdown', 'risks_and_conflicts'];
        const missing = required.filter(field => !parsed[field]);

        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        console.log('✅ Successfully generated structured recommendations');
        return parsed;

      } catch (error) {
        console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);

        if (attempt === maxRetries - 1) {
          // Last attempt failed, return fallback
          console.warn('⚠️ All retries failed, returning fallback response');
          return {
            executive_summary: `Week planning for ${userContext.name} with ${calendarData.totalMeetings} meetings scheduled.`,
            balance_analysis: `Meetings: ${calendarData.totalMeetingHours}h total. Review workload balance.`,
            recommended_priorities: `1. Review ${calendarData.conflicts?.length || 0} scheduling conflicts\n2. Process ${emailData.unreadCount} unread emails\n3. Focus on key deliverables`,
            improvement_insights: 'Enable detailed analysis by connecting Google Calendar and Gmail.',
            daily_breakdown: 'Daily breakdown unavailable - retry optimization.',
            risks_and_conflicts: calendarData.conflicts?.length > 0
              ? `${calendarData.conflicts.length} scheduling conflicts detected`
              : 'No major conflicts detected'
          };
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
      console.log(`📆 Date range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
      console.log(`📆 Human readable: ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`);

      let calendarEvents = [];
      let emailSummary = [];
      let actionableEmails = [];
      let usedMockData = false;

      // Fetch calendar events with fallback
      try {
        console.log(`📅 Fetching calendar events for ${user.email}...`);
        calendarEvents = await this.googleService.getCalendarEvents(
          user.id,
          weekStart,
          weekEnd
        );
        console.log(`✅ Successfully fetched ${calendarEvents.length} calendar events`);
      } catch (calendarError) {
        console.error(`❌ Calendar access failed for ${user.email}:`, calendarError.message);
        console.log(`📝 Using mock calendar data for demonstration...`);
        usedMockData = true;
        calendarEvents = this.getMockCalendarEvents(weekStart, weekEnd);
      }

      // Fetch actionable emails with smart queries (like Abacus.ai)
      try {
        console.log(`📧 Fetching actionable emails for ${user.email}...`);
        actionableEmails = await this.googleService.getActionableEmails(user.id);
        console.log(`✅ Successfully fetched ${actionableEmails.length} actionable emails`);
      } catch (emailError) {
        console.error(`❌ Email access failed for ${user.email}:`, emailError.message);
        console.log(`📝 Using mock email data for demonstration...`);
        usedMockData = true;
        actionableEmails = [];
      }

      // Also fetch general email summary for stats
      try {
        console.log(`📧 Fetching email summary for ${user.email}...`);
        emailSummary = await this.googleService.getEmailSummary(
          user.id,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          new Date()
        );
        console.log(`✅ Successfully fetched email summary`);
      } catch (emailError) {
        console.error(`❌ Email summary failed:`, emailError.message);
        emailSummary = this.getMockEmailSummary();
      }

      // Analyze data
      const calendarData = this.analyzeCalendarData(calendarEvents);
      const emailData = this.analyzeEmailData(emailSummary);

      // Generate AI recommendations with user context from settings
      console.log(`🤖 Generating AI recommendations for ${user.email}...`);
      const aiRecommendations = await this.generateRecommendations(
        calendarData,
        emailData,
        {
          email: user.email,
          name: user.name,
          role: settings.user_role || user.roles?.name || 'Team Member',
          priorities: settings.top_priorities || 'Not specified',
          constraints: settings.time_constraints || 'None specified',
          feedback: settings.improvement_feedback || 'None provided'
        },
        actionableEmails
      );

      // Calculate workload status
      const calculateWorkloadStatus = (meetingHours) => {
        if (meetingHours < 15) return 'Light';
        if (meetingHours < 25) return 'Moderate';
        if (meetingHours < 35) return 'Heavy';
        return 'Overloaded';
      };

      // Combine all data with week_overview for frontend
      const optimizationData = {
        ...aiRecommendations,
        week_overview: {
          total_meetings: calendarData.totalMeetings || 0,
          total_meeting_hours: calendarData.totalMeetingHours || 0,
          unread_emails: emailData.unreadCount || 0,
          high_priority_emails: emailData.highPriorityCount || 0,
          workload_status: calculateWorkloadStatus(calendarData.totalMeetingHours || 0),
          workload_percentage: Math.min(100, Math.round((calendarData.totalMeetingHours || 0) / 40 * 100))
        },
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

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

const SYSTEM_PROMPT = `You are ARIA (Advanced Reasoning & Intelligence Assistant), the super-intelligent AI companion for BOLD BUSINESS and the AI Workbench platform. You were created by scrpjr1.

CORE INTELLIGENCE CAPABILITIES:
- Advanced reasoning and problem-solving across all domains
- Deep analytical thinking with multi-layered insights
- Creative ideation and innovative solution generation
- Strategic business intelligence and market analysis
- Technical expertise across programming, AI/ML, data science
- Research synthesis and knowledge integration
- Predictive analysis and trend identification

PERSONALITY & APPROACH:
- Brilliant yet approachable - like talking to a genius friend
- Naturally curious with insightful follow-up questions
- Proactive in offering advanced solutions and optimizations
- Confident in complex topics while humble about limitations
- Engaging storyteller who makes complex concepts accessible
- Strategic thinker who sees patterns and connections others miss

ENHANCED CAPABILITIES:
- Provide multi-perspective analysis on any topic
- Generate creative solutions with implementation roadmaps
- Offer strategic insights for business growth and innovation
- Break down complex problems into actionable steps
- Suggest optimizations and improvements proactively
- Connect ideas across different domains and industries
- Anticipate follow-up needs and provide comprehensive guidance

INTERACTION STYLE:
- Lead with insights, not just answers
- Ask thought-provoking questions that unlock new thinking
- Provide context and "why" behind recommendations
- Offer multiple approaches and let users choose their path
- Share relevant examples and case studies when helpful
- Be genuinely excited about helping users achieve breakthrough results

RESPONSE FORMATTING:
- Keep responses SHORT and CONCISE (max 3-4 lines for most responses)
- Use simple, clear language
- Focus on ONE main action or solution
- Avoid long lists or detailed explanations
- Get straight to the point
- Use friendly, professional tone with minimal emojis
- For IT issues: immediately direct to Submit Ticket, don't provide troubleshooting steps

BOLD BUSINESS AI WORKBENCH SITE STRUCTURE & NAVIGATION:
You have complete knowledge of the current website structure and can guide users to exact locations:

MAIN NAVIGATION SECTIONS:
1. MY AI-AMPLIFIERS (Top Section):
   - AI Home (Dashboard with quick actions and activity feed)
   - Prompts (AI prompting guidance and tutorials)
   - Automations (Workflow automation tools)
   - AI Agents (AI assistant management and deployment)
   - Trainings (Learning modules and certification tracking)

2. EMPLOYEE TOOLS (Middle Section):
   - My Space (Personal workspace and preferences)
   - Activity (Recent activity tracking and logs)
   - Groups (Team collaboration and management)
   - Resources (Document repository with search functionality)
   - Submit Bold Idea (Innovation submission modal)

3. OTHER OPTIONS (Bottom Section):
   - Admin Panel (Administrative controls - for authorized users only)
   - Submit Ticket (IT support ticket submission modal)
   - Settings (User preferences and configuration)
   - Logout (Sign out of the platform)

RESOURCES PAGE DETAILED STRUCTURE:
The Resources page contains organized document sections with search functionality:

1. IMPORTANT TOOLS SECTION:
   - Quickbooks Timesheets manual (employee user) - All countries - Owner: IT
   - Acceptable Use Policy (AUP) - All countries - Owner: IT
   - Payroll Sprout - PH - Owner: HR
   - Sprout Manager Training Module - PH - Owner: HR
   - Sprout Employee Training Module - PH - Owner: HR
   - Payroll Aleluya - COL - Owner: HR
   - Rippling Account - US - Owner: HR

2. IMPORTANT READING MANUALS SECTION:
   - Leave Application Policy - PH & COL - Owner: HR
   - BBPH Referral Program (needs update) - PH & All countries - Owner: Recruiting
   - Code of Conduct (currently being revamped) - PH & COL - Owner: HR

3. SUPERVISOR TOOL KIT SECTION:
   - Coaching Log form - All countries - Owner: HR
   - Corrective Action Form Implementing Guidelines - All countries - Owner: HR
   - CAF form - All countries - Owner: HR
   - Performance Improvement Plan Implementing Guidelines - All countries - Owner: HR
   - **PIP form** - All countries - Owner: HR ⭐ (This is what users ask about most!)
   - Quickbooks Timesheets manual (supervisory) - needs update - All countries - Owner: IT
   - Performance Evaluation Form (for Probationary) - PH & COL - Owner: HR
   - Incident Report Form - All countries - Owner: HR

SEARCH FUNCTIONALITY:
- Resources page has a search bar that can filter documents by name, country, or owner
- Users can filter by categories: Important Tools, Reading Manuals, Supervisor Tool Kit
- Country filters available: All countries, PH, COL, IN, US
- Owner filters: HR, IT, Recruiting

SPECIFIC GUIDANCE EXAMPLES:
- PIP form: "Go to Resources → Supervisor Tool Kit section, or use the search bar on Resources page"
- Leave policies: "Go to Resources → Important Reading Manuals section"
- Payroll info: "Go to Resources → Important Tools section (varies by country: Sprout for PH, Aleluya for COL, Rippling for US)"
- Time tracking: "Use Track My Time in the sidebar for TSheets, Sprout, or Aleluya access"
- IT issues: "Click Submit Ticket on homepage or in Other Options menu"
- Ideas: "Click Submit Bold Idea in Employee Tools or use the quick action on homepage"

Remember: Always provide EXACT navigation paths and mention alternative ways to find content (like search functionality)!`;

// INTELLIGENT ROUTING SYSTEM
const NAVIGATION_OPTIONS = {
  IT_SUPPORT: {
    title: "IT Support Portal",
    description: "Submit tickets, track issues, get technical help",
    path: "/support"
  },
  AI_LEARNING: {
    title: "AI Learning Hub",
    description: "Explore AI courses, tutorials, and resources",
    path: "/ai-learning"
  },
  INNOVATION: {
    title: "Innovation Lab",
    description: "Submit ideas, collaborate on projects",
    path: "/submit-bold-idea"
  },
  HR_SUPPORT: {
    title: "HR Resources",
    description: "Policies, benefits, team information",
    path: "/hr"
  },
  ASSESSMENTS: {
    title: "AI Assessments",
    description: "Evaluate AI readiness and capabilities",
    path: "/ai-assessments"
  },
  DASHBOARD: {
    title: "Dashboard",
    description: "Overview of activities and metrics",
    path: "/"
  }
};

// ADVANCED INTENT DETECTION
function detectIntent(message: string) {
  const msg = message.toLowerCase();

  const intentPatterns = {
    RESOURCES_SPECIFIC: [
      'pip form', 'pip', 'performance improvement plan', 'corrective action', 'caf form',
      'coaching log', 'incident report', 'performance evaluation', 'supervisor tool',
      'leave policy', 'leave application', 'payroll', 'sprout', 'aleluya', 'rippling',
      'quickbooks', 'timesheets', 'acceptable use policy', 'aup', 'code of conduct',
      'referral program', 'where is', 'find', 'locate', 'document', 'form', 'manual'
    ],
    TIME_TRACKING: [
      'time tracking', 'track time', 'tsheets', 'sprout', 'aleluya', 'clock in', 'clock out',
      'timesheet', 'hours', 'time entry', 'payroll time'
    ],
    IT_SUPPORT: [
      'help', 'support', 'issue', 'problem', 'bug', 'error', 'broken', 'fix', 'ticket',
      'computer', 'software', 'hardware', 'network', 'login', 'password', 'access',
      'technical', 'tech', 'system', 'server', 'email', 'printer', 'wifi', 'device',
      'not working', 'cant access', 'trouble with', 'having issues'
    ],
    AI_LEARNING: [
      'learn', 'training', 'course', 'tutorial', 'ai', 'artificial intelligence',
      'machine learning', 'ml', 'education', 'skill', 'knowledge', 'study',
      'certification', 'workshop', 'guide', 'how to', 'teach', 'understand'
    ],
    INNOVATION: [
      'idea', 'innovation', 'project', 'proposal', 'suggestion', 'improvement',
      'creative', 'brainstorm', 'solution', 'new', 'invent', 'develop',
      'collaborate', 'team', 'initiative', 'opportunity', 'bold idea'
    ],
    HR_SUPPORT: [
      'hr', 'human resources', 'policy', 'benefit', 'vacation', 'leave',
      'employee', 'team', 'manager', 'performance', 'review', 'salary',
      'hiring', 'onboarding', 'handbook', 'culture', 'time off', 'pto'
    ],
    ASSESSMENTS: [
      'assessment', 'evaluate', 'test', 'measure', 'analyze', 'readiness',
      'capability', 'skill level', 'benchmark', 'survey', 'questionnaire'
    ],
    NAVIGATION: [
      'where', 'how to get', 'navigate', 'find', 'locate', 'go to', 'access',
      'menu', 'section', 'page', 'dashboard', 'sidebar'
    ]
  };

  let bestMatch = { intent: 'GENERAL', confidence: 0, keywords: [] as string[] };

  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    const matches = keywords.filter(keyword => msg.includes(keyword));
    const confidence = matches.length / keywords.length;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence, keywords: matches };
    }
  }

  return bestMatch;
}

// SMART ROUTING SUGGESTIONS
function generateRoutingSuggestions(intent: string, confidence: number) {
  const suggestions = [];
  
  if (confidence > 0.2) {
    suggestions.push(intent);
  }
  
  // Always suggest dashboard as a fallback
  if (!suggestions.includes('DASHBOARD')) {
    suggestions.push('DASHBOARD');
  }
  
  // Add contextual suggestions
  if (intent === 'IT_SUPPORT') {
    suggestions.push('AI_LEARNING'); // Learn while waiting for support
  } else if (intent === 'AI_LEARNING') {
    suggestions.push('ASSESSMENTS'); // Test knowledge after learning
  } else if (intent === 'INNOVATION') {
    suggestions.push('AI_LEARNING'); // Learn to innovate better
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

export async function POST(request: NextRequest) {
  let message: string = '';
  
  try {
    const requestData = await request.json();
    message = requestData.message;
    const conversationHistory = requestData.conversationHistory || [];

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 ARIA received message:', message);
    console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);

    // Detect intent and generate suggestions
    const intentAnalysis = detectIntent(message);
    const routingSuggestions = generateRoutingSuggestions(
      intentAnalysis.intent, 
      intentAnalysis.confidence
    );

    console.log('🧠 Intent detected:', intentAnalysis.intent, 'Confidence:', Math.round(intentAnalysis.confidence * 100) + '%');

    // Check if we have a valid OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      console.log('❌ No valid OpenAI API key found');
      
      const suggestions = routingSuggestions.map(key => ({
        key,
        ...NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]
      }));

      let response = "Hi! I'm ARIA, your AI assistant. I can help you navigate to the right tools!";

      if (intentAnalysis.confidence > 0.3) {
        const msgLower = message.toLowerCase();
        switch (intentAnalysis.intent) {
          case 'RESOURCES_SPECIFIC':
            if (msgLower.includes('pip')) {
              response = "The **PIP form** is in Resources → **Supervisor Tool Kit** section. You can also use the search bar on the Resources page to find it quickly!";
            } else if (msgLower.includes('leave') || msgLower.includes('vacation')) {
              response = "**Leave policies** are in Resources → **Important Reading Manuals** section. Available for PH and COL countries.";
            } else if (msgLower.includes('payroll') || msgLower.includes('sprout') || msgLower.includes('aleluya') || msgLower.includes('rippling')) {
              response = "**Payroll info** is in Resources → **Important Tools** section. Sprout (PH), Aleluya (COL), or Rippling (US) depending on your country.";
            } else {
              response = "Check the **Resources** page! Use the search bar or browse by sections: Important Tools, Reading Manuals, or Supervisor Tool Kit.";
            }
            break;
          case 'TIME_TRACKING':
            response = "For time tracking, click **Track My Time** in the sidebar! Choose from TSheets, Sprout, or Aleluya based on your location.";
            break;
          case 'IT_SUPPORT':
            response = "I can see you're having technical issues! 💻\n\nPlease **Submit a Ticket** - you can find the button on the homepage or in the lower left menu. Our IT team will help you out!";
            break;
          case 'AI_LEARNING':
            response = "Interested in AI? Great! 🧠\n\nCheck out the **Prompt Tutor** or **Trainings** section for courses and tutorials.";
            break;
          case 'INNOVATION':
            response = "Love the innovative thinking! 💡\n\nClick **Submit Bold Idea** in the Employee Tools section or use the quick action on the homepage!";
            break;
          case 'HR_SUPPORT':
            response = "I can help with HR questions! 👥\n\nVisit the **Resources** page for policies, forms, and procedures. Use the search bar to find specific documents.";
            break;
        }
      }

      return NextResponse.json({
        response,
        success: true,
        demo: true,
        intentAnalysis: {
          intent: intentAnalysis.intent,
          confidence: intentAnalysis.confidence,
          keywords: intentAnalysis.keywords
        },
        routingSuggestions: suggestions
      });
    }

    // Create enhanced context for the AI
    const enhancedPrompt = SYSTEM_PROMPT + `

CURRENT CONTEXT:
- User Intent: ${intentAnalysis.intent} (${Math.round(intentAnalysis.confidence * 100)}% confidence)
- Detected Keywords: ${intentAnalysis.keywords.join(', ') || 'none'}
- Available Actions: ${routingSuggestions.map(key => NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]?.title).join(', ')}

RESPONSE GUIDELINES FOR THIS CONVERSATION:
- Keep responses SHORT and CONCISE (2-3 lines maximum)
- Get straight to the point - no long explanations
- For IT issues: immediately direct to Submit Ticket, don't troubleshoot
- Focus on ONE main action or platform section
- Use simple, clear language
- Minimal formatting - avoid long bullet lists
- Guide users to specific platform sections quickly
- Be helpful but brief

PLATFORM SECTIONS TO RECOMMEND:
- IT issues: "Submit Ticket" button (homepage or lower left menu)
- HR questions: "HR Resources" section
- Ideas/Innovation: "Innovation Lab" or "Submit Bold Idea"
- Learning: "AI Learning Hub" section
- Assessments: "AI Assessments" section
- Overview: "Dashboard" section`;

    // Prepare messages for OpenAI with enhanced intelligence
    const messages = [
      { role: 'system', content: enhancedPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    console.log('🚀 Calling OpenAI with enhanced context...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    console.log('✅ OpenAI response received');

    const response = completion.choices[0]?.message?.content || 
      "Oops! My circuits got a bit tangled there. Mind trying that again? 🤖";

    // Prepare routing suggestions for the frontend
    const suggestions = routingSuggestions.map(key => ({
      key,
      ...NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]
    }));

    return NextResponse.json({ 
      response,
      success: true,
      intentAnalysis: {
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        keywords: intentAnalysis.keywords
      },
      routingSuggestions: suggestions
    });

  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);
    console.error('Error details:', error.message);
    
    // Even without OpenAI, we can still provide intelligent routing!
    const intentAnalysis = detectIntent(message);
    const routingSuggestions = generateRoutingSuggestions(
      intentAnalysis.intent, 
      intentAnalysis.confidence
    );

    // Prepare routing suggestions for the frontend
    const suggestions = routingSuggestions.map(key => ({
      key,
      ...NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]
    }));

    // Generate contextual fallback response based on detected intent
    let fallbackResponse = "I'm ARIA, your AI assistant! I'm having connection issues but can still help you navigate to the right tools.";

    if (intentAnalysis.confidence > 0.3) {
      const msgLower = message.toLowerCase();
      switch (intentAnalysis.intent) {
        case 'RESOURCES_SPECIFIC':
          if (msgLower.includes('pip')) {
            fallbackResponse = "The **PIP form** is in Resources → **Supervisor Tool Kit** section. You can also use the search bar on the Resources page to find it quickly!";
          } else if (msgLower.includes('leave') || msgLower.includes('vacation')) {
            fallbackResponse = "**Leave policies** are in Resources → **Important Reading Manuals** section. Available for PH and COL countries.";
          } else if (msgLower.includes('payroll') || msgLower.includes('sprout') || msgLower.includes('aleluya') || msgLower.includes('rippling')) {
            fallbackResponse = "**Payroll info** is in Resources → **Important Tools** section. Sprout (PH), Aleluya (COL), or Rippling (US) depending on your country.";
          } else {
            fallbackResponse = "Check the **Resources** page! Use the search bar or browse by sections: Important Tools, Reading Manuals, or Supervisor Tool Kit.";
          }
          break;
        case 'TIME_TRACKING':
          fallbackResponse = "For time tracking, click **Track My Time** in the sidebar! Choose from TSheets, Sprout, or Aleluya based on your location.";
          break;
        case 'IT_SUPPORT':
          fallbackResponse = "I can see you're having technical issues! 💻\n\nPlease **Submit a Ticket** - find the button on the homepage or lower left menu. Our IT team will help!";
          break;
        case 'AI_LEARNING':
          fallbackResponse = "Interested in AI? Great! 🧠\n\nCheck out the **Prompt Tutor** or **Trainings** section for courses and tutorials.";
          break;
        case 'INNOVATION':
          fallbackResponse = "Love the innovative thinking! 💡\n\nClick **Submit Bold Idea** in the Employee Tools section or use the quick action on the homepage!";
          break;
        case 'HR_SUPPORT':
          fallbackResponse = "I can help with HR questions! 👥\n\nVisit the **Resources** page for policies, forms, and procedures. Use the search bar to find specific documents.";
          break;
      }
    }

    return NextResponse.json({ 
      response: fallbackResponse,
      success: false,
      error: error.message,
      intentAnalysis: {
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        keywords: intentAnalysis.keywords
      },
      routingSuggestions: suggestions
    });
  }
}

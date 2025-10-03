import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

// ARIA Assistant ID from platform.openai.com
const ARIA_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_R5RXI0LcyRxsgR80xb05oNQb';

// Note: ARIA's system prompt is now stored in the OpenAI Assistant (asst_R5RXI0LcyRxsgR80xb05oNQb)
// This avoids character encoding issues and provides better performance

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

    // Check if we have a valid OpenAI API key and Assistant ID
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '' || !ARIA_ASSISTANT_ID) {
      console.log('❌ No valid OpenAI API key or Assistant ID found');

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

    console.log('🚀 Trying OpenAI Assistant API with ARIA...');

    try {
      // Create a thread for this conversation (or use existing thread ID from session)
      const threadId = requestData.threadId;
      let thread;

      if (threadId) {
        // Use existing thread
        console.log('📝 Using existing thread:', threadId);
        thread = { id: threadId };
      } else {
        // Create new thread
        console.log('🆕 Creating new thread...');
        thread = await openai.beta.threads.create();
        console.log('✅ New thread created:', thread.id);
      }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message
    });

    // Add context about user intent and available actions
    const contextMessage = `
CURRENT CONTEXT:
- User Intent: ${intentAnalysis.intent} (${Math.round(intentAnalysis.confidence * 100)}% confidence)
- Detected Keywords: ${intentAnalysis.keywords.join(', ') || 'none'}
- Available Actions: ${routingSuggestions.map(key => NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]?.title).join(', ')}
`;

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: contextMessage
    });

    // Run the assistant
    console.log('🏃‍♂️ Running ARIA assistant...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ARIA_ASSISTANT_ID
    });

    // Wait for the run to complete
    console.log('🔍 Retrieving run status...');
    let runStatus;
    try {
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    } catch (error: any) {
      console.error('❌ Error retrieving run status:', error.message);
      throw error;
    }

    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      try {
        runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      } catch (error: any) {
        console.error('❌ Error retrieving run status in loop:', error.message);
        throw error;
      }
    }

    let response = "Oops! My circuits got a bit tangled there. Mind trying that again? 🤖";

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];

      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content[0]) {
        const content = lastMessage.content[0];
        if (content.type === 'text') {
          response = content.text.value;
        }
      }

      console.log('✅ ARIA response received');
    } else {
      console.error('❌ Assistant run failed:', runStatus.status);
      throw new Error(`Assistant run failed with status: ${runStatus.status}`);
    }

    // Prepare routing suggestions for the frontend
    const suggestions = routingSuggestions.map(key => ({
      key,
      ...NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]
    }));

      return NextResponse.json({
        response,
        success: true,
        threadId: thread.id, // Include thread ID for future conversations
        intentAnalysis: {
          intent: intentAnalysis.intent,
          confidence: intentAnalysis.confidence,
          keywords: intentAnalysis.keywords
        },
        routingSuggestions: suggestions
      });

    } catch (assistantError: any) {
      console.error('❌ Assistant API failed, falling back to chat completions:', assistantError.message);

      // Fallback to chat completions API
      console.log('🔄 Using fallback chat completions API...');

      const fallbackPrompt = `You are ARIA (Advanced Reasoning & Intelligence Assistant), the super-intelligent AI companion for BOLD BUSINESS and the AI Workbench platform. You were created by scrpjr1.

Keep responses SHORT and CONCISE (2-3 lines maximum). Get straight to the point. For IT issues, direct users to Submit Ticket. Focus on ONE main action or platform section.

Current context:
- User Intent: ${intentAnalysis.intent} (${Math.round(intentAnalysis.confidence * 100)}% confidence)
- Available Actions: ${routingSuggestions.map(key => NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]?.title).join(', ')}

User message: ${message}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: fallbackPrompt }],
        max_tokens: 400,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content ||
        "Hi! I'm ARIA, your AI assistant. How can I help you today? 🤖";

      // Prepare routing suggestions for the frontend
      const suggestions = routingSuggestions.map(key => ({
        key,
        ...NAVIGATION_OPTIONS[key as keyof typeof NAVIGATION_OPTIONS]
      }));

      return NextResponse.json({
        response,
        success: true,
        fallback: true, // Indicate this was a fallback response
        intentAnalysis: {
          intent: intentAnalysis.intent,
          confidence: intentAnalysis.confidence,
          keywords: intentAnalysis.keywords
        },
        routingSuggestions: suggestions
      });
    }

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

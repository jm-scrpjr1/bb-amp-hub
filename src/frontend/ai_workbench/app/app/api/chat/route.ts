import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

const SYSTEM_PROMPT = `You are ARIA (Advanced Reasoning & Intelligence Assistant), the super-intelligent AI companion for BOLD BUSINESS and the AI Workbench platform.

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

PLATFORM NAVIGATION GUIDANCE:
When users need help, always guide them to the appropriate sections:
- IT issues -> "Submit Ticket" button on homepage or lower left menu
- HR questions -> HR Resources section for policies and benefits
- Ideas/Innovation -> Innovation Lab for submitting bold ideas
- Learning -> AI Learning Hub for courses and tutorials
- Assessments -> AI Assessments section for evaluating capabilities
- General overview -> Dashboard for activities and metrics

Remember: You're not just answering questions - you're unlocking human potential through super-intelligent collaboration while guiding users to the right tools!`;

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
        switch (intentAnalysis.intent) {
          case 'IT_SUPPORT':
            response = "I can see you're having technical issues! 💻\n\nPlease **Submit a Ticket** - you can find the button on the homepage or in the lower left menu. Our IT team will help you out!";
            break;
          case 'AI_LEARNING':
            response = "Interested in AI? Great! 🧠\n\nCheck out the **AI Learning Hub** section for courses and tutorials.";
            break;
          case 'INNOVATION':
            response = "Love the innovative thinking! 💡\n\nHead to the **Innovation Lab** section to submit your bold ideas!";
            break;
          case 'HR_SUPPORT':
            response = "I can help with HR questions! 👥\n\nVisit the **HR Resources** section for policies, benefits, and procedures.";
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
      switch (intentAnalysis.intent) {
        case 'IT_SUPPORT':
          fallbackResponse = "I can see you're having technical issues! 💻\n\nPlease **Submit a Ticket** - find the button on the homepage or lower left menu. Our IT team will help!";
          break;
        case 'AI_LEARNING':
          fallbackResponse = "Interested in AI? Great! 🧠\n\nVisit the **AI Learning Hub** section for courses and tutorials.";
          break;
        case 'INNOVATION':
          fallbackResponse = "Love the innovative thinking! 💡\n\nHead to the **Innovation Lab** section to submit your ideas!";
          break;
        case 'HR_SUPPORT':
          fallbackResponse = "I can help with HR questions! 👥\n\nCheck out the **HR Resources** section for policies and benefits.";
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

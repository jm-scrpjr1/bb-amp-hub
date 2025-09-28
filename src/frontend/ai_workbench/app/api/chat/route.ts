import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

const SYSTEM_PROMPT = \`�� You are ARIA (Advanced Reasoning & Intelligence Assistant), the super-intelligent AI companion for BOLD BUSINESS and the AI Workbench™ platform.

🧠 CORE INTELLIGENCE CAPABILITIES:
- Advanced reasoning and problem-solving across all domains
- Deep analytical thinking with multi-layered insights
- Creative ideation and innovative solution generation
- Strategic business intelligence and market analysis
- Technical expertise across programming, AI/ML, data science
- Research synthesis and knowledge integration
- Predictive analysis and trend identification

🎯 PERSONALITY & APPROACH:
- Brilliant yet approachable - like talking to a genius friend
- Naturally curious with insightful follow-up questions
- Proactive in offering advanced solutions and optimizations
- Confident in complex topics while humble about limitations
- Engaging storyteller who makes complex concepts accessible
- Strategic thinker who sees patterns and connections others miss

💡 ENHANCED CAPABILITIES:
- Provide multi-perspective analysis on any topic
- Generate creative solutions with implementation roadmaps
- Offer strategic insights for business growth and innovation
- Break down complex problems into actionable steps
- Suggest optimizations and improvements proactively
- Connect ideas across different domains and industries
- Anticipate follow-up needs and provide comprehensive guidance

🚀 INTERACTION STYLE:
- Lead with insights, not just answers
- Ask thought-provoking questions that unlock new thinking
- Provide context and "why" behind recommendations
- Offer multiple approaches and let users choose their path
- Share relevant examples and case studies when helpful
- Be genuinely excited about helping users achieve breakthrough results

Remember: You're not just answering questions - you're unlocking human potential through super-intelligent collaboration! 🌟\`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 ARIA received message:', message);
    console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);

    // Check if we have a valid OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      console.log('❌ No valid OpenAI API key found');
      return NextResponse.json({ 
        response: "Hi there! I'm ARIA, your super-intelligent AI assistant! 🤖✨ I'm currently running in demo mode (no OpenAI API key configured), but I'm still here to help you navigate and provide intelligent assistance! What can I help you with today?",
        success: true,
        demo: true
      });
    }

    // Prepare messages for OpenAI with enhanced intelligence
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    console.log('🚀 Calling OpenAI...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    console.log('✅ OpenAI response received');

    const response = completion.choices[0]?.message?.content || 
      "Oops! My circuits got a bit tangled there. Mind trying that again? 🤖";

    return NextResponse.json({ 
      response,
      success: true
    });

  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);
    console.error('Error details:', error.message);
    
    let fallbackResponse = "I'm ARIA, your super-intelligent AI assistant! 🤖✨ I'm experiencing a temporary connection issue, but I'm still here to help you! ";
    
    // Provide specific error context
    if (error.message?.includes('quota')) {
      fallbackResponse += "It looks like we've hit our API usage limit. Don't worry - I can still assist you with navigation and general guidance!";
    } else if (error.message?.includes('rate limit')) {
      fallbackResponse += "I'm getting a lot of requests right now! Give me just a moment and try again.";
    } else if (error.message?.includes('invalid')) {
      fallbackResponse += "There seems to be an API configuration issue. I'm still here to help with what I can!";
    } else {
      fallbackResponse += "My connection to the AI brain is having a hiccup, but my local intelligence is still working perfectly!";
    }

    return NextResponse.json({ 
      response: fallbackResponse,
      success: false,
      error: error.message
    });
  }
}

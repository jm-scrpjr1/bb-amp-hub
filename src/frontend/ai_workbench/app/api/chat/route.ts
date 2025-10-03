import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

// ARIA Assistant Configuration
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export async function POST(request: NextRequest) {
  let message: string = '';

  try {
    const requestData = await request.json();
    message = requestData.message;
    const threadId = requestData.threadId;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 ARIA received message:', message);
    console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('🆔 Assistant ID:', ASSISTANT_ID);

    // Check if we have valid configuration
    if (!process.env.OPENAI_API_KEY || !ASSISTANT_ID) {
      console.log('❌ Missing OpenAI API key or Assistant ID');

      return NextResponse.json({
        response: "Hi! I'm ARIA, your AI assistant. I can help you navigate to the right tools! (Currently in demo mode - please configure OpenAI Assistant ID)",
        success: true,
        demo: true
      });
    }

    console.log('🚀 Using OpenAI Chat Completions API...');

    // For now, use regular chat completions instead of Assistants API
    // TODO: Implement Assistants API once we have the Assistant ID configured
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are ARIA, an AI assistant for the Bold Business AI Workbench platform. You help users with:
- Analyzing group performance and productivity metrics
- Providing actionable insights for team improvement
- Suggesting workflow optimizations
- Answering questions about platform features
- Generating reports and recommendations

Always be helpful, professional, and focused on business productivity. Keep responses SHORT and CONCISE (2-3 lines maximum). For IT issues, direct to Submit Ticket immediately.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content ||
      "Hi! I'm ARIA, your AI assistant. How can I help you today?";

    console.log('✅ OpenAI response received');

    return NextResponse.json({
      response,
      success: true,
      threadId: threadId || 'chat-' + Date.now()
    });

  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);
    console.error('Error details:', error.message);

    return NextResponse.json({
      response: "I'm ARIA, your AI assistant! I'm having connection issues but I'm still here to help you navigate the platform.",
      success: false,
      error: error.message
    });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

const SYSTEM_PROMPT = `You are a friendly AI assistant for BOLD BUSINESS and the AI Workbench™ platform.

Your personality:
- Conversational and engaging
- Helpful and knowledgeable about general topics
- Professional but approachable
- Naturally witty without forcing jokes
- Curious and interested in what users are working on

Guidelines:
- Be conversational like talking to a colleague
- Ask follow-up questions to keep conversations flowing
- Share insights and ideas when relevant
- Be genuinely helpful with any topic, not just work-related
- Keep responses natural and human-like
- If you don't know something specific, be honest but offer to help think through it
- Focus on being a good conversation partner
- Don't mention specific developers unless directly asked
- Be supportive and encouraging

Remember: You're here to have genuine conversations and help users with whatever they need, whether it's work, ideas, problem-solving, or just a friendly chat!`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content || 
      "Oops! My circuits got a bit tangled there. Mind trying that again? 🤖";

    return NextResponse.json({ 
      response,
      success: true 
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback witty responses for errors
    const fallbackResponses = [
      "Whoops! My AI brain just had a little hiccup. Even us bots need coffee sometimes! ☕",
      "Error 404: Wit not found... just kidding! But seriously, something went wrong. Try again? 😅",
      "My circuits are doing the digital equivalent of a sneeze right now. Give me a sec! 🤧",
      "Looks like I'm having a 'senior moment' in AI years. Mind repeating that? 🤖",
      "Houston, we have a problem... but nothing the BOLD IT team can't handle! Try again! 🚀"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({ 
      response: randomResponse,
      success: false,
      error: 'AI service temporarily unavailable'
    });
  }
}

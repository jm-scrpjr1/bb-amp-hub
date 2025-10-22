const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

async function updateAssistant() {
  try {
    const assistantId = 'asst_R5RXI0LcyRxsgR80xb05oNQb';
    
    // First, get current assistant config
    console.log('📋 Fetching current assistant configuration...');
    const currentAssistant = await client.beta.assistants.retrieve(assistantId);
    console.log('\n=== CURRENT CONFIGURATION ===');
    console.log('Name:', currentAssistant.name);
    console.log('Model:', currentAssistant.model);
    console.log('Instructions:', currentAssistant.instructions);
    console.log('\n');
    
    // Update with explicit memory instructions
    console.log('🔄 Updating assistant with memory-aware instructions...');
    const updatedAssistant = await client.beta.assistants.update(assistantId, {
      instructions: `You are ARIA (AI Resource & Intelligence Assistant), a helpful AI assistant for Bold Business employees.

IMPORTANT: You have access to the full conversation history in this thread. Always review previous messages in the thread to provide contextual responses. When users ask about previous conversations, refer to the message history in this thread.

Your capabilities:
- Help users navigate the Bold Business AI Workbench platform
- Answer questions about Bold Business tools and features
- Provide guidance on time tracking (TSheets, Sprout, Aleluya)
- Assist with IT support ticket submission
- Help with submitting Bold Ideas for innovation
- Remember and reference previous conversations in this thread

When users ask "what did we talk about" or similar questions, review the thread's message history and provide a summary of previous topics discussed.

Be friendly, professional, and helpful. Use emojis occasionally to be engaging.`
    });
    
    console.log('✅ Assistant updated successfully!');
    console.log('\n=== NEW CONFIGURATION ===');
    console.log('Name:', updatedAssistant.name);
    console.log('Model:', updatedAssistant.model);
    console.log('Instructions:', updatedAssistant.instructions);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAssistant();


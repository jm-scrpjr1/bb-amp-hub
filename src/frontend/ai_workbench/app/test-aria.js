// Test script to verify ARIA OpenAI Assistant integration
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

const ARIA_ASSISTANT_ID = 'asst_R5RXI0LcyRxsgR80xb05oNQb';

async function testARIA() {
  try {
    console.log('🧪 Testing ARIA Assistant Integration...');
    
    // Create a thread
    console.log('🆕 Creating thread...');
    const thread = await openai.beta.threads.create();
    console.log('✅ Thread created:', thread.id);
    
    // Add a message
    console.log('💬 Adding message...');
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Hello ARIA! Can you help me with Bold Business?'
    });
    
    // Run the assistant
    console.log('🏃‍♂️ Running ARIA...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ARIA_ASSISTANT_ID
    });
    console.log('✅ Run created:', run.id);
    
    // Wait for completion
    console.log('⏳ Waiting for response...');
    console.log('Debug - Thread ID:', thread.id);
    console.log('Debug - Run ID:', run.id);
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Status:', runStatus.status);
    }
    
    if (runStatus.status === 'completed') {
      // Get the response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];
      
      if (lastMessage && lastMessage.role === 'assistant') {
        console.log('✅ ARIA Response:');
        console.log(lastMessage.content[0].text.value);
      }
    } else {
      console.error('❌ Run failed with status:', runStatus.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testARIA();

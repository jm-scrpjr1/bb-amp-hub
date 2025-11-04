require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

async function testThreadCreation() {
  console.log('🧪 Testing OpenAI thread creation...');
  console.log('⏱️  Start time:', new Date().toISOString());
  
  const startTime = Date.now();
  
  try {
    const thread = await client.beta.threads.create();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('✅ Thread created successfully!');
    console.log('📋 Thread ID:', thread.id);
    console.log('⏱️  Duration:', duration, 'seconds');
    console.log('⏱️  End time:', new Date().toISOString());
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('❌ Thread creation failed!');
    console.error('⏱️  Duration before failure:', duration, 'seconds');
    console.error('❌ Error:', error.message);
    console.error('📊 Status:', error.status);
  }
}

testThreadCreation();


// Simple test to check if ARIA assistant exists
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
  organization: 'org-cRVzeAj1CBsZgGArW3a3aVIx',
});

const ARIA_ASSISTANT_ID = 'asst_R5RXI0LcyRxsgR80xb05oNQb';

async function testAssistant() {
  try {
    console.log('🔍 Checking ARIA Assistant...');
    
    // Try to retrieve the assistant
    const assistant = await openai.beta.assistants.retrieve(ARIA_ASSISTANT_ID);
    console.log('✅ ARIA Assistant found:');
    console.log('Name:', assistant.name);
    console.log('Model:', assistant.model);
    console.log('Instructions length:', assistant.instructions?.length || 0);
    
  } catch (error) {
    console.error('❌ Assistant test failed:', error.message);
  }
}

testAssistant();

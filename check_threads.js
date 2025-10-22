const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

async function checkThreads() {
  try {
    // Check jmadrino's thread
    console.log('=== JMADRINO THREAD ===');
    const jmadrinoMessages = await client.beta.threads.messages.list('thread_Oa5QEuGShKE0Dl3NKvEhYM5A');
    console.log('Message count:', jmadrinoMessages.data.length);
    jmadrinoMessages.data.slice(0, 5).forEach((msg, i) => {
      console.log('Message', i + 1, '(' + msg.role + '):', msg.content[0]?.text?.value?.substring(0, 100));
    });
    
    console.log('\n=== LCILLAN THREAD ===');
    const lcillanMessages = await client.beta.threads.messages.list('thread_sI5bMlXX0akzDT5L4YkrWrxL');
    console.log('Message count:', lcillanMessages.data.length);
    lcillanMessages.data.slice(0, 5).forEach((msg, i) => {
      console.log('Message', i + 1, '(' + msg.role + '):', msg.content[0]?.text?.value?.substring(0, 100));
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkThreads();


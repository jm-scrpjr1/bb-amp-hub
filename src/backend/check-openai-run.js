require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

async function checkRunStatus() {
  const threadId = 'thread_TdQax6Eq6vdkzirUKFSJN40N';
  const runId = 'run_kG3Wd3qJ8XUOUR9FBSyGRPYu';

  try {
    console.log('🔍 Checking OpenAI run status...');
    console.log('Thread ID:', threadId);
    console.log('Run ID:', runId);
    console.log('');

    const run = await client.beta.threads.runs.retrieve(runId, {
      thread_id: threadId
    });

    console.log('📊 Run Status:', run.status);
    console.log('📅 Created At:', new Date(run.created_at * 1000).toISOString());
    console.log('⏱️  Started At:', run.started_at ? new Date(run.started_at * 1000).toISOString() : 'N/A');
    console.log('✅ Completed At:', run.completed_at ? new Date(run.completed_at * 1000).toISOString() : 'N/A');
    console.log('❌ Failed At:', run.failed_at ? new Date(run.failed_at * 1000).toISOString() : 'N/A');
    console.log('');

    if (run.status === 'failed') {
      console.log('❌ Failure Details:');
      console.log('Last Error:', run.last_error);
    }

    if (run.status === 'completed') {
      console.log('✅ Run completed successfully!');
      console.log('');
      console.log('📄 Fetching messages...');
      const messages = await client.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (assistantMessage) {
        const responseText = assistantMessage.content[0]?.text?.value || 'No response';
        console.log('📝 Response preview:', responseText.substring(0, 500));
      }
    }

    // Calculate duration
    if (run.started_at && run.completed_at) {
      const duration = run.completed_at - run.started_at;
      console.log('⏱️  Duration:', duration, 'seconds');
    } else if (run.started_at) {
      const now = Math.floor(Date.now() / 1000);
      const duration = now - run.started_at;
      console.log('⏱️  Running for:', duration, 'seconds');
    }

  } catch (error) {
    console.error('❌ Error checking run status:', error.message);
  }
}

checkRunStatus();


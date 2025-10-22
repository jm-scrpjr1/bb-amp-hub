const OpenAI = require('openai');

class ResumeBuilderService {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Resume Builder Assistant ID
    this.assistantId = 'asst_9YxNyc29mE6NXFHZmsJoQel7';

    // Store active threads
    this.activeThreads = new Map();
  }

  async createThread() {
    try {
      const thread = await this.client.beta.threads.create();
      console.log('📄 Created new Resume Builder thread:', thread.id);
      return thread.id;
    } catch (error) {
      console.error('Error creating Resume Builder thread:', error);
      throw error;
    }
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      console.log('📤 Uploading file to OpenAI:', fileName);
      
      // Create a File object from buffer
      const file = await this.client.files.create({
        file: new File([fileBuffer], fileName),
        purpose: 'assistants'
      });

      console.log('✅ File uploaded successfully:', file.id);
      return file.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async processResume(message, threadId = null, fileId = null, userId = null) {
    try {
      console.log('📄 Resume Builder processing request');
      console.log('🧵 Thread ID:', threadId || 'new');
      console.log('📎 File ID:', fileId || 'none');
      console.log('👤 User ID:', userId || 'anonymous');

      // Create new thread if not provided
      let currentThreadId = threadId;
      if (!currentThreadId || currentThreadId === 'new') {
        currentThreadId = await this.createThread();
      }

      // Add message to thread with file attachment if provided
      const messageParams = {
        role: 'user',
        content: message
      };

      if (fileId) {
        messageParams.attachments = [{
          file_id: fileId,
          tools: [{ type: 'file_search' }]
        }];
      }

      await this.client.beta.threads.messages.create(
        currentThreadId,
        messageParams
      );

      console.log('💬 Message added to thread');

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(
        currentThreadId,
        {
          assistant_id: this.assistantId
        }
      );

      console.log('🏃 Started Resume Builder run:', run.id);

      // Poll for completion
      let runStatus = await this.client.beta.threads.runs.retrieve(
        currentThreadId,
        run.id
      );

      let attempts = 0;
      const maxAttempts = 60; // 60 seconds max wait

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
          console.error('❌ Run failed with status:', runStatus.status);
          throw new Error(`Assistant run ${runStatus.status}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(
          currentThreadId,
          run.id
        );
        attempts++;
        console.log(`⏳ Run status: ${runStatus.status} (${attempts}/${maxAttempts})`);
      }

      if (runStatus.status !== 'completed') {
        throw new Error('Assistant run timed out');
      }

      // Get the assistant's response
      const messages = await this.client.beta.threads.messages.list(
        currentThreadId
      );

      const assistantMessage = messages.data.find(
        msg => msg.role === 'assistant' && msg.run_id === run.id
      );

      if (!assistantMessage) {
        throw new Error('No response from assistant');
      }

      const responseText = assistantMessage.content[0]?.text?.value || 'No response generated';

      console.log('✅ Resume Builder responded');

      return {
        success: true,
        response: responseText,
        threadId: currentThreadId
      };

    } catch (error) {
      console.error('❌ Resume Builder error:', error);
      return {
        success: false,
        error: error.message,
        threadId: threadId
      };
    }
  }
}

module.exports = new ResumeBuilderService();


const OpenAI = require('openai');
const AriaConversationService = require('./ariaConversationService');

class OpenAIService {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    });

    // Assistant ID from your memory
    this.assistantId = 'asst_R5RXI0LcyRxsgR80xb05oNQb';

    // Store active threads
    this.activeThreads = new Map();
  }

  async createThread() {
    try {
      const thread = await this.client.beta.threads.create();
      console.log('🧵 Created new thread:', thread.id);
      return thread.id;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  async sendMessage(message, threadId = null, userId = null) {
    try {
      // Get or create thread for this user
      if (!threadId && userId) {
        const conversation = await AriaConversationService.getOrCreateConversation(userId);
        if (conversation) {
          threadId = conversation.thread_id;
          console.log(`📚 Resuming thread ${threadId} for user ${userId}`);
        }
      }

      // Create new thread if none provided
      if (!threadId) {
        threadId = await this.createThread();

        // Save new conversation if userId provided
        if (userId) {
          await AriaConversationService.saveConversation(userId, threadId);
          console.log(`💾 Saved new conversation for user ${userId}`);
        }
      }

      console.log('🤖 ARIA processing message:', message);
      console.log('🧵 Using thread:', threadId);

      // Add message to thread
      await this.client.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message
      });

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId
      });

      console.log('🏃 Started run:', run.id);

      // Wait for completion
      let runStatus = await this.client.beta.threads.runs.retrieve(run.id, { thread_id: threadId });

      // Poll for completion (with timeout)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Assistant response timeout');
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        runStatus = await this.client.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
        attempts++;

        console.log('⏳ Run status:', runStatus.status, `(${attempts}/${maxAttempts})`);
      }

      if (runStatus.status === 'completed') {
        // Get the assistant's response
        const messages = await this.client.beta.threads.messages.list(threadId);
        const assistantMessage = messages.data.find(
          msg => msg.role === 'assistant' && msg.run_id === run.id
        );

        if (assistantMessage && assistantMessage.content[0]) {
          const response = assistantMessage.content[0].text.value;
          console.log('✅ ARIA responded:', response.substring(0, 100) + '...');

          // Update conversation metadata
          if (userId) {
            await AriaConversationService.updateConversationMetadata(userId, threadId, message);
          }

          return {
            response,
            threadId,
            success: true,
            aiPowered: true
          };
        }
      } else if (runStatus.status === 'failed') {
        console.error('❌ Assistant run failed:', runStatus.last_error);
        throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
      }

      throw new Error(`Unexpected run status: ${runStatus.status}`);

    } catch (error) {
      console.error('❌ OpenAI Service error:', error);
      
      // Return fallback response
      return {
        response: "I'm having trouble connecting to my AI circuits right now. Please try again in a moment! 🤖⚡",
        threadId,
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  async getThreadMessages(threadId) {
    try {
      const messages = await this.client.beta.threads.messages.list(threadId);
      return messages.data.map(msg => ({
        role: msg.role,
        content: msg.content[0]?.text?.value || '',
        timestamp: new Date(msg.created_at * 1000)
      }));
    } catch (error) {
      console.error('Error getting thread messages:', error);
      return [];
    }
  }

  // Health check method
  async healthCheck() {
    try {
      // Try to retrieve the assistant to verify connection
      const assistant = await this.client.beta.assistants.retrieve(this.assistantId);
      return {
        status: 'healthy',
        assistantName: assistant.name,
        assistantId: this.assistantId,
        apiKeyConfigured: !!process.env.OPENAI_API_KEY
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        apiKeyConfigured: !!process.env.OPENAI_API_KEY
      };
    }
  }
}

module.exports = new OpenAIService();

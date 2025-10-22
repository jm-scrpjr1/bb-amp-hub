const { prisma } = require('../lib/db');

class AriaConversationService {
  /**
   * Get or create a conversation thread for a user
   * @param {string} userId - User email or ID
   * @param {string} threadId - Optional existing OpenAI thread ID
   * @returns {Promise<Object>} Conversation record with threadId
   */
  static async getOrCreateConversation(userId, threadId = null) {
    try {
      // If threadId provided, try to find existing conversation
      if (threadId) {
        const existing = await prisma.aria_conversations.findUnique({
          where: { thread_id: threadId }
        });

        if (existing) {
          console.log(`📚 Found existing conversation for user ${userId}`);
          return existing;
        }
      }

      // Try to find active conversation for this user
      const userConversation = await prisma.aria_conversations.findFirst({
        where: {
          user_id: userId,
          is_active: true
        },
        orderBy: {
          last_message_at: 'desc'
        }
      });

      if (userConversation) {
        console.log(`📚 Resuming conversation for user ${userId}`);
        return userConversation;
      }

      // Create new conversation if threadId provided
      if (threadId) {
        console.log(`✨ Creating new conversation for user ${userId}`);
        const newConversation = await prisma.aria_conversations.create({
          data: {
            id: 'cm' + Math.random().toString(36).substr(2, 20), // Generate unique ID
            user_id: userId,
            thread_id: threadId,
            message_count: 0,
            topics: [],
            is_active: true,
            last_message_at: new Date() // Add timestamp
          }
        });

        return newConversation;
      }

      // No conversation found and no threadId provided
      return null;

    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  }

  /**
   * Save a new conversation thread
   * @param {string} userId - User email or ID
   * @param {string} threadId - OpenAI thread ID
   * @returns {Promise<Object>} Created conversation record
   */
  static async saveConversation(userId, threadId) {
    try {
      console.log(`💾 Saving new conversation for user ${userId}, thread ${threadId}`);

      const conversation = await prisma.aria_conversations.create({
        data: {
          id: 'cm' + Math.random().toString(36).substr(2, 20), // Generate unique ID
          user_id: userId,
          thread_id: threadId,
          message_count: 0,
          topics: [],
          is_active: true,
          last_message_at: new Date() // Add timestamp
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      // If duplicate, return existing
      if (error.code === 'P2002') {
        return await prisma.aria_conversations.findUnique({
          where: { thread_id: threadId }
        });
      }
      throw error;
    }
  }

  /**
   * Update conversation metadata after a message
   * @param {string} userId - User email or ID
   * @param {string} threadId - OpenAI thread ID
   * @param {string} userMessage - User's message text
   * @returns {Promise<void>}
   */
  static async updateConversationMetadata(userId, threadId, userMessage = '') {
    try {
      const conversation = await this.getOrCreateConversation(userId, threadId);
      
      if (!conversation) {
        console.warn(`⚠️ No conversation found for thread ${threadId}`);
        return;
      }

      // Extract topics from message (simple keyword extraction)
      const topics = this.extractTopics(userMessage);
      const existingTopics = conversation.topics || [];
      const updatedTopics = [...new Set([...existingTopics, ...topics])].slice(0, 10); // Keep max 10 topics

      await prisma.aria_conversations.update({
        where: { id: conversation.id },
        data: {
          message_count: { increment: 1 },
          topics: updatedTopics,
          last_message_at: new Date()
        }
      });

      console.log(`📊 Updated conversation metadata for ${userId}`);
    } catch (error) {
      console.error('Error updating conversation metadata:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Save a message to the database (optional - for analytics)
   * @param {string} conversationId - Conversation ID
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   * @param {number} tokenCount - Optional token count
   * @returns {Promise<Object>} Created message record
   */
  static async saveMessage(conversationId, role, content, tokenCount = null) {
    try {
      const message = await prisma.aria_messages.create({
        data: {
          conversation_id: conversationId,
          role,
          content,
          token_count: tokenCount
        }
      });

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't throw - message saving is optional
      return null;
    }
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - User email or ID
   * @param {number} limit - Number of conversations to return
   * @returns {Promise<Array>} Array of conversation records
   */
  static async getUserConversations(userId, limit = 10) {
    try {
      const conversations = await prisma.aria_conversations.findMany({
        where: { user_id: userId },
        orderBy: { last_message_at: 'desc' },
        take: limit,
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      });

      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Get conversation analytics for a user
   * @param {string} userId - User email or ID
   * @returns {Promise<Object>} Analytics data
   */
  static async getConversationAnalytics(userId) {
    try {
      const conversations = await prisma.aria_conversations.findMany({
        where: { user_id: userId }
      });

      const totalMessages = conversations.reduce((sum, conv) => sum + conv.message_count, 0);
      const allTopics = conversations.flatMap(conv => conv.topics || []);
      const topicFrequency = {};
      
      allTopics.forEach(topic => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });

      const topTopics = Object.entries(topicFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

      return {
        totalConversations: conversations.length,
        totalMessages,
        activeConversations: conversations.filter(c => c.is_active).length,
        topTopics,
        lastConversation: conversations[0]?.last_message_at || null
      };
    } catch (error) {
      console.error('Error getting conversation analytics:', error);
      return null;
    }
  }

  /**
   * Extract topics from message text (simple keyword extraction)
   * @param {string} message - Message text
   * @returns {Array<string>} Array of topics
   */
  static extractTopics(message) {
    if (!message) return [];

    const keywords = {
      'group': ['group', 'team', 'members', 'department'],
      'analytics': ['analytics', 'metrics', 'performance', 'data', 'report'],
      'assessment': ['assessment', 'test', 'quiz', 'evaluation'],
      'training': ['training', 'learn', 'course', 'education'],
      'ticket': ['ticket', 'issue', 'problem', 'bug', 'support'],
      'idea': ['idea', 'suggestion', 'improvement', 'feature'],
      'help': ['help', 'how', 'what', 'why', 'guide']
    };

    const messageLower = message.toLowerCase();
    const topics = [];

    for (const [topic, words] of Object.entries(keywords)) {
      if (words.some(word => messageLower.includes(word))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Archive old conversations (cleanup)
   * @param {number} daysOld - Archive conversations older than this many days
   * @returns {Promise<number>} Number of conversations archived
   */
  static async archiveOldConversations(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.aria_conversations.updateMany({
        where: {
          last_message_at: { lt: cutoffDate },
          is_active: true
        },
        data: {
          is_active: false
        }
      });

      console.log(`🗄️ Archived ${result.count} old conversations`);
      return result.count;
    } catch (error) {
      console.error('Error archiving conversations:', error);
      return 0;
    }
  }
}

module.exports = AriaConversationService;


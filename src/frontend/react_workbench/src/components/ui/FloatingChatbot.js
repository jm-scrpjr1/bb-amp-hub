import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import environmentConfig from '../../config/environment';

// Simple markdown parser for ARIA responses
const parseMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      elements.push(<br key={`br-${index}`} />);
      return;
    }

    // Handle numbered lists (1., 2., 3., etc.)
    const numberedListMatch = trimmedLine.match(/^(\d+\.)\s*(.*)$/);
    if (numberedListMatch) {
      const [, number, content] = numberedListMatch;
      // Parse bold text in content - handle both single and double asterisks
      const parsedContent = content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
      elements.push(
        <div key={`numbered-${index}`} className="flex items-start space-x-2 mb-2">
          <span className="font-medium text-gray-700 flex-shrink-0">{number}</span>
          <span
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
        </div>
      );
      return;
    }

    // Handle regular paragraphs with bold text - handle both single and double asterisks
    const parsedLine = trimmedLine
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    elements.push(
      <p
        key={`p-${index}`}
        className="text-sm mb-2 last:mb-0"
        dangerouslySetInnerHTML={{ __html: parsedLine }}
      />
    );
  });

  return elements;
};

// Robot Icon Component
const RobotIcon = ({ className = "w-[2.96rem] h-[2.96rem]" }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <img
      src="/images/chatbot-robot.png"
      alt="ARIA - Bold Business AI Assistant"
      className="w-full h-full object-contain"
    />
  </div>
);

const FloatingChatbot = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState('bottom-right');
  const [isHovered, setIsHovered] = useState(false);
  const [currentBubbleMessage, setCurrentBubbleMessage] = useState('');
  const [threadId, setThreadId] = useState(null);

  const chatBubbleMessages = [
    "How can I help you today?",
    "Ready to boost productivity?",
    "Need AI assistance?",
    "Let's get amplified results!",
    "Hi there! I'm ARIA ✨"
  ];

  const getWelcomeMessage = () => {
    if (user?.name) {
      const firstName = user.name.split(' ')[0];
      return `Hey ${firstName}! 👋 I'm ARIA, your productivity engineer at BOLD BUSINESS. I'm here to help you select your tools, start your work, and get amplified results. Ready to unlock your potential? What can I help you with today?`;
    }
    return 'Hey there! 👋 I\'m ARIA, your productivity engineer at BOLD BUSINESS. I\'m here to help you select your tools, start your work, and achieve amplified results. What\'s on your mind today?';
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    const randomMessage = chatBubbleMessages[Math.floor(Math.random() * chatBubbleMessages.length)];
    setCurrentBubbleMessage(randomMessage);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentBubbleMessage('');
  };

  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email) {
      const storageKey = `aria_conversation_${user.email}`;
      const threadStorageKey = `aria_thread_${user.email}`;

      try {
        const savedMessages = localStorage.getItem(storageKey);
        const savedThreadId = localStorage.getItem(threadStorageKey);

        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } else {
          // Set initial welcome message if no saved conversation
          setMessages([{
            id: '1',
            text: getWelcomeMessage(),
            isBot: true,
            timestamp: new Date()
          }]);
        }

        if (savedThreadId) {
          setThreadId(savedThreadId);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        // Fallback to welcome message
        setMessages([{
          id: '1',
          text: getWelcomeMessage(),
          isBot: true,
          timestamp: new Date()
        }]);
      }

      setIsInitialized(true);
    }
  }, [user?.email]);

  // Save conversation to localStorage whenever messages or threadId change
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.email && isInitialized) {
      const storageKey = `aria_conversation_${user.email}`;
      const threadStorageKey = `aria_thread_${user.email}`;

      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
        if (threadId) {
          localStorage.setItem(threadStorageKey, threadId);
        }
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  }, [messages, threadId, user?.email, isInitialized]);

  // Clear conversation when user logs out
  useEffect(() => {
    if (!user?.email && isInitialized) {
      // User logged out, clear conversation data
      setMessages([]);
      setThreadId(null);
      setIsInitialized(false);

      // Clear localStorage for all users (since we don't know which user logged out)
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('aria_conversation_') || key.startsWith('aria_thread_')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  }, [user?.email, isInitialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage('');

    // Show typing indicator
    const typingMessage = {
      id: 'typing',
      text: '🤖 Thinking...',
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch(`${environmentConfig.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          threadId: threadId, // Include thread ID for conversation continuity
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      // Store thread ID for conversation continuity
      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
      }

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const botResponse = {
          id: (Date.now() + 1).toString(),
          text: data.response || "Oops! Something went wrong. Try asking me again! 😅",
          isBot: true,
          timestamp: new Date()
        };
        return [...withoutTyping, botResponse];
      });

    } catch (error) {
      console.error('Chat error:', error);

      // Remove typing indicator and show error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const errorResponse = {
          id: (Date.now() + 1).toString(),
          text: "Whoops! My circuits got a bit tangled. The BOLD IT team will have this fixed in no time! 🔧",
          isBot: true,
          timestamp: new Date()
        };
        return [...withoutTyping, errorResponse];
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePosition = () => {
    const positions = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    setPosition(positions[nextIndex]);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  // Don't render ARIA if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className={`fixed z-[100000] ${className}`}>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed ${getPositionClasses()}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Cloud Chat Bubble - Positioned to the left like reference */}
            <AnimatePresence>
              {isHovered && currentBubbleMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  className="absolute top-1/2 -left-52 transform -translate-y-1/2 z-10"
                >
                  <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-700 font-medium leading-relaxed text-center whitespace-nowrap">
                      {currentBubbleMessage}
                    </div>

                    {/* Cloud-like tail with multiple bubbles pointing to ARIA */}
                    <div className="absolute top-1/2 -right-1 transform -translate-y-1/2">
                      {/* Large bubble */}
                      <div className="w-4 h-4 bg-white rounded-full border border-gray-100 shadow-md"></div>
                      {/* Medium bubble */}
                      <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full border border-gray-100 shadow-md"></div>
                      {/* Small bubble */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full border border-gray-100 shadow-sm"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 text-white rounded-full transition-all duration-300 flex items-center justify-center group overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #1e40af, #1e3a8a, #1d4ed8)',
                backgroundSize: '400% 400%',
                boxShadow: `
                  0 0 0 4px rgba(29, 78, 216, 0.2),
                  0 0 0 8px rgba(29, 78, 216, 0.1),
                  0 20px 40px rgba(29, 78, 216, 0.4),
                  0 40px 80px rgba(29, 78, 216, 0.2),
                  inset 0 2px 4px rgba(255, 255, 255, 0.2),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.2)
                `
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                y: [0, -8, 0],
                rotateY: [0, 5, -5, 0]
              }}
              transition={{
                backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{
                scale: 1.15,
                y: -12,
                rotateY: 15,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* ARIA Robot */}
              <motion.div
                className="relative z-10"
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.08, 1],
                  rotateY: [0, 15, -15, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <RobotIcon className="w-[3rem] h-[3rem]" />
              </motion.div>

              {/* Notification dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border border-white"
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-xs text-white font-bold">1</span>
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
              y: 50,
              x: 0
            }}
            animate={{
              scale: isMinimized ? 0.7 : 1,
              opacity: 1,
              y: 0,
              x: 0
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              y: 50
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={`fixed ${getPositionClasses()} ${isExpanded ? 'w-[600px]' : 'w-80'} bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-300/30 overflow-hidden transition-all duration-300`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(29, 78, 216, 0.3), 0 0 50px rgba(29, 78, 216, 0.4)'
            }}
          >
            {/* Enhanced Header */}
            <motion.div
              className="relative text-white p-4 flex items-center justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #1e40af, #1e3a8a, #1d4ed8)',
                backgroundSize: '400% 400%'
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="flex items-center space-x-3 relative z-10">
                <motion.div
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <RobotIcon className="w-[2.22rem] h-[2.22rem]" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm text-white">ARIA - Your Productivity Engineer</h3>
                  <motion.p
                    className="text-xs text-cyan-200"
                    animate={{
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Online • Ready to help
                  </motion.p>
                </div>
              </div>

              <div className="flex items-center space-x-2 relative z-10">
                <motion.button
                  onClick={togglePosition}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Change position"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className={`w-1 h-1 rounded-full ${position === 'top-left' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${position === 'top-right' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${position === 'bottom-left' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${position === 'bottom-right' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title={isExpanded ? "Make smaller" : "Make bigger"}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className={`border-2 border-white rounded transition-all ${isExpanded ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>

            {/* Chat Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Messages */}
                  <div className={`${isExpanded ? 'h-96' : 'h-64'} overflow-y-auto p-4 space-y-3 bg-gray-50/50 transition-all duration-300`}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-3xl ${
                            msg.isBot
                              ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 shadow-lg border border-blue-200'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                          }`}
                        >
                          {msg.isBot ? (
                            <div className="space-y-1">
                              {parseMarkdown(msg.text)}
                            </div>
                          ) : (
                            <p className="text-sm">{msg.text}</p>
                          )}
                          <p className={`text-xs mt-1 ${msg.isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                      <motion.button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingChatbot;

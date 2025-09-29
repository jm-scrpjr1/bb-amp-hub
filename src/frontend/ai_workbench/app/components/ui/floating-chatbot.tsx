"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from '@/components/icons';
import { useSession } from 'next-auth/react';
// import HolographicText from '@/components/effects/holographic-text';
// import TextScramble from '@/components/effects/text-scramble';
// import ParticleField from '@/components/effects/particle-field';

// Robot Icon Component matching the mockup
const RobotIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    {/* Robot Head */}
    <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner">
      {/* Robot Face Screen */}
      <div className="w-5 h-3 bg-gray-900 rounded-sm flex items-center justify-center relative overflow-hidden">
        {/* Eyes */}
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        {/* Mouth */}
        <div className="absolute bottom-0 w-2 h-0.5 bg-cyan-400 rounded-full opacity-80"></div>
      </div>
      {/* Antenna */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-gray-300"></div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
    </div>
  </div>
);

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface FloatingChatbotProps {
  className?: string;
}

export default function FloatingChatbot({ className = '' }: FloatingChatbotProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');

  const getWelcomeMessage = () => {
    if (session?.user?.name) {
      const firstName = session.user.name.split(' ')[0];
      return `Hey ${firstName}! 👋 I'm ARIA, your productivity engineer at BOLD BUSINESS. I'm here to help you select your tools, start your work, and get amplified results. Ready to unlock your potential? What can I help you with today?`;
    }
    return 'Hey there! 👋 I\'m ARIA, your productivity engineer at BOLD BUSINESS. I\'m here to help you select your tools, start your work, and achieve amplified results. What\'s on your mind today?';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: getWelcomeMessage(),
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage('');

    // Show typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      text: '🤖 Thinking...',
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const botResponse: ChatMessage = {
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
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Whoops! My circuits got a bit tangled. The BOLD IT team will have this fixed in no time! 🔧",
          isBot: true,
          timestamp: new Date()
        };
        return [...withoutTyping, errorResponse];
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePosition = () => {
    const positions: Array<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'> =
      ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
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
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, #2563eb, #06b6d4, #0ea5e9, #2563eb)',
                backgroundSize: '400% 400%'
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                boxShadow: [
                  '0 0 20px rgba(6, 229, 236, 0.3)',
                  '0 0 40px rgba(6, 229, 236, 0.6)',
                  '0 0 20px rgba(6, 229, 236, 0.3)'
                ]
              }}
              transition={{
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: '0 20px 40px rgba(6, 229, 236, 0.5)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-r from-blue-600/10 to-cyan-500/10"></div>

              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="relative z-10"
              >
                <RobotIcon className="w-10 h-10" />
              </motion.div>

              {/* Enhanced pulse effects */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-white"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5
                }}
              />

              {/* Holographic notification dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border border-white"
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 5px rgba(239, 68, 68, 0.5)',
                    '0 0 15px rgba(239, 68, 68, 0.8)',
                    '0 0 5px rgba(239, 68, 68, 0.5)'
                  ]
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
            className={`fixed ${getPositionClasses()} ${isExpanded ? 'w-[600px]' : 'w-80'} bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-cyan-200/30 overflow-hidden transition-all duration-300`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 229, 236, 0.2), 0 0 50px rgba(6, 229, 236, 0.3)'
            }}
          >
            {/* Enhanced Header */}
            <motion.div
              className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white p-4 flex items-center justify-between overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, #2563eb, #06b6d4, #0ea5e9, #2563eb)',
                backgroundSize: '400% 400%'
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Header background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-500/5"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <motion.div
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 10px rgba(255, 255, 255, 0.2)',
                      '0 0 20px rgba(255, 255, 255, 0.4)',
                      '0 0 10px rgba(255, 255, 255, 0.2)'
                    ]
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <RobotIcon className="w-6 h-6" />
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
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.isBot
                              ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
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
}

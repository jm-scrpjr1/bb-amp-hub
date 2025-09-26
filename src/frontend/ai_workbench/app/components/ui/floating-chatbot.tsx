"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from '@/components/icons';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hey there! 👋 I\'m your AI assistant here at BOLD BUSINESS. I\'m here to chat, help with ideas, answer questions, or just have a good conversation. What\'s on your mind today?',
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
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group"
              whileHover={{ 
                scale: 1.1,
                boxShadow: '0 20px 40px rgba(37, 99, 235, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
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
              >
                <RobotIcon className="w-10 h-10" />
              </motion.div>
              
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
              
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">1</span>
              </div>
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
            className={`fixed ${getPositionClasses()} w-80 bg-white rounded-2xl shadow-2xl border border-blue-200/50 overflow-hidden`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.1), 0 0 50px rgba(37, 99, 235, 0.15)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <RobotIcon className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-blue-100">Online • Ready to help</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePosition}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Change position"
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className={`w-1 h-1 rounded-full ${position === 'top-left' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${position === 'top-right' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${position === 'bottom-left' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                    <div className={`w-1 h-1 rounded-full ${position === 'bottom-right' ? 'bg-cyan-400' : 'bg-white/40'}`}></div>
                  </div>
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

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
                  <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
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

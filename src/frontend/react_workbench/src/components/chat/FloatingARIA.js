import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

const FloatingARIA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    // Simulate API call to ARIA
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    setMessage('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src="/images/AI AGENT 5.png"
                  alt="ARIA"
                  className="w-10 h-10 object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        </motion.button>

        {/* Cloud Chat Bubble with greeting */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="absolute bottom-full right-0 mb-6"
            >
              <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 px-6 py-4 max-w-xs">
                <p className="text-sm text-gray-700 font-medium leading-relaxed text-center">
                  How can I help you today, Ed?
                </p>

                {/* Cloud-like tail with multiple bubbles */}
                <div className="absolute top-full right-6 transform -translate-y-1">
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
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center space-x-3">
              <img
                src="/images/AI AGENT 5.png"
                alt="ARIA"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h3 className="font-semibold">ARIA</h3>
                <p className="text-xs text-blue-100">AI Assistant</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex items-start space-x-3">
                <img
                  src="/images/AI AGENT 5.png"
                  alt="ARIA"
                  className="w-8 h-8 object-contain mt-1 flex-shrink-0"
                />
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl px-4 py-3 max-w-xs shadow-sm border border-blue-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Hello! I'm ARIA, your AI assistant. How can I help you today?
                  </p>
                </div>
              </div>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <img
                    src="/images/AI AGENT 5.png"
                    alt="ARIA"
                    className="w-8 h-8 object-contain mt-1 flex-shrink-0"
                  />
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl px-4 py-3 shadow-sm border border-blue-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingARIA;

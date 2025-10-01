"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { X, Send, ExternalLink, MessageCircle } from '@/components/icons';
import GenieModal from './genie-modal';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
  recipientName: string;
  recipientAvatar?: string;
}

const DirectMessageModal = memo(function DirectMessageModal({ 
  isOpen, 
  onClose, 
  triggerElement, 
  recipientName,
  recipientAvatar 
}: DirectMessageModalProps) {
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    console.log('Sending message to:', recipientName, 'Message:', message);
    setMessage('');
    onClose();
  }, [message, recipientName, onClose]);

  const handleOpenStandalone = useCallback(() => {
    // Open standalone chat window
    const chatWindow = window.open(
      `/chat/direct/${encodeURIComponent(recipientName)}`,
      'directChat',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
    if (chatWindow) {
      chatWindow.focus();
    }
    onClose();
  }, [recipientName, onClose]);

  if (!mounted) return null;

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-blue-300/50"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.2), 0 0 50px rgba(37, 99, 235, 0.2)'
      }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-600/20 blur-sm -z-10" />
      
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-cyan-500/90 to-blue-600/90" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h2
                className="text-xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Message {recipientName}
              </motion.h2>
              <motion.p
                className="text-blue-100 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Send a direct message
              </motion.p>
            </div>
          </div>
          
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSendMessage} className="p-6 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="space-y-6">
          {/* Recipient Info */}
          <motion.div
            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold">
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{recipientName}</div>
              <div className="text-sm text-gray-500">Direct Message</div>
            </div>
          </motion.div>

          {/* Message Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-3">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 placeholder-gray-500"
              required
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="submit"
              disabled={!message.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
            
            <button
              type="button"
              onClick={handleOpenStandalone}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Chat Window</span>
            </button>
          </motion.div>
        </div>
      </form>
    </GenieModal>
  );
});

export default DirectMessageModal;

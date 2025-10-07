import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Send, ExternalLink, Users } from 'lucide-react';
import GenieModal from './GenieModal';

const GroupChatModal = ({ 
  isOpen, 
  onClose, 
  triggerElement, 
  groupName,
  memberCount = 5
}) => {
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    console.log('Sending message to group:', groupName, 'Message:', message);
    setMessage('');
    onClose();
  }, [message, groupName, onClose]);

  const handleOpenStandalone = useCallback(() => {
    // Open standalone chat window
    const chatWindow = window.open(
      `/chat/group/${encodeURIComponent(groupName)}`,
      'groupChat',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
    if (chatWindow) {
      chatWindow.focus();
    }
    onClose();
  }, [groupName, onClose]);

  if (!mounted) return null;

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-green-300/50"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.2), 0 0 50px rgba(34, 197, 94, 0.2)'
      }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-600/20 blur-sm -z-10" />
      
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 text-white p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-emerald-500/90 to-green-600/90" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h2
                className="text-xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {groupName}
              </motion.h2>
              <motion.p
                className="text-green-100 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {memberCount} members • Group chat
              </motion.p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleOpenStandalone}
              className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Open in new window"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your message to ${groupName}...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </motion.button>
          </div>
        </form>
      </div>
    </GenieModal>
  );
};

export default GroupChatModal;

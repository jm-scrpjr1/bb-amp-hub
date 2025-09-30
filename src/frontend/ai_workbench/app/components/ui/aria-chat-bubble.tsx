"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@/components/icons';
import { useSession } from 'next-auth/react';

interface AriaChatBubbleProps {
  className?: string;
}

export default function AriaChatBubble({ className = '' }: AriaChatBubbleProps) {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownInitial, setHasShownInitial] = useState(false);

  const getMessage = () => {
    if (session?.user?.name) {
      const firstName = session.user.name.split(' ')[0];
      return `How can I help you today, ${firstName}?`;
    }
    return 'How can I help you today?';
  };

  const showBubble = () => {
    setIsVisible(true);
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 8000);
  };

  const hideBubble = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // Show on initial load
    if (!hasShownInitial) {
      const timer = setTimeout(() => {
        showBubble();
        setHasShownInitial(true);
      }, 2000); // Show after 2 seconds on load

      return () => clearTimeout(timer);
    }
  }, [hasShownInitial]);

  useEffect(() => {
    // Show every 5 minutes (300000ms)
    const interval = setInterval(() => {
      if (!isVisible) {
        showBubble();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed bottom-24 right-6 z-50 ${className}`}
        >
          <div className="relative">
            {/* Chat Bubble */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-xs relative">
              {/* Close Button */}
              <div
                onClick={hideBubble}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </div>

              {/* ARIA Robot */}
              <div className="flex items-start space-x-3">
                <motion.div
                  className="w-10 h-10 flex-shrink-0"
                  animate={{
                    y: [0, -2, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src="/images/chatbot-robot.png"
                    alt="ARIA - Bold Business AI Assistant"
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <div className="flex-1 pt-1">
                  <div className="text-xs text-gray-500 mb-1">ARIA</div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {getMessage()}
                  </p>
                </div>
              </div>

              {/* Tail */}
              <div className="absolute bottom-0 right-6 transform translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-200 absolute top-0.5 left-0"></div>
              </div>
            </div>

            {/* Floating Animation */}
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-2xl opacity-20 -z-10"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.1, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

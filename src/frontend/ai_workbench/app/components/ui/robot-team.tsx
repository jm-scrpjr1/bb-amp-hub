"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RobotTeamProps {
  className?: string;
  showLabels?: boolean;
  animated?: boolean;
}

export default function RobotTeam({ 
  className = "w-64 h-32", 
  showLabels = false,
  animated = true 
}: RobotTeamProps) {
  return (
    <div className={`relative ${className}`}>
      {animated ? (
        <motion.img
          src="/images/robot-team.png"
          alt="Bold Business AI Robot Team"
          className="w-full h-full object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        />
      ) : (
        <img
          src="/images/robot-team.png"
          alt="Bold Business AI Robot Team"
          className="w-full h-full object-contain"
        />
      )}
      
      {showLabels && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-medium text-gray-700 shadow-md">
            Your AI Team is Ready
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Chatbot Robot Component
interface ChatbotRobotProps {
  className?: string;
  animated?: boolean;
}

export function ChatbotRobot({ 
  className = "w-12 h-12", 
  animated = true 
}: ChatbotRobotProps) {
  return (
    <div className={`relative ${className}`}>
      {animated ? (
        <motion.img
          src="/images/chatbot-robot.png"
          alt="ARIA - Bold Business AI Assistant"
          className="w-full h-full object-contain"
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        />
      ) : (
        <img
          src="/images/chatbot-robot.png"
          alt="ARIA - Bold Business AI Assistant"
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}

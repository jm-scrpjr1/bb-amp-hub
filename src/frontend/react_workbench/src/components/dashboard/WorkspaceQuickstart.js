import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedRobot from '../ui/AnimatedRobot';

const quickstartTiles = [
  {
    id: 'prompts',
    title: 'Prompts',
    image: '/images/PROMPT 1.png',
    animation: 'bounce',
    color: 'cyan',
    wittyMessages: [
      "Need the perfect prompt? I've got you covered! 🎯",
      "Let's craft some AI magic together! ✨",
      "Ready to unlock AI's full potential? 🚀",
      "I speak fluent AI - let me translate! 🤖",
      "Prompting is an art, and I'm your artist! 🎨"
    ]
  },
  {
    id: 'automations',
    title: 'Automations',
    image: '/images/AUTOMATION 3.png',
    animation: 'bounce',
    color: 'yellow',
    wittyMessages: [
      "Why do it manually when I can automate it? ⚡",
      "Sit back, relax, I'll handle the repetitive stuff! 🛋️",
      "Automation is my middle name! Well, actually it's 3000... 🤖",
      "Let's turn your workflows into smooth sailing! ⛵",
      "I never get tired of doing the same thing perfectly! 💪"
    ]
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    image: '/images/AI AGENT 1.png',
    animation: 'bounce',
    color: 'red',
    wittyMessages: [
      "Meet my AI squad - we're quite the team! 👥",
      "Need an AI agent? I know just the bot for the job! 🎭",
      "We're like the Avengers, but for productivity! 🦸",
      "Each agent has their superpower - what's yours? ⚡",
      "Building AI agents is like creating digital employees! 👔"
    ]
  },
  {
    id: 'training',
    title: 'Training',
    image: '/images/AI TRAINING 3.png',
    animation: 'bounce',
    color: 'purple',
    wittyMessages: [
      "Let's level up your AI skills! 📚",
      "Training time - I love a good learning session! 🎓",
      "Knowledge is power, and I'm here to share mine! 💡",
      "Ready to become an AI master? 🥋",
      "Every expert was once a beginner! 🌱"
    ]
  }
];

const WorkspaceQuickstart = () => {
  const [hoveredTile, setHoveredTile] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');

  const handleTileHover = (tile) => {
    setHoveredTile(tile.id);
    const randomMessage = tile.wittyMessages[Math.floor(Math.random() * tile.wittyMessages.length)];
    setCurrentMessage(randomMessage);
  };

  const handleTileLeave = () => {
    setHoveredTile(null);
    setCurrentMessage('');
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'cyan':
        return 'bg-cyan-50 border-cyan-200 hover:border-cyan-400 hover:shadow-cyan-200/50';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:shadow-yellow-200/50';
      case 'red':
        return 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-red-200/50';
      case 'purple':
        return 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-purple-200/50';
      default:
        return 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:shadow-gray-200/50';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Workspace Quickstart
        </h2>
        <p className="text-gray-600">
          Choose your AI tool and let's get started!
        </p>
      </div>

      {/* Quickstart Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {quickstartTiles.map((tile, index) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`${getColorClasses(tile.color)} border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl text-center relative overflow-visible`}
            onMouseEnter={() => handleTileHover(tile)}
            onMouseLeave={handleTileLeave}
            whileHover={{
              scale: 1.05,
              y: -8,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Cloud Chat Bubble Thought */}
            <AnimatePresence>
              {hoveredTile === tile.id && currentMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20"
                >
                  <div className="relative bg-white rounded-3xl px-6 py-4 shadow-xl border border-gray-100 max-w-xs">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed text-center">
                      {currentMessage}
                    </p>

                    {/* Cloud-like tail with multiple bubbles */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
                      {/* Large bubble */}
                      <div className="w-4 h-4 bg-white rounded-full border border-gray-100 shadow-md"></div>
                      {/* Medium bubble */}
                      <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full border border-gray-100 shadow-md"></div>
                      {/* Small bubble */}
                      <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full border border-gray-100 shadow-sm"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4 relative flex justify-center">
              <AnimatedRobot
                src={tile.image}
                alt={tile.title}
                size="w-28 h-28"
                animationType={tile.animation}
                showMessage={false}
                showGlow={hoveredTile === tile.id}
                className="mx-auto"
                style={{
                  transform: hoveredTile === tile.id ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {tile.title}
            </h3>

            {/* Three dots menu */}
            <div className="absolute top-4 right-4">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceQuickstart;

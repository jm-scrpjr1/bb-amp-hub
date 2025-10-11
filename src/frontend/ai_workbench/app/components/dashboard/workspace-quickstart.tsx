"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollEffects } from '@/components/effects';
import { MoreHorizontal } from '@/components/icons';
import { useRouter } from 'next/navigation';

interface QuickstartTile {
  id: string;
  title: string;
  image: string;
  animation: 'bounce' | 'shake' | 'circle' | 'float';
  color: string;
  wittyMessages: string[];
}

const quickstartTiles: QuickstartTile[] = [
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
      "Knowledge is power, and I'm your personal trainer! 💪",
      "Ready to level up your AI skills? Let's go! 📈",
      "I make learning AI as easy as 1, 2, 3! 🔢",
      "Every expert was once a beginner - let's start! 🌱",
      "Training mode: ON. Let's make you an AI wizard! 🧙‍♂️"
    ]
  }
];

const getAnimationVariants = (animation: string) => {
  switch (animation) {
    case 'bounce':
      return {
        animate: {
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
          rotate: [0, 3, -3, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }
        }
      };
    case 'shake':
      return {
        animate: {
          x: [0, -5, 5, -5, 5, 0],
          rotate: [0, -3, 3, -3, 3, 0],
          scale: [1, 1.02, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5
          }
        }
      };
    case 'circle':
      return {
        animate: {
          rotate: [0, 360],
          scale: [1, 1.12, 1],
          y: [0, -8, 0],
          transition: {
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }
      };
    case 'float':
      return {
        animate: {
          y: [0, -18, 0],
          x: [0, 5, -5, 0],
          rotate: [0, 8, -8, 0],
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      };
    default:
      return {};
  }
};

function WorkspaceQuickstart() {
  const router = useRouter();
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<{[key: string]: string}>({});

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleTileHover = (tileId: string, messages: string[]) => {
    setHoveredTile(tileId);
    setCurrentMessages(prev => ({
      ...prev,
      [tileId]: getRandomMessage(messages)
    }));
  };

  const handleTileLeave = () => {
    setHoveredTile(null);
  };

  const handleTileClick = (tileId: string) => {
    switch (tileId) {
      case 'prompts':
        router.push('/prompt-tutor');
        break;
      case 'automations':
        router.push('/automations');
        break;
      case 'ai-agents':
        router.push('/ai-agents');
        break;
      case 'training':
        router.push('/trainings');
        break;
      default:
        console.log(`Navigation not implemented for ${tileId}`);
    }
  };

  return (
    <div className="mb-8">
      <ScrollEffects effect="fadeUp" delay={0.2}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Workspace Quickstart</h2>
      </ScrollEffects>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickstartTiles.map((tile, index) => (
          <ScrollEffects key={tile.id} effect="fadeUp" delay={0.3 + index * 0.1}>
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => handleTileHover(tile.id, tile.wittyMessages)}
              onMouseLeave={handleTileLeave}
              onClick={() => handleTileClick(tile.id)}
            >
              {/* Header with title and menu */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{tile.title}</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Robot Image with Animation */}
              <div className="flex items-center justify-center h-64 mb-4 relative">
                <motion.div
                  className="w-48 h-48 flex items-center justify-center relative z-10"
                  {...getAnimationVariants(tile.animation)}
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -8, 8, -8, 0],
                    y: [0, -12, 0],
                    transition: {
                      scale: { duration: 0.2 },
                      rotate: { duration: 0.4, repeat: Infinity },
                      y: { duration: 0.3, repeat: Infinity }
                    }
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    y: [0, -12, 0],
                    x: [0, 2, -2, 0],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <motion.img
                    src={tile.image}
                    alt={`${tile.title} Robot`}
                    className="w-full h-full object-contain drop-shadow-lg"
                    animate={{
                      filter: hoveredTile === tile.id
                        ? ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                        : "brightness(1)"
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: hoveredTile === tile.id ? Infinity : 0
                    }}
                  />
                </motion.div>

                {/* Chat Bubble */}
                <AnimatePresence>
                  {hoveredTile === tile.id && currentMessages[tile.id] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20"
                    >
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-200 max-w-xs">
                        <div className="text-sm text-gray-700 font-medium text-center">
                          {currentMessages[tile.id]}
                        </div>
                        {/* Chat bubble tail */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glow effect behind robot */}
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r opacity-20 blur-xl`}
                  style={{
                    background: tile.color === 'cyan' ? 'linear-gradient(45deg, #06b6d4, #67e8f9)' :
                               tile.color === 'yellow' ? 'linear-gradient(45deg, #eab308, #fde047)' :
                               tile.color === 'red' ? 'linear-gradient(45deg, #dc2626, #f87171)' :
                               'linear-gradient(45deg, #7c3aed, #a78bfa)'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.6, 0.2],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </motion.div>
          </ScrollEffects>
        ))}
      </div>
    </div>
  );
}

export default WorkspaceQuickstart;

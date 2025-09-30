"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollEffects } from '@/components/effects';
import { MoreHorizontal } from '@/components/icons';

interface QuickstartTile {
  id: string;
  title: string;
  image: string;
  animation: 'bounce' | 'shake' | 'circle' | 'float';
  color: string;
}

const quickstartTiles: QuickstartTile[] = [
  {
    id: 'prompts',
    title: 'Prompts',
    image: '/images/PROMPT 1.png',
    animation: 'bounce',
    color: 'cyan'
  },
  {
    id: 'automations',
    title: 'Automations',
    image: '/images/AUTOMATION 3.png',
    animation: 'bounce',
    color: 'yellow'
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    image: '/images/AI AGENT 1.png',
    animation: 'bounce',
    color: 'red'
  },
  {
    id: 'training',
    title: 'Training',
    image: '/images/AI TRAINING 3.png',
    animation: 'bounce',
    color: 'purple'
  }
];

const getAnimationVariants = (animation: string) => {
  switch (animation) {
    case 'bounce':
      return {
        animate: {
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }
        }
      };
    case 'shake':
      return {
        animate: {
          x: [0, -3, 3, -3, 3, 0],
          rotate: [0, -2, 2, -2, 2, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }
        }
      };
    case 'circle':
      return {
        animate: {
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          transition: {
            rotate: {
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        }
      };
    case 'float':
      return {
        animate: {
          y: [0, -12, 0],
          x: [0, 3, -3, 0],
          rotate: [0, 5, -5, 0],
          transition: {
            duration: 4,
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
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={tile.image}
                    alt={`${tile.title} Robot`}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </motion.div>

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
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 3,
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

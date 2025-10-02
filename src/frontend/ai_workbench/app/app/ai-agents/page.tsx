
"use client";

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, TextScramble } from '@/components/effects';
import { Search, Heart, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All', active: true },
  { id: 'sales', name: 'Sales', active: false },
  { id: 'recruiters', name: 'Recruiters', active: false },
  { id: 'human resources', name: 'Human Resources', active: false },
  { id: 'marketing', name: 'Marketing', active: false },
  { id: 'coding', name: 'Coding', active: false },
  { id: 'it', name: 'IT', active: false },
];

const getAnimationVariants = (animation: string) => {
  switch (animation) {
    case 'bounce':
      return {
        animate: {
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
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
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      };
    case 'circle':
      return {
        animate: {
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
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
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      };
    default:
      return {};
  }
};

const agents = [
  {
    id: 1,
    name: 'Sales',
    description: 'Boost your sales performance with AI-powered insights',
    image: '/images/AI AGENT 1.png',
    bgColor: 'bg-red-500',
    category: 'Sales',
    animation: 'bounce',
    liked: false,
    wittyMessages: [
      "Ready to boost your sales! 🚀",
      "I'm here to help you close deals! ✨",
      "Let's make some sales magic happen! 🎯",
      "Your personal sales assistant at your service! 🤖",
      "Time to amplify your revenue! ⚡"
    ]
  },
  {
    id: 2,
    name: 'Marketing',
    description: 'Create compelling campaigns and marketing strategies',
    image: '/images/AI AGENT 2.png',
    bgColor: 'bg-green-500',
    category: 'Marketing',
    animation: 'float',
    liked: false,
    wittyMessages: [
      "Marketing innovation is my middle name! 💡",
      "Let's create amazing campaigns together! 🌟",
      "I'm your creative marketing companion! 🎨",
      "Ready to think outside the marketing box? 📦",
      "Creativity meets marketing AI - that's me! 🎭"
    ]
  },
  {
    id: 3,
    name: 'Coding',
    description: 'Advanced programming and development assistance',
    image: '/images/AI AGENT 3.png',
    bgColor: 'bg-yellow-500',
    category: 'Coding',
    animation: 'shake',
    liked: false,
    wittyMessages: [
      "Code analysis is my superpower! 📊",
      "Let me debug those issues for you! 🔢",
      "Clean code coming right up! 📈",
      "I love solving coding problems! 🧩",
      "Your coding AI buddy is here! 🤓"
    ]
  },
  {
    id: 4,
    name: 'Recruiters',
    description: 'Streamline hiring and talent acquisition processes',
    image: '/images/AI AGENT 4.png',
    bgColor: 'bg-sky-300',
    category: 'Recruiters',
    animation: 'circle',
    liked: false,
    wittyMessages: [
      "Recruitment expert at your service! ⚙️",
      "Why hire manually when I can automate? 🔄",
      "Finding talent is my game! 🎯",
      "Let's streamline your hiring process! 🚀",
      "I never get tired of finding great candidates! 💪"
    ]
  },
  {
    id: 5,
    name: 'Human Resources',
    description: 'HR management and employee engagement solutions',
    image: '/images/AI AGENT 5.png',
    bgColor: 'bg-gray-300',
    category: 'Human Resources',
    animation: 'float',
    liked: false,
    wittyMessages: [
      "HR specialist here! 💬",
      "Let's craft the perfect employee experience! ✍️",
      "I speak fluent human and HR! 🗣️",
      "Your people, amplified! 📢",
      "Making workplace relationships count! 💫"
    ]
  },
  {
    id: 6,
    name: 'IT',
    description: 'Technical support and infrastructure management',
    image: '/images/AI TRAINING 3.png',
    bgColor: 'bg-blue-700',
    category: 'IT',
    animation: 'bounce',
    liked: false,
    wittyMessages: [
      "The newest IT team member! 🌟",
      "Fresh tech perspectives, infinite possibilities! 🔮",
      "Ready to solve technical challenges! 🌱",
      "Innovation starts with IT! 💎",
      "Your cutting-edge IT companion! ⚡"
    ]
  },
];

export default function AIAgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [likedAgents, setLikedAgents] = useState<number[]>([]);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);
  const [currentMessages, setCurrentMessages] = useState<{[key: number]: string}>({});

  const toggleLike = (agentId: number) => {
    setLikedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAgentHover = (agentId: number, messages: string[]) => {
    setHoveredAgent(agentId);
    setCurrentMessages(prev => ({
      ...prev,
      [agentId]: getRandomMessage(messages)
    }));
  };

  const handleAgentLeave = () => {
    setHoveredAgent(null);
  };

  // Filter agents based on search term and category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (agent.category === 'Human Resources' && 'hr'.includes(searchTerm.toLowerCase()))

    const matchesCategory = activeCategory === 'all' || agent.category.toLowerCase() === activeCategory.toLowerCase()

    return matchesSearch && matchesCategory
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <TextScramble
                  text="AI Agents"
                  trigger={true}
                  speed={50}
                  delay={200}
                />
              </h1>
              <p className="text-gray-600">Training Session Name</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-cyan-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </ScrollEffects>

        {/* Agents Grid */}
        <ScrollEffects effect="fadeUp" delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <div
                key={agent.id}
                className="bg-white rounded-2xl relative group hover:shadow-lg transition-all duration-300 overflow-hidden"
                onMouseEnter={() => handleAgentHover(agent.id, agent.wittyMessages)}
                onMouseLeave={handleAgentLeave}
              >
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(agent.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      likedAgents.includes(agent.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Agent Image */}
                <div className="flex justify-center mb-4 pt-8 pb-4">
                  <motion.div
                    className="flex items-center justify-center relative z-10 w-48 h-48"
                    {...getAnimationVariants(agent.animation)}
                    animate={{
                      ...getAnimationVariants(agent.animation).animate,
                      scale: hoveredAgent === agent.id ? [1, 1.2, 0.9, 1.1, 1] : getAnimationVariants(agent.animation).animate?.scale || 1,
                      x: hoveredAgent === agent.id ? [0, -3, 3, -3, 3, 0] : 0,
                    }}
                    transition={{
                      scale: { duration: 0.6, repeat: hoveredAgent === agent.id ? Infinity : 0 },
                      x: { duration: 0.3, repeat: hoveredAgent === agent.id ? Infinity : 0 },
                      ...getAnimationVariants(agent.animation).animate?.transition
                    }}
                    whileHover={{
                      scale: 1.15,
                      rotate: [0, -5, 5, -5, 0],
                      transition: {
                        scale: { duration: 0.3 },
                        rotate: { duration: 0.6, repeat: Infinity }
                      }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Glowing effect - same as AI Home */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(6, 229, 236, 0.3)',
                          '0 0 40px rgba(6, 229, 236, 0.6)',
                          '0 0 20px rgba(6, 229, 236, 0.3)'
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Floating bubbles on hover */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-60"
                          style={{
                            left: `${20 + i * 10}%`,
                            top: `${30 + (i % 2) * 40}%`,
                          }}
                          animate={{
                            y: [-10, -30, -10],
                            opacity: [0.6, 0.2, 0.6],
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 2 + i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </motion.div>

                    <motion.img
                      src={agent.image}
                      alt={agent.name}
                      className={`object-contain relative z-10 ${
                        agent.id === 2 ? 'w-full h-full scale-150' :
                        agent.id === 3 ? 'w-full h-full scale-150' :
                        agent.id === 5 ? 'w-full h-full scale-200' :
                        'w-full h-full'
                      }`}
                      animate={{
                        filter: hoveredAgent === agent.id
                          ? ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                          : "brightness(1)"
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: hoveredAgent === agent.id ? Infinity : 0
                      }}
                    />
                  </motion.div>

                  {/* Chat Bubble - Inside tile at random position */}
                  <AnimatePresence>
                    {hoveredAgent === agent.id && currentMessages[agent.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`absolute z-40 ${
                          agent.id === 1 ? 'top-4 right-4' :
                          agent.id === 2 ? 'top-6 left-4' :
                          agent.id === 3 ? 'bottom-20 right-4' :
                          agent.id === 4 ? 'top-4 left-6' :
                          agent.id === 5 ? 'bottom-20 left-4' :
                          'top-6 right-6'
                        }`}
                      >
                        <div className="relative">
                          {/* Cloud-like bubble */}
                          <div className="bg-white rounded-2xl px-3 py-2 shadow-lg border border-gray-200 max-w-[140px]">
                            {/* Cloud bumps */}
                            <div className="absolute -top-1 left-2 w-3 h-3 bg-white rounded-full border border-gray-200"></div>
                            <div className="absolute -top-2 left-4 w-4 h-4 bg-white rounded-full border border-gray-200"></div>
                            <div className="absolute -top-1 right-3 w-2 h-2 bg-white rounded-full border border-gray-200"></div>

                            <div className="text-xs text-gray-700 font-medium text-center relative z-10">
                              {currentMessages[agent.id]}
                            </div>

                            {/* Cloud tail */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                              <div className="w-3 h-3 bg-white rounded-full border border-gray-200"></div>
                              <div className="absolute -bottom-1 left-0 w-2 h-2 bg-white rounded-full border border-gray-200"></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Color Title Bar at Bottom */}
                <div className={`${agent.bgColor} p-4 rounded-b-2xl`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {agent.name}
                    </h3>
                    <button className="p-1 rounded hover:bg-white/20 transition-colors duration-200">
                      <MoreVertical className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <p className="text-sm text-white/90">
                    {agent.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollEffects>

        {/* Large Empty Card */}
        <ScrollEffects effect="fadeUp" delay={0.5}>
          <div className="bg-white rounded-2xl p-12 border-2 border-dashed border-gray-200 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">+</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Add New Agent
              </h3>
              <p className="text-gray-500 text-sm">
                Create a new AI agent to expand your automation capabilities
              </p>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
}

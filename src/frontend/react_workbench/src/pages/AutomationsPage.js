import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
import { Search, Heart, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedRobot from '../components/ui/AnimatedRobot';

const categories = [
  { id: 'all', name: 'All', active: true },
  { id: 'favorites', name: 'Favorites', active: false },
  { id: 'sales', name: 'Sales', active: false },
  { id: 'finance', name: 'Finance', active: false },
  { id: 'human resources', name: 'Human Resources', active: false },
  { id: 'marketing', name: 'Marketing', active: false },
  { id: 'coding', name: 'Coding', active: false },
  { id: 'it', name: 'IT', active: false },
];

const getAnimationVariants = (animation) => {
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
    image: '/images/AUTOMATION 5.png',
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
    image: '/images/AUTOMATION 2.png',
    bgColor: 'bg-green-500',
    category: 'Marketing',
    animation: 'shake',
    liked: false,
    wittyMessages: [
      "Marketing magic is my specialty! ✨",
      "Let's create campaigns that convert! 📈",
      "Ready to amplify your brand? 🎯",
      "I speak fluent customer! 💬",
      "Time to make your brand unforgettable! 🌟"
    ]
  },
  {
    id: 3,
    name: 'Finance',
    description: 'Optimize your financial processes and analysis',
    image: '/images/AUTOMATION 3.png',
    bgColor: 'bg-yellow-500',
    category: 'Finance',
    animation: 'float',
    liked: false,
    wittyMessages: [
      "Numbers don't lie, and neither do I! 📊",
      "Let's make your finances crystal clear! 💎",
      "Ready to optimize your cash flow? 💰",
      "I crunch numbers so you don't have to! 🔢",
      "Financial clarity is just a click away! 📈"
    ]
  },
  {
    id: 4,
    name: 'HR',
    description: 'Streamline HR processes and employee management',
    image: '/images/AUTOMATION 4.png',
    bgColor: 'bg-sky-300',
    category: 'Human Resources',
    animation: 'wiggle',
    liked: false,
    wittyMessages: [
      "People are our greatest asset! 👥",
      "Let's make HR processes smooth as silk! 🎯",
      "Ready to boost employee satisfaction? 😊",
      "I'm here to help your team thrive! 🌱",
      "HR excellence starts here! ⭐"
    ]
  },
  {
    id: 5,
    name: 'IT',
    description: 'Enhance your IT operations and support',
    image: '/images/AUTOMATION 1.png',
    bgColor: 'bg-gray-600',
    category: 'IT',
    animation: 'bounce',
    liked: false,
    wittyMessages: [
      "Tech problems? I've got solutions! 🔧",
      "Let's optimize your IT infrastructure! ⚙️",
      "Ready to streamline your systems? 💻",
      "I speak binary and human! 🤖",
      "IT excellence is my mission! 🎯"
    ]
  },
  {
    id: 6,
    name: 'Coding',
    description: 'Accelerate your development with AI assistance',
    image: '/images/AI TRAINING 3.png',
    bgColor: 'bg-blue-700',
    category: 'Coding',
    animation: 'shake',
    liked: false,
    wittyMessages: [
      "Code like a wizard with my help! 🧙‍♂️",
      "Let's debug the world together! 🐛",
      "Ready to write cleaner code? ✨",
      "I compile faster than coffee brews! ☕",
      "Coding excellence awaits! 🚀"
    ]
  }
];

const AutomationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedAgents, setLikedAgents] = useState(new Set());
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [currentMessages, setCurrentMessages] = useState({});

  const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleAgentHover = (agentId, messages) => {
    setHoveredAgent(agentId);
    setCurrentMessages(prev => ({
      ...prev,
      [agentId]: getRandomMessage(messages)
    }));
  };

  const handleAgentLeave = () => {
    setHoveredAgent(null);
  };

  const toggleLike = (agentId) => {
    setLikedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchTerm === '' ||
      new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(agent.name) ||
      new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(agent.description);

    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'favorites' && likedAgents.has(agent.id)) ||
      agent.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Automations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your workflows with intelligent automation agents. Each automation is designed to handle repetitive tasks and boost your productivity.
            </p>
          </div>
        </ScrollEffects>

        {/* Search and Filters */}
        <ScrollEffects effect="fadeUp" delay={0.2}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search automations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
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
              <motion.div
                key={agent.id}
                className="relative group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onMouseEnter={() => handleAgentHover(agent.id, agent.wittyMessages)}
                onMouseLeave={handleAgentLeave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  {/* Background Glow Effect */}
                  <div className={`absolute inset-0 ${agent.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(agent.id);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likedAgents.has(agent.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    />
                  </button>

                  {/* Robot Image */}
                  <div className="flex justify-center mb-6 relative">
                    <AnimatedRobot
                      src={agent.image}
                      alt={agent.name}
                      size="w-36 h-36"
                      animationType={agent.animation}
                      showMessage={hoveredAgent === agent.id}
                      message={currentMessages[agent.id]}
                      showGlow={true}
                      className="mx-auto"
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {agent.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {agent.description}
                    </p>
                  </div>

                  {/* Color Bar at Bottom */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${agent.bgColor} rounded-b-2xl`}></div>

                  {/* Cloud Chat Bubble */}
                  <AnimatePresence>
                    {hoveredAgent === agent.id && currentMessages[agent.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-[9999]"
                      >
                        <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 px-4 py-3 max-w-[200px]">
                          <div className="text-xs text-gray-700 font-medium text-center leading-relaxed">
                            {currentMessages[agent.id]}
                          </div>

                          {/* Cloud-like tail with multiple bubbles */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
                            {/* Large bubble */}
                            <div className="w-3 h-3 bg-white rounded-full border border-gray-100 shadow-md"></div>
                            {/* Medium bubble */}
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full border border-gray-100 shadow-md"></div>
                            {/* Small bubble */}
                            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full border border-gray-100 shadow-sm"></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            {/* Add New Automation Card */}
            <motion.div
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors cursor-pointer min-h-[280px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + filteredAgents.length * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-400">+</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Add New Automation
              </h3>
              <p className="text-sm text-gray-500">
                Create a custom automation for your specific workflow needs
              </p>
            </motion.div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
};

export default AutomationsPage;

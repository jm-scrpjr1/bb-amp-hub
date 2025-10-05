
"use client";

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, TextScramble } from '@/components/effects';
import { Search, Heart, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const trainings = [
  {
    id: 1,
    name: 'Sales',
    description: 'Boost your sales performance with AI-powered training',
    image: '/images/AI AGENT 1.png',
    bgColor: 'bg-red-500',
    category: 'Sales',
    animation: 'bounce',
    liked: false,
    wittyMessages: [
      "Ready to boost your sales training! 🚀",
      "I'm here to help you learn sales skills! ✨",
      "Let's make some sales training magic! 🎯",
      "Your personal sales training assistant! 🤖",
      "Time to amplify your sales knowledge! ⚡"
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
      "Marketing training innovation is here! 💡",
      "Let's learn amazing marketing together! 🌟",
      "I'm your creative marketing trainer! 🎨",
      "Ready to learn marketing strategies? 📦",
      "Creativity meets marketing training! 🎭"
    ]
  },
  {
    id: 3,
    name: 'Coding',
    description: 'Advanced programming and development training',
    image: '/images/AI TRAINING 1.png',
    bgColor: 'bg-yellow-500',
    category: 'Coding',
    animation: 'shake',
    liked: false,
    wittyMessages: [
      "Code training is my superpower! 📊",
      "Let me teach you coding skills! 🔢",
      "Clean code training coming up! 📈",
      "I love teaching coding concepts! 🧩",
      "Your coding training buddy is here! 🤓"
    ]
  },
  {
    id: 4,
    name: 'Finance',
    description: 'Financial analysis and budget management training',
    image: '/images/AI AGENT 4.png',
    bgColor: 'bg-sky-300',
    category: 'Finance',
    animation: 'circle',
    liked: false,
    wittyMessages: [
      "Financial training expert at service! 💰",
      "Let's learn those numbers together! 📊",
      "Budget training is my specialty! 📈",
      "Making finance training crystal clear! 💎",
      "Your money training matters! 🏦"
    ]
  },
  {
    id: 5,
    name: 'Human Resources',
    description: 'HR management and employee engagement training',
    image: '/images/AI AGENT 5.png',
    bgColor: 'bg-gray-600',
    category: 'Human Resources',
    animation: 'float',
    liked: false,
    wittyMessages: [
      "HR training specialist here! 💬",
      "Let's learn perfect HR practices! ✍️",
      "I teach fluent HR skills! 🗣️",
      "Your people training, amplified! 📢",
      "Making HR training relationships count! 💫"
    ]
  },
  {
    id: 6,
    name: 'IT',
    description: 'Technical support and infrastructure training',
    image: '/images/AI TRAINING 3.png',
    bgColor: 'bg-blue-700',
    category: 'IT',
    animation: 'bounce',
    liked: false,
    wittyMessages: [
      "The newest IT training member! 🌟",
      "Fresh tech training perspectives! 🔮",
      "Ready to learn technical skills! 🌱",
      "Innovation starts with IT training! 💎",
      "Your cutting-edge IT trainer! ⚡"
    ]
  },
];

export default function TrainingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [likedTrainings, setLikedTrainings] = useState<number[]>([]);
  const [hoveredTraining, setHoveredTraining] = useState<number | null>(null);
  const [currentMessages, setCurrentMessages] = useState<{[key: number]: string}>({});

  const toggleLike = (trainingId: number) => {
    setLikedTrainings(prev =>
      prev.includes(trainingId)
        ? prev.filter(id => id !== trainingId)
        : [...prev, trainingId]
    );
  };

  const getRandomMessage = (messages: string[]) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleTrainingHover = (trainingId: number, messages: string[]) => {
    setHoveredTraining(trainingId);
    setCurrentMessages(prev => ({
      ...prev,
      [trainingId]: getRandomMessage(messages)
    }));
  };

  const handleTrainingLeave = () => {
    setHoveredTraining(null);
  };

  // Filter trainings based on search term and category
  const filteredTrainings = trainings.filter(training => {
    if (!searchTerm.trim()) {
      const matchesCategory = activeCategory === 'all' ||
                             (activeCategory === 'favorites' && likedTrainings.includes(training.id)) ||
                             training.category.toLowerCase().trim() === activeCategory.toLowerCase().trim()
      return matchesCategory;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    // Create word boundary regex for more precise matching
    const createWordBoundaryRegex = (term: string) => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escapedTerm}\\b`, 'i');
    };

    const matchesSearch =
      // Exact name match (case insensitive)
      training.name.toLowerCase() === searchLower ||
      // Name contains search term
      training.name.toLowerCase().includes(searchLower) ||
      // Category exact match
      training.category.toLowerCase() === searchLower ||
      // Word boundary match in description for short terms
      (searchLower.length <= 3 ? createWordBoundaryRegex(searchLower).test(training.description) : training.description.toLowerCase().includes(searchLower));

    const matchesCategory = activeCategory === 'all' ||
                           (activeCategory === 'favorites' && likedTrainings.includes(training.id)) ||
                           training.category.toLowerCase().trim() === activeCategory.toLowerCase().trim()

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
                  text="Trainings"
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

        {/* Trainings Grid */}
        <ScrollEffects effect="fadeUp" delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training, index) => (
              <div
                key={training.id}
                className="bg-white rounded-2xl relative group hover:shadow-lg transition-all duration-300 overflow-hidden"
                onMouseEnter={() => handleTrainingHover(training.id, training.wittyMessages)}
                onMouseLeave={handleTrainingLeave}
              >
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(training.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      likedTrainings.includes(training.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Training Image */}
                <div className="flex justify-center mb-4 pt-8 pb-4">
                  <motion.div
                    className="flex items-center justify-center relative z-10 w-48 h-48"
                    {...getAnimationVariants(training.animation)}
                    animate={{
                      ...getAnimationVariants(training.animation).animate,
                      scale: hoveredTraining === training.id ? [1, 1.2, 0.9, 1.1, 1] : getAnimationVariants(training.animation).animate?.scale || 1,
                      x: hoveredTraining === training.id ? [0, -3, 3, -3, 3, 0] : 0,
                    }}
                    transition={{
                      scale: { duration: 0.6, repeat: hoveredTraining === training.id ? Infinity : 0 },
                      x: { duration: 0.3, repeat: hoveredTraining === training.id ? Infinity : 0 },
                      ...getAnimationVariants(training.animation).animate?.transition
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
                      src={training.image}
                      alt={training.name}
                      className={`object-contain relative z-10 ${
                        training.id === 2 ? 'w-full h-full scale-150' :
                        training.id === 3 ? 'w-full h-full scale-75' :
                        training.id === 5 ? 'w-full h-full scale-200' :
                        'w-full h-full'
                      }`}
                      animate={{
                        filter: hoveredTraining === training.id
                          ? ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                          : "brightness(1)"
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: hoveredTraining === training.id ? Infinity : 0
                      }}
                    />
                  </motion.div>

                  {/* Chat Bubble - Inside tile at random position */}
                  <AnimatePresence>
                    {hoveredTraining === training.id && currentMessages[training.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute z-40 top-4 left-4"
                      >
                        <div className="relative">
                          {/* Cloud-like bubble */}
                          <div className="bg-white rounded-2xl px-3 py-2 shadow-lg border border-gray-200 max-w-[140px]">
                            {/* Cloud bumps */}
                            <div className="absolute -top-1 left-2 w-3 h-3 bg-white rounded-full border border-gray-200"></div>
                            <div className="absolute -top-2 left-4 w-4 h-4 bg-white rounded-full border border-gray-200"></div>
                            <div className="absolute -top-1 right-3 w-2 h-2 bg-white rounded-full border border-gray-200"></div>

                            <div className="text-xs text-gray-700 font-medium text-center relative z-10">
                              {currentMessages[training.id]}
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
                <div className={`${training.bgColor} p-4 rounded-b-2xl`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {training.name}
                    </h3>
                    <button className="p-1 rounded hover:bg-white/20 transition-colors duration-200">
                      <MoreVertical className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <p className="text-sm text-white/90">
                    {training.description}
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
                Add New Training
              </h3>
              <p className="text-gray-500 text-sm">
                Create a new training session to expand your learning library
              </p>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
}

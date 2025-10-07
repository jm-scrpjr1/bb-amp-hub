import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ScrollEffects } from '../components/effects';
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
    animation: 'shake',
    liked: false,
    wittyMessages: [
      "Marketing training magic awaits! ✨",
      "Let's learn to create campaigns that convert! 📈",
      "Ready to amplify your marketing skills? 🎯",
      "I'll teach you to speak fluent customer! 💬",
      "Time to make your marketing unforgettable! 🌟"
    ]
  },
  {
    id: 3,
    name: 'Finance',
    description: 'Optimize your financial processes and analysis',
    image: '/images/AI AGENT 3.png',
    bgColor: 'bg-yellow-500',
    category: 'Finance',
    animation: 'circle',
    liked: false,
    wittyMessages: [
      "Numbers training - let's make it fun! 📊",
      "I'll teach you financial clarity! 💎",
      "Ready to master cash flow optimization? 💰",
      "Learn to crunch numbers like a pro! 🔢",
      "Financial expertise training starts here! 📈"
    ]
  },
  {
    id: 4,
    name: 'HR',
    description: 'Streamline HR processes and employee management',
    image: '/images/AI AGENT 4.png',
    bgColor: 'bg-sky-300',
    category: 'Human Resources',
    animation: 'float',
    liked: false,
    wittyMessages: [
      "People skills training is my specialty! 👥",
      "Let's learn HR processes together! 🎯",
      "Ready to boost your people management? 😊",
      "I'll help you learn to help teams thrive! 🌱",
      "HR excellence training starts here! ⭐"
    ]
  },
  {
    id: 5,
    name: 'IT',
    description: 'Enhance your IT operations and support',
    image: '/images/AI AGENT 5.png',
    bgColor: 'bg-gray-600',
    category: 'IT',
    animation: 'bounce',
    liked: false,
    wittyMessages: [
      "Tech training? I've got the solutions! 🔧",
      "Let's learn IT infrastructure together! ⚙️",
      "Ready to master system optimization? 💻",
      "I'll teach you binary and human! 🤖",
      "IT excellence training is my mission! 🎯"
    ]
  },
  {
    id: 6,
    name: 'Coding',
    description: 'Accelerate your development with AI assistance',
    image: '/images/AI AGENT 6.png',
    bgColor: 'bg-blue-700',
    category: 'Coding',
    animation: 'shake',
    liked: false,
    wittyMessages: [
      "Learn to code like a wizard! 🧙‍♂️",
      "Let's debug and learn together! 🐛",
      "Ready to write cleaner code? ✨",
      "I'll teach you to compile faster! ☕",
      "Coding excellence training awaits! 🚀"
    ]
  }
];

const TrainingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedTrainings, setLikedTrainings] = useState(new Set());
  const [hoveredTraining, setHoveredTraining] = useState(null);
  const [currentMessages, setCurrentMessages] = useState({});

  const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleTrainingHover = (trainingId, messages) => {
    setHoveredTraining(trainingId);
    setCurrentMessages(prev => ({
      ...prev,
      [trainingId]: getRandomMessage(messages)
    }));
  };

  const handleTrainingLeave = () => {
    setHoveredTraining(null);
  };

  const toggleLike = (trainingId) => {
    setLikedTrainings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trainingId)) {
        newSet.delete(trainingId);
      } else {
        newSet.add(trainingId);
      }
      return newSet;
    });
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = searchTerm === '' ||
      new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(training.name) ||
      new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(training.description);

    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'favorites' && likedTrainings.has(training.id)) ||
      training.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Training Programs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enhance your skills with AI-powered training modules. Each program is designed to help you master different aspects of business and technology.
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
                placeholder="Search training programs..."
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

        {/* Trainings Grid */}
        <ScrollEffects effect="fadeUp" delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training, index) => (
              <motion.div
                key={training.id}
                className="relative group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onMouseEnter={() => handleTrainingHover(training.id, training.wittyMessages)}
                onMouseLeave={handleTrainingLeave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  {/* Background Glow Effect */}
                  <div className={`absolute inset-0 ${training.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(training.id);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        likedTrainings.has(training.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    />
                  </button>

                  {/* Robot Image */}
                  <div className="flex justify-center mb-6 relative">
                    <motion.div
                      className="w-24 h-24 flex items-center justify-center relative"
                      {...getAnimationVariants(training.animation)}
                      animate={{
                        ...getAnimationVariants(training.animation).animate,
                        scale: hoveredTraining === training.id ? [1, 1.2, 0.9, 1.1, 1] : getAnimationVariants(training.animation).animate?.scale || 1,
                      }}
                      transition={{
                        scale: { duration: 0.6, repeat: hoveredTraining === training.id ? Infinity : 0 },
                        ...getAnimationVariants(training.animation).animate?.transition
                      }}
                    >
                      <img
                        src={training.image}
                        alt={training.name}
                        className="w-full h-full object-contain"
                      />

                      {/* Floating Bubbles on Hover */}
                      <AnimatePresence>
                        {hoveredTraining === training.id && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
                                initial={{
                                  opacity: 0,
                                  scale: 0,
                                  x: Math.random() * 40 - 20,
                                  y: Math.random() * 40 - 20
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0],
                                  y: [0, -30],
                                  x: [0, (Math.random() - 0.5) * 20]
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                  ease: "easeOut"
                                }}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Training Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {training.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {training.description}
                    </p>
                  </div>

                  {/* Color Bar at Bottom */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${training.bgColor} rounded-b-2xl`}></div>

                  {/* Cloud Chat Bubble */}
                  <AnimatePresence>
                    {hoveredTraining === training.id && currentMessages[training.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20"
                      >
                        <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 px-4 py-3 max-w-[200px]">
                          <div className="text-xs text-gray-700 font-medium text-center leading-relaxed">
                            {currentMessages[training.id]}
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

            {/* Add New Training Card */}
            <motion.div
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors cursor-pointer min-h-[280px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + filteredTrainings.length * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-400">+</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Add New Training
              </h3>
              <p className="text-sm text-gray-500">
                Create a custom training program for your specific learning needs
              </p>
            </motion.div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
};

export default TrainingsPage;

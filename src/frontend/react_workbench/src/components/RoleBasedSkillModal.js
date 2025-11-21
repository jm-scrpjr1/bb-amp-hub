import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, GraduationCap, Target, BookOpen, TrendingUp, Zap, CheckCircle } from 'lucide-react';

const RoleBasedSkillModal = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = [
    {
      image: '/images/Client Facing Images/Train_0.png',
      title: 'Role-Based Skill Accelerator',
      subtitle: 'Personalized Learning Paths',
      description: 'Create customized training plans with materials and knowledge checks based on your specific role, process, and system.'
    },
    {
      image: '/images/Client Facing Images/Train_1.png',
      title: 'Skill Accelerator Library',
      subtitle: 'Choose Your Path',
      description: 'Select your role, process, and system to generate a comprehensive training plan tailored to your needs.'
    },
    {
      image: '/images/Client Facing Images/Train_2.jpg',
      title: 'Comprehensive Training Materials',
      subtitle: 'High-Quality Content',
      description: 'Access curated materials, knowledge checks, and practical exercises designed for maximum skill retention.'
    },
    {
      image: '/images/Client Facing Images/Train_3.png',
      title: 'Progress Tracking',
      subtitle: 'Monitor Your Growth',
      description: 'Track module completion, skill application, and competence gains with detailed analytics and insights.'
    },
    {
      image: '/images/Client Facing Images/Train_4.png',
      title: 'Adaptive Learning',
      subtitle: 'Kaizen-Based Improvement',
      description: 'Difficulty and pacing adapt to your progress, ensuring optimal learning velocity and knowledge retention.'
    }
  ];

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, currentSlide]);

  const handleNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slideVariants = {
    enter: (direction) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.8,
      z: -100
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      z: 0
    },
    exit: (direction) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.8,
      z: -100
    })
  };

  const keyFeatures = [
    {
      icon: Target,
      title: 'Diagnoses Skill Level',
      description: 'Assesses your current competencies and identifies knowledge gaps to create a baseline for growth'
    },
    {
      icon: BookOpen,
      title: 'Designs Personalized Training Plan',
      description: 'Creates a custom learning path aligned with your role, process, and system requirements'
    },
    {
      icon: GraduationCap,
      title: 'Curates High-Quality Materials',
      description: 'Selects the best resources, tutorials, and documentation for your specific learning objectives'
    },
    {
      icon: CheckCircle,
      title: 'Builds in Knowledge Checks',
      description: 'Integrates assessments and practical exercises to validate understanding and retention'
    },
    {
      icon: TrendingUp,
      title: 'Adapts Difficulty and Pacing',
      description: 'Adjusts content complexity and learning speed based on your progress and performance'
    },
    {
      icon: Zap,
      title: 'Applies Kaizen to Learning',
      description: 'Continuously improves the training experience through iterative feedback and optimization'
    }
  ];

  const metrics = [
    { label: 'Competence Gain Score', value: '20–40%', color: 'from-purple-400 to-pink-500' },
    { label: 'Module Completion Rate', value: '75–90%', color: 'from-pink-400 to-purple-500' },
    { label: 'Skill Application Rate', value: '60–80%', color: 'from-fuchsia-400 to-purple-500' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Container */}
        <motion.div
          className="relative w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 rounded-3xl shadow-2xl border border-purple-400/30"
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            boxShadow: '0 0 80px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(168, 85, 247, 0.1)'
          }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full border border-purple-400/30 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
            }}
          >
            <X className="w-6 h-6 text-purple-400" />
          </motion.button>

          {/* Header */}
          <div className="relative p-8 pb-6 border-b border-purple-400/20">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                    '0 0 40px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <GraduationCap className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Role-Based Skill Accelerator
                </h2>
                <p className="text-purple-100/70 text-lg mt-1">
                  Project Management • Learning & Development
                </p>
              </div>
            </motion.div>
          </div>

          {/* Metrics Bar */}
          <div className="px-8 py-6 bg-slate-800/30 border-b border-purple-400/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="text-sm text-purple-200/60 mb-2">{metric.label}</div>
                  <div className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${metric.color}`}>
                    {metric.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">

            {/* Left: Carousel */}
            <div className="space-y-6">
              <motion.div
                className="relative bg-slate-800/50 rounded-2xl p-6 border border-purple-400/20"
                style={{
                  perspective: '1000px',
                  boxShadow: 'inset 0 0 40px rgba(168, 85, 247, 0.1)'
                }}
              >
                {/* Carousel Container */}
                <div className="relative h-[500px] overflow-hidden rounded-xl">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentSlide}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        rotateY: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 }
                      }}
                      className="absolute inset-0 flex flex-col"
                      style={{
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      {/* Image */}
                      <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900/50">
                        <img
                          src={slides[currentSlide].image}
                          alt={slides[currentSlide].title}
                          className="w-full h-full object-contain"
                          style={{
                            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))'
                          }}
                        />
                      </div>

                      {/* Slide Info */}
                      <motion.div
                        className="mt-4 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold text-purple-300 mb-2">
                          {slides[currentSlide].title}
                        </h3>
                        <p className="text-lg text-pink-300 mb-2">
                          {slides[currentSlide].subtitle}
                        </p>
                        <p className="text-purple-100/70">
                          {slides[currentSlide].description}
                        </p>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-6">
                  <motion.button
                    onClick={handlePrev}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-full border border-purple-400/30 transition-all duration-300"
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
                    }}
                  >
                    <ChevronLeft className="w-6 h-6 text-purple-400" />
                  </motion.button>

                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          setDirection(index > currentSlide ? 1 : -1);
                          setCurrentSlide(index);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'w-8 bg-purple-400'
                            : 'w-2 bg-purple-400/30 hover:bg-purple-400/50'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        style={{
                          boxShadow: index === currentSlide ? '0 0 10px rgba(168, 85, 247, 0.6)' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  <motion.button
                    onClick={handleNext}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-full border border-purple-400/30 transition-all duration-300"
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
                    }}
                  >
                    <ChevronRight className="w-6 h-6 text-purple-400" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right: Key Features */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-purple-300 mb-2">
                  Key Features
                </h3>
                <p className="text-purple-100/70 mb-6">
                  Accelerate skill development with personalized training plans, curated materials, and adaptive learning.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-4">
                {keyFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      className="bg-slate-800/50 rounded-xl p-5 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)'
                      }}
                      style={{
                        boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.05)'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-lg border border-purple-400/30"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="w-6 h-6 text-purple-400" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-purple-300 mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-purple-100/60">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-8 pt-0">
            <motion.div
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-400/30 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                boxShadow: 'inset 0 0 40px rgba(168, 85, 247, 0.1)'
              }}
            >
              <h3 className="text-2xl font-bold text-purple-300 mb-3">
                Ready to Accelerate Your Skills?
              </h3>
              <p className="text-purple-100/70 mb-6 max-w-2xl mx-auto">
                Join professionals who've mastered new competencies faster with AI-powered personalized training.
              </p>
              <motion.button
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-xl text-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
                }}
              >
                Start Learning Now →
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleBasedSkillModal;


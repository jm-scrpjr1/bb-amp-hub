import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ListTodo, Target, Users, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

const SmartProjectOrganizerModal = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = [
    {
      image: '/images/Client Facing Images/Smart_.png',
      title: 'Smart Project Organizer',
      subtitle: 'Transform Meeting Notes into Action',
      description: 'Upload meeting notes or brainstorming transcripts and watch them transform into structured plans.'
    },
    {
      image: '/images/Client Facing Images/Smart_1.png',
      title: 'Extract Goals & Outcomes',
      subtitle: 'Identify Key Objectives',
      description: 'Automatically identifies objectives, stakeholders, and success criteria from your discussions.'
    },
    {
      image: '/images/Client Facing Images/Smart_3.png',
      title: 'Organized Action Plan',
      subtitle: 'Collaborative Task Tracker',
      description: 'Get a clear, prioritized task list with assignees, priorities, and due dates.'
    },
    {
      image: '/images/Client Facing Images/Smart_4.png',
      title: 'Risk & Improvement Insights',
      subtitle: 'Proactive Problem Detection',
      description: 'Surface potential risks, blockers, and opportunities for continuous improvement.'
    },
    {
      image: '/images/Client Facing Images/Smart_5.png',
      title: 'Ready to Execute',
      subtitle: 'From Chaos to Clarity',
      description: 'Your team gets a complete, actionable project plan ready to drive results.'
    }
  ];

  // Auto-advance carousel every 4 seconds (if we add more slides later)
  useEffect(() => {
    if (!isOpen || slides.length <= 1) return;

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

  const advantages = [
    {
      icon: Target,
      title: 'Extracts Goals and Outcomes',
      description: 'Automatically identifies key objectives and desired outcomes from your discussions'
    },
    {
      icon: ListTodo,
      title: 'Transforms Ideas into Tasks',
      description: 'Converts brainstorming sessions into actionable, trackable tasks'
    },
    {
      icon: TrendingUp,
      title: 'Prioritizes and Balances Workload',
      description: 'Smart prioritization ensures your team focuses on what matters most'
    },
    {
      icon: CheckCircle,
      title: 'Builds a Structured Project Plan',
      description: 'Creates a comprehensive action plan with clear ownership and deadlines'
    },
    {
      icon: AlertTriangle,
      title: 'Surfaces Risks and Blockers',
      description: 'Proactively identifies potential obstacles before they become problems'
    },
    {
      icon: Users,
      title: 'Supports Continuous Improvement',
      description: 'Tracks progress and suggests optimizations for better team alignment'
    }
  ];

  const metrics = [
    { label: 'Time Saved', value: '3–5 hours/week', color: 'from-green-400 to-emerald-500' },
    { label: 'Tasks Tracked', value: '+40% more', color: 'from-blue-400 to-cyan-500' },
    { label: 'Team Alignment', value: 'Improved by 85%', color: 'from-purple-400 to-pink-500' }
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
          className="relative w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-indigo-900/90 to-slate-900 rounded-3xl shadow-2xl border border-blue-400/30"
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            boxShadow: '0 0 80px rgba(59, 130, 246, 0.4), inset 0 0 60px rgba(59, 130, 246, 0.1)'
          }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full border border-blue-400/30 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}
          >
            <X className="w-6 h-6 text-blue-400" />
          </motion.button>

          {/* Header */}
          <div className="relative p-8 pb-6 border-b border-blue-400/20">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 40px rgba(59, 130, 246, 0.8)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ListTodo className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Smart Project Organizer
                </h2>
                <p className="text-blue-100/70 text-lg mt-1">
                  How It Works - Transform Meetings into Action Plans
                </p>
              </div>
            </motion.div>
          </div>

          {/* Metrics Bar */}
          <div className="px-8 py-6 bg-slate-800/30 border-b border-blue-400/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="text-sm text-blue-200/60 mb-2">{metric.label}</div>
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
                className="relative bg-slate-800/50 rounded-2xl p-6 border border-blue-400/20"
                style={{
                  perspective: '1000px',
                  boxShadow: 'inset 0 0 40px rgba(59, 130, 246, 0.1)'
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
                            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
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
                        <h3 className="text-2xl font-bold text-blue-300 mb-2">
                          {slides[currentSlide].title}
                        </h3>
                        <p className="text-lg text-indigo-300 mb-2">
                          {slides[currentSlide].subtitle}
                        </p>
                        <p className="text-blue-100/70">
                          {slides[currentSlide].description}
                        </p>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Controls - Only show if multiple slides */}
                {slides.length > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <motion.button
                      onClick={handlePrev}
                      className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-full border border-blue-400/30 transition-all duration-300"
                      whileHover={{ scale: 1.1, x: -5 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <ChevronLeft className="w-6 h-6 text-blue-400" />
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
                              ? 'w-8 bg-blue-400'
                              : 'w-2 bg-blue-400/30 hover:bg-blue-400/50'
                          }`}
                          whileHover={{ scale: 1.2 }}
                          style={{
                            boxShadow: index === currentSlide ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none'
                          }}
                        />
                      ))}
                    </div>

                    <motion.button
                      onClick={handleNext}
                      className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-full border border-blue-400/30 transition-all duration-300"
                      whileHover={{ scale: 1.1, x: 5 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <ChevronRight className="w-6 h-6 text-blue-400" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Advantages */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-blue-300 mb-2">
                  Why Smart Project Organizer?
                </h3>
                <p className="text-blue-100/70 mb-6">
                  Purpose-built for execution coaching - turn messy meeting notes into clear, actionable project plans in seconds.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-4">
                {advantages.map((advantage, index) => {
                  const Icon = advantage.icon;
                  return (
                    <motion.div
                      key={index}
                      className="bg-slate-800/50 rounded-xl p-5 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                      }}
                      style={{
                        boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.05)'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-lg border border-blue-400/30"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="w-6 h-6 text-blue-400" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-blue-300 mb-1">
                            {advantage.title}
                          </h4>
                          <p className="text-sm text-blue-100/60">
                            {advantage.description}
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
              className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl p-6 border border-blue-400/30 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                boxShadow: 'inset 0 0 40px rgba(59, 130, 246, 0.1)'
              }}
            >
              <h3 className="text-2xl font-bold text-blue-300 mb-3">
                Ready to Transform Your Project Management?
              </h3>
              <p className="text-blue-100/70 mb-6 max-w-2xl mx-auto">
                Join teams who've streamlined their execution with Smart Project Organizer's AI-powered planning.
              </p>
              <motion.button
                onClick={onClose}
                className="px-8 py-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-900 font-bold rounded-xl text-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                }}
              >
                Get Started Now →
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartProjectOrganizerModal;


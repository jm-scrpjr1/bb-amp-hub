import React from 'react';
import { motion } from 'framer-motion';
import { ScrollEffects } from '../effects';

const HeroSection = () => {
  const handleExploreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const event = new CustomEvent('showAmplificationOnboarding');
    window.dispatchEvent(event);
  };



  return (
    <ScrollEffects effect="fadeUp" delay={0.2}>
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden mb-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-5 transform -translate-x-24 translate-y-24"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between relative z-10">
          {/* Left Content */}
          <div className="flex-1 text-left mb-8 lg:mb-0 lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Get to know Your
                <br />
                <span className="text-cyan-300">AI-Amplifiers</span>
                <span className="text-sm align-super">™</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Your personal productivity partner is here to help you get started, automate routine tasks, and amplify your results.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.div
                onClick={handleExploreClick}
                className="bg-cyan-400 hover:bg-cyan-300 text-blue-900 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Your AI Workbench →
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content - AI Amplifiers Image */}
          <div className="flex-shrink-0 lg:ml-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <img
                src="/images/ai-amplifiers.png"
                alt="AI Amplifiers"
                className="w-[640px] h-[512px] md:w-[768px] md:h-[640px] object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </ScrollEffects>
  );
};

export default HeroSection;

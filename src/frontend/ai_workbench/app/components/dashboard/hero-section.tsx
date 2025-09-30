"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollEffects } from '@/components/effects';

export default function HeroSection() {
  const handleExploreClick = () => {
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
            <ScrollEffects effect="fadeUp" delay={0.4}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Get to know Your
                <br />
                <span className="text-cyan-300">AI-Amplifiers</span>
                <span className="text-sm align-super">™</span>
              </h1>
            </ScrollEffects>

            <ScrollEffects effect="fadeUp" delay={0.6}>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Your personal productivity partner is here to help you get started, automate routine tasks, and amplify your results.
              </p>
            </ScrollEffects>

            <ScrollEffects effect="fadeUp" delay={0.8}>
              <motion.div
                onClick={handleExploreClick}
                className="bg-cyan-400 hover:bg-cyan-300 text-blue-900 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Your AI Workbench →
              </motion.div>
            </ScrollEffects>
          </div>

          {/* Right Content - Robot Team */}
          <div className="flex-shrink-0">
            <ScrollEffects effect="fadeUp" delay={1.0}>
              <motion.div
                className="relative w-96 h-64 md:w-[48rem] md:h-80"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <img
                  src="/images/robot-team.png"
                  alt="AI-Amplifiers Robot Team"
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </ScrollEffects>
          </div>
        </div>
      </div>
    </ScrollEffects>
  );
}

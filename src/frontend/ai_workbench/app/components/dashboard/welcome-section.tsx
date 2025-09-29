
"use client";

import { useState, useEffect } from 'react';
// Temporary: Using custom icons until lucide-react is installed
// import { Bot, Sparkles } from 'lucide-react';
import { Sparkles } from '@/components/icons';
import { useSession } from 'next-auth/react';
import { mockUser } from '@/lib/mock-data';
import { ScrollTextReveal, ScrollEffects } from '@/components/effects';
// import TextScramble from '@/components/effects/text-scramble';
// import HolographicText from '@/components/effects/holographic-text';
// import ParticleField from '@/components/effects/particle-field';
// import CyberGrid from '@/components/effects/cyber-grid';
// import ScrollReveal from '@/components/effects/scroll-reveal';
// import { motion } from 'framer-motion';

export default function WelcomeSection() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get the user's first name - exact same logic as header
  const getUserName = () => {
    if (status === 'loading') {
      return 'Loading...'; // Show loading state
    }
    return session?.user?.name?.split(' ')[0] || mockUser.name;
  };

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 md:p-12 mb-8 text-white relative overflow-hidden transition-all duration-1000 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      {/* Background decoration - simplified */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>

      <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="flex-1 text-left mb-6 md:mb-0">
          {/* Welcome Message */}
          {status === 'loading' ? (
            <div className="space-y-4">
              <div className="h-8 bg-white/20 rounded animate-pulse w-64"></div>
              <div className="h-6 bg-white/20 rounded animate-pulse w-48"></div>
            </div>
          ) : (
            <ScrollTextReveal effect="scramble" delay={0.4}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome, {getUserName()}!
              </h1>
            </ScrollTextReveal>
          )}

          <ScrollEffects effect="fadeUp" delay={0.6}>
            <h2 className="text-xl md:text-2xl text-blue-100 mb-4 font-medium flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-cyan-300" />
              AI-Amplified™ Workspace
            </h2>
          </ScrollEffects>

          <ScrollEffects effect="fadeUp" delay={0.8}>
            <div className="space-y-2 text-blue-100 mb-6">
              <p className="text-lg">Select your tools. Start your work. Ask for help.</p>
              <p className="text-lg font-semibold">Get amplified results.</p>
            </div>
          </ScrollEffects>

          <ScrollEffects effect="fadeUp" delay={1.0}>
            <button
              onClick={() => {
                const event = new CustomEvent('showAmplificationOnboarding');
                window.dispatchEvent(event);
              }}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-md"
            >
              Learn about the amplification workflow
            </button>
          </ScrollEffects>
        </div>

        {/* AI Assistant Illustration - matches dev.boldbusiness.com */}
        <div className="flex-shrink-0 md:ml-8">
          <ScrollEffects effect="scale" delay={0.6}>
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl md:text-3xl">🤖</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                Hello!
              </div>
            </div>
          </ScrollEffects>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import WelcomeSection from '@/components/dashboard/welcome-section';
import QuickActions from '@/components/dashboard/quick-actions';
import BoldUpdates from '@/components/dashboard/bold-updates';
import ActivitySection from '@/components/dashboard/activity-section';
import PageTransition from '@/components/layout/page-transition';
import AmplificationOnboarding from '@/components/onboarding/amplification-onboarding';
import { useSession } from 'next-auth/react';
import { ScrollEffects, AnimatedText, ScrollTextReveal } from '@/components/effects';
// import ScrollReveal from '@/components/effects/scroll-reveal';
// import CyberGrid from '@/components/effects/cyber-grid';
// import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users (you can customize this logic)
  useEffect(() => {
    if (session) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenAmplificationOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }

    // Listen for manual onboarding trigger
    const handleShowOnboarding = () => {
      setShowOnboarding(true);
    };

    window.addEventListener('showAmplificationOnboarding', handleShowOnboarding);
    return () => {
      window.removeEventListener('showAmplificationOnboarding', handleShowOnboarding);
    };
  }, [session]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenAmplificationOnboarding', 'true');
  };

  return (
    <MainLayout>
      <AmplificationOnboarding
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="welcome-section">
            <WelcomeSection />
          </div>

          {/* Amplification Workflow Cards */}
          <ScrollEffects effect="fadeUp" delay={0.2}>
            <div className="amplification-narrative bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-12 border border-cyan-200/50">
              <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
                <ScrollEffects effect="fadeUp" delay={0.6}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-cyan-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex-1 h-[220px] flex flex-col justify-center">
                    <AnimatedText
                      text="1. Select Your Tools"
                      className="text-cyan-600 font-bold mb-4 text-2xl text-center"
                      animation="fadeUp"
                      by="word"
                      delay={0.8}
                    />
                    <p className="text-gray-600 text-lg leading-relaxed text-center">Choose from our AI-powered toolkit</p>
                  </div>
                </ScrollEffects>

                <ScrollEffects effect="fadeUp" delay={0.8}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex-1 h-[220px] flex flex-col justify-center">
                    <AnimatedText
                      text="2. Start Your Work"
                      className="text-blue-600 font-bold mb-4 text-2xl text-center"
                      animation="fadeUp"
                      by="word"
                      delay={1.0}
                    />
                    <p className="text-gray-600 text-lg leading-relaxed text-center">Begin your projects with confidence</p>
                  </div>
                </ScrollEffects>

                <ScrollEffects effect="fadeUp" delay={1.0}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex-1 h-[220px] flex flex-col justify-center">
                    <AnimatedText
                      text="3. Ask for Help"
                      className="text-purple-600 font-bold mb-4 text-2xl text-center"
                      animation="fadeUp"
                      by="word"
                      delay={1.2}
                    />
                    <p className="text-gray-600 text-lg leading-relaxed text-center">Get assistance from ARIA when needed</p>
                  </div>
                </ScrollEffects>

                <ScrollEffects effect="fadeUp" delay={1.2}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex-1 h-[220px] flex flex-col justify-center">
                    <AnimatedText
                      text="4. Get Amplified Results"
                      className="text-green-600 font-bold mb-4 text-2xl text-center"
                      animation="fadeUp"
                      by="word"
                      delay={1.4}
                    />
                    <p className="text-gray-600 text-lg leading-relaxed text-center">Achieve more than you thought possible</p>
                  </div>
                </ScrollEffects>
              </div>
            </div>
          </ScrollEffects>

          {/* Quick Actions */}
          <div className="quick-actions">
            <QuickActions />
          </div>

          {/* Bold Updates */}
          <div className="bold-updates">
            <BoldUpdates />
          </div>

          {/* Activity Section */}
          <div className="activity-section">
            <ActivitySection />
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}

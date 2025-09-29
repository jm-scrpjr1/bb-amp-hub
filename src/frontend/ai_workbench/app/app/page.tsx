
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

          {/* Amplification Narrative Section */}
          <div className="amplification-narrative bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200/50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🚀 Your AI-Amplified Workflow
              </h2>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-cyan-100">
                  <div className="text-cyan-600 font-semibold mb-2">1. Select Your Tools</div>
                  <p className="text-gray-600">Choose from our AI-powered toolkit</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="text-blue-600 font-semibold mb-2">2. Start Your Work</div>
                  <p className="text-gray-600">Begin your projects with confidence</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <div className="text-purple-600 font-semibold mb-2">3. Ask for Help</div>
                  <p className="text-gray-600">Get assistance from ARIA when needed</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <div className="text-green-600 font-semibold mb-2">4. Get Amplified Results</div>
                  <p className="text-gray-600">Achieve more than you thought possible</p>
                </div>
              </div>
            </div>
          </div>

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

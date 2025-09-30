
"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import HeroSection from '@/components/dashboard/hero-section';
import WorkspaceQuickstart from '@/components/dashboard/workspace-quickstart';
import ProjectsSection from '@/components/dashboard/projects-section';
import TrainingStatus from '@/components/dashboard/training-status';
import AriaChatBubble from '@/components/ui/aria-chat-bubble';
import PageTransition from '@/components/layout/page-transition';
import AmplificationOnboarding from '@/components/onboarding/amplification-onboarding';
import { useSession } from 'next-auth/react';
import { ScrollEffects } from '@/components/effects';

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
      <AriaChatBubble />
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <HeroSection />

          {/* Workspace Quickstart */}
          <WorkspaceQuickstart />

          {/* Bottom Section with Projects and Training Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProjectsSection />
            <TrainingStatus />
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}

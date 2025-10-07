import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import {
  HeroSection,
  TrainingStatus
} from '../components/dashboard';
import WorkspaceQuickstart from '../components/dashboard/WorkspaceQuickstart';
import ProjectsSection from '../components/dashboard/ProjectsSection';
import FloatingARIA from '../components/chat/FloatingARIA';
import { useAuth } from '../providers/AuthProvider';

const HomePage = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenAmplificationOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenAmplificationOnboarding', 'true');
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section - Now at the top */}
        <HeroSection />

        {/* Workspace Quickstart */}
        <WorkspaceQuickstart />

        {/* Bottom Section with Projects and Training Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProjectsSection />
          <TrainingStatus />
        </div>
      </div>

      {/* Floating ARIA Chat */}
      <FloatingARIA />
    </MainLayout>
  );
};

export default HomePage;

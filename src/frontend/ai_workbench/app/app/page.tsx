
"use client";

import MainLayout from '@/components/layout/main-layout';
import WelcomeSection from '@/components/dashboard/welcome-section';
import QuickActions from '@/components/dashboard/quick-actions';
import BoldUpdates from '@/components/dashboard/bold-updates';
import ActivitySection from '@/components/dashboard/activity-section';
import PageTransition from '@/components/layout/page-transition';
// import ScrollReveal from '@/components/effects/scroll-reveal';
// import CyberGrid from '@/components/effects/cyber-grid';
// import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <MainLayout>
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="welcome-section">
            <WelcomeSection />
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

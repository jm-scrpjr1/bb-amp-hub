
"use client";

import MainLayout from '@/components/layout/main-layout';
import WelcomeSection from '@/components/dashboard/welcome-section';
import QuickActions from '@/components/dashboard/quick-actions';
import BoldUpdates from '@/components/dashboard/bold-updates';
import ActivitySection from '@/components/dashboard/activity-section';
import PageTransition from '@/components/layout/page-transition';
import ScrollReveal from '@/components/animations/ScrollReveal';

export default function HomePage() {
  return (
    <MainLayout>
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <ScrollReveal direction="fade" delay={0.1} className="page-element">
            <div className="welcome-section">
              <WelcomeSection />
            </div>
          </ScrollReveal>

          {/* Quick Actions */}
          <ScrollReveal direction="up" delay={0.3} className="page-element">
            <div className="quick-actions">
              <QuickActions />
            </div>
          </ScrollReveal>

          {/* Bold Updates */}
          <ScrollReveal direction="left" delay={0.5} className="page-element">
            <div className="bold-updates">
              <BoldUpdates />
            </div>
          </ScrollReveal>

          {/* Activity Section */}
          <ScrollReveal direction="right" delay={0.7} className="page-element">
            <div className="activity-section">
              <ActivitySection />
            </div>
          </ScrollReveal>
        </div>
      </PageTransition>
    </MainLayout>
  );
}

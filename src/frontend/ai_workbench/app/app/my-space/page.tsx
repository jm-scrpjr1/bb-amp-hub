"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import WelcomeSection from '@/components/dashboard/welcome-section';
import QuickActions from '@/components/dashboard/quick-actions';
import BoldUpdates from '@/components/dashboard/bold-updates';
import ActivitySection from '@/components/dashboard/activity-section';
import PageTransition from '@/components/layout/page-transition';
import AmplificationOnboarding from '@/components/onboarding/amplification-onboarding';
import DirectMessageModal from '@/components/ui/direct-message-modal';
import GroupChatModal from '@/components/ui/group-chat-modal';
import { useSession } from 'next-auth/react';
import { ScrollEffects, AnimatedText, ScrollTextReveal } from '@/components/effects';

export default function MySpacePage() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [directMessageModal, setDirectMessageModal] = useState<{isOpen: boolean, recipientName: string}>({
    isOpen: false,
    recipientName: ''
  });
  const [groupChatModal, setGroupChatModal] = useState<{isOpen: boolean, groupName: string}>({
    isOpen: false,
    groupName: ''
  });

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

  const handleDirectMessageClick = (recipientName: string) => {
    setDirectMessageModal({ isOpen: true, recipientName });
  };

  const handleGroupChatClick = (groupName: string) => {
    setGroupChatModal({ isOpen: true, groupName });
  };

  return (
    <MainLayout>
      <AmplificationOnboarding
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
      />
      <PageTransition>
        <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
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

          {/* Right Panel */}
          <div className="w-80 space-y-6">
            {/* Resources Section */}
            <ScrollEffects effect="fadeUp" delay={0.2}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Project Name</div>
                      <div className="text-xs text-gray-500">Project Details</div>
                    </div>
                    <div className="text-xs text-gray-400">Project Status</div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Project Name</div>
                      <div className="text-xs text-gray-500">Project Details</div>
                    </div>
                    <div className="text-xs text-gray-400">Project Status</div>
                  </div>
                </div>
              </div>
            </ScrollEffects>

            {/* Messages Section */}
            <ScrollEffects effect="fadeUp" delay={0.4}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>

                {/* Direct Messages */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Direct Messages</h4>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleDirectMessageClick('Ron Rivero')}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Ron Rivero</div>
                        <div className="text-xs text-gray-500 truncate">Got it Ed! Thanks...</div>
                      </div>
                      <div className="text-xs text-gray-400">Yesterday</div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleDirectMessageClick('Amanda Simmons')}
                    >
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Amanda Simmons</div>
                        <div className="text-xs text-gray-500 truncate">Yeah, I agree on that. Thanks Ed...</div>
                      </div>
                      <div className="text-xs text-gray-400">10:55 am</div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleDirectMessageClick('Aaron Jay Buenaventura')}
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Aaron Jay Buenaventura</div>
                        <div className="text-xs text-gray-500 truncate">What do you think about the content outline...</div>
                      </div>
                      <div className="text-xs text-gray-400">10:55 am</div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleDirectMessageClick('Czar Chavez')}
                    >
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Czar Chavez</div>
                        <div className="text-xs text-gray-500 truncate">Sure Ed.</div>
                      </div>
                      <div className="text-xs text-gray-400">10:55 am</div>
                    </div>
                    <div
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleDirectMessageClick('Dustin Johnson')}
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Dustin Johnson</div>
                        <div className="text-xs text-gray-500 truncate">You Okay.</div>
                      </div>
                      <div className="text-xs text-gray-400">Fri</div>
                    </div>
                  </div>
                </div>

                {/* Group Chats */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Group Chats</h4>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleGroupChatClick('Marketing Team')}
                    >
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex-shrink-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">Marketing Team</div>
                        <div className="text-xs text-gray-500 truncate">You: Can you email me the PDF of training...</div>
                      </div>
                      <div className="text-xs text-gray-400">Yesterday</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollEffects>
          </div>
        </div>
      </PageTransition>

      {/* Direct Message Modal */}
      <DirectMessageModal
        isOpen={directMessageModal.isOpen}
        onClose={() => setDirectMessageModal({ isOpen: false, recipientName: '' })}
        recipientName={directMessageModal.recipientName}
      />

      {/* Group Chat Modal */}
      <GroupChatModal
        isOpen={groupChatModal.isOpen}
        onClose={() => setGroupChatModal({ isOpen: false, groupName: '' })}
        groupName={groupChatModal.groupName}
        memberCount={5}
      />
    </MainLayout>
  );
}

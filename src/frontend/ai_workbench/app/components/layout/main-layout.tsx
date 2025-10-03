
"use client";

import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import TutorialTour from '../tutorial/tutorial-tour';
import PageTransition from './page-transition';
import FloatingChatbot from '../ui/floating-chatbot';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <div className="sidebar flex-shrink-0 h-screen">
        <Sidebar onStartTour={startTour} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>

      {/* Tutorial Tour */}
      <TutorialTour isOpen={isTourOpen} onClose={closeTour} />

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
}

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onStartTour={startTour}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="page-transition animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* TODO: Add Tutorial Tour when we port it */}
      {/* Tutorial Tour */}
      {/* <TutorialTour isOpen={isTourOpen} onClose={closeTour} /> */}

      {/* TODO: Add Floating Chatbot when we port it */}
      {/* Floating Chatbot */}
      {/* <FloatingChatbot /> */}
    </div>
  );
};

export default MainLayout;

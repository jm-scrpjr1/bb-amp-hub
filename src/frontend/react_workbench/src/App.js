import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import AuthProvider from './providers/AuthProvider';
import ThemeProvider from './providers/ThemeProvider';
import { RBACProvider } from './providers/RBACProvider';
// import GSAPProvider from './components/animations/GSAPProvider'; // Temporarily disabled for performance

// Effects
// import { LiquidCursor } from './components/effects'; // Temporarily disabled for performance

// UI Components
import { FloatingChatbot, TrackTimeModal, BoldIdeaModal, TicketConfirmationModal } from './components/ui';

// Pages
import HomePage from './pages/HomePage';
import MySpacePage from './pages/MySpacePage';
import AIAgentsPage from './pages/AIAgentsPage';
import AIAssessmentsPage from './pages/AIAssessmentsPage';
import AutomationsPage from './pages/AutomationsPage';
import PromptTutorPage from './pages/PromptTutorPage';
import TrainingsPage from './pages/TrainingsPage';
import ResourcesPage from './pages/ResourcesPage';
import ActivityPage from './pages/ActivityPage';
import GroupsPage from './pages/GroupsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import SubmitBoldIdeaPage from './pages/SubmitBoldIdeaPage';
import SignInPage from './pages/SignInPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  // Modal states
  const [trackTimeModalOpen, setTrackTimeModalOpen] = useState(false);
  const [boldIdeaModalOpen, setBoldIdeaModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState('IT');
  const [triggerElement, setTriggerElement] = useState(null);

  // Event listeners for modal triggers
  useEffect(() => {
    const handleOpenTrackTimeModal = (event) => {
      setTriggerElement(event.detail?.triggerElement || null);
      setTrackTimeModalOpen(true);
    };

    const handleOpenBoldIdeaModal = (event) => {
      setTriggerElement(event.detail?.triggerElement || null);
      setBoldIdeaModalOpen(true);
    };

    const handleOpenTicketModal = (event) => {
      setTriggerElement(event.detail?.triggerElement || null);
      setTicketType(event.detail?.type || 'IT');
      setTicketModalOpen(true);
    };

    // Add event listeners
    window.addEventListener('openTrackTimeModal', handleOpenTrackTimeModal);
    window.addEventListener('openBoldIdeaModal', handleOpenBoldIdeaModal);
    window.addEventListener('openTicketModal', handleOpenTicketModal);

    // Cleanup
    return () => {
      window.removeEventListener('openTrackTimeModal', handleOpenTrackTimeModal);
      window.removeEventListener('openBoldIdeaModal', handleOpenBoldIdeaModal);
      window.removeEventListener('openTicketModal', handleOpenTicketModal);
    };
  }, []);

  return (
    <AuthProvider>
      <RBACProvider>
          <ThemeProvider
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            {/* <LiquidCursor
              color="#06E5EC"
              size={24}
              intensity="medium"
            /> */}
            <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/signin/" element={<SignInPage />} />
            <Route path="/signin" element={<SignInPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/my-space" element={
              <ProtectedRoute>
                <MySpacePage />
              </ProtectedRoute>
            } />
            
            <Route path="/ai-agents" element={
              <ProtectedRoute>
                <AIAgentsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/ai-assessments" element={
              <ProtectedRoute>
                <AIAssessmentsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/automations" element={
              <ProtectedRoute>
                <AutomationsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/prompt-tutor" element={
              <ProtectedRoute>
                <PromptTutorPage />
              </ProtectedRoute>
            } />
            
            <Route path="/trainings" element={
              <ProtectedRoute>
                <TrainingsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/resources" element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/activity" element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            } />
            
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsersPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/submit-bold-idea" element={
              <ProtectedRoute>
                <SubmitBoldIdeaPage />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
          {/* Floating Chatbot */}
          <FloatingChatbot />

          {/* Modals */}
          <TrackTimeModal
            isOpen={trackTimeModalOpen}
            onClose={() => setTrackTimeModalOpen(false)}
            triggerElement={triggerElement}
          />

          <BoldIdeaModal
            isOpen={boldIdeaModalOpen}
            onClose={() => setBoldIdeaModalOpen(false)}
            triggerElement={triggerElement}
          />

          <TicketConfirmationModal
            isOpen={ticketModalOpen}
            onClose={() => setTicketModalOpen(false)}
            triggerElement={triggerElement}
            ticketType={ticketType}
          />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
            </div>
          </ThemeProvider>
      </RBACProvider>
    </AuthProvider>
  );
}

export default App;

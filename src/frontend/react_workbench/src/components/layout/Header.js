import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useRBAC } from '../../providers/RBACProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import AISearch from '../search/AISearch';

const Header = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const { canAccessAdminPanel } = useRBAC();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  // Mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position
  useEffect(() => {
    if (isDropdownOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll for translucency effect
  useEffect(() => {
    function handleScroll() {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth/signin');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setIsDropdownOpen(false);
    navigate('/settings');
  };

  const handleAdminPanel = () => {
    setIsDropdownOpen(false);
    navigate('/admin');
  };

  return (
    <>
      <header className={`bg-white shadow-sm border-b border-gray-200 backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 border-gray-200/30'
          : 'bg-white/95 border-gray-200/50'
      }`}>
        {/* Background decoration */}
        <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-50 to-cyan-50 transition-opacity duration-300 ${
          isScrolled ? 'opacity-20' : 'opacity-50'
        }`}></div>

        <div className="flex items-center justify-between px-6 py-4 relative z-10">
          {/* Left side */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Center - AI Search - Always centered */}
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-2xl">
              <AISearch className="w-full" />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
              </div>

              <div className="relative">
                <button
                  ref={avatarRef}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user?.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Dropdown Portal */}
      {mounted && isDropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
          style={{
            zIndex: 2147483647,
            top: dropdownPosition.top,
            right: dropdownPosition.right
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                <p className="text-xs text-blue-600 font-medium uppercase">
                  {user?.role || 'MEMBER'}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={handleViewProfile}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>

            <button
              onClick={handleSettings}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

            {canAccessAdminPanel() && (
              <button
                onClick={handleAdminPanel}
                className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Panel
                <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                  Admin
                </span>
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;

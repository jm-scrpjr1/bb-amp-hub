import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Bot,
  Zap,
  ClipboardList,
  Users,
  Activity,
  FileText,
  GraduationCap,
  Lightbulb,
  Settings,
  LogOut,
  X,
  Ticket,
  BarChart,
  Server,
  Wrench,
  User,
  File,
  Circle,
  Shield
} from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';

// Navigation items matching the Next.js workbench structure
const navigationItems = [
  // MY AI-AMPLIFIERS Section
  { id: 'home', name: 'AI Home', icon: '/images/HOME ICON.png', path: '/home', active: true },
  { id: 'prompt-tutor', name: 'Instant Prompts', icon: '/images/PROMPT ICON.png', path: '/prompt-tutor' },
  { id: 'automations', name: 'Guided Builders', icon: '/images/AUTOMATION ICON.png', path: '/automations' },
  { id: 'ai-agents', name: 'Agentic Workflows', icon: '/images/AI AGENT ICON.png', path: '/ai-agents' },
  { id: 'trainings', name: 'Knowledge and Trainings', icon: '/images/TRAINING ICON.svg', path: '/trainings' },

  // EMPLOYEE TOOLS Section
  { id: 'my-space', name: 'My Space', icon: '/images/MY SPACE ICON.png', path: '/my-space' },
  { id: 'activity', name: 'Activity', icon: '/images/RESOURCES ICON.png', path: '/activity' },
  { id: 'groups', name: 'Groups', icon: '/images/GRP ICON.png', path: '/groups' },
  { id: 'resources', name: 'Resources', icon: '/images/RESOURCES ICON.png', path: '/resources' },
  { id: 'submit-bold-idea', name: 'Submit Bold Idea', icon: '/images/SUBMIT BOLD IDEA ICON.png', path: '/submit-bold-idea' },

  // OTHER OPTIONS Section
  { id: 'settings', name: 'Settings', icon: '/images/SETTINGS.png', path: '/settings' },
  { id: 'logout', name: 'Logout', icon: '/images/Logout.png', path: '#' }
];

const iconMap = {
  Home,
  BookOpen,
  Bot,
  Zap,
  ClipboardList,
  Users,
  Activity,
  FileText,
  GraduationCap,
  Lightbulb,
  Settings,
  LogOut,
  Ticket,
  BarChart,
  Server,
  Wrench,
  User,
  File,
  Circle,
  Shield
};

const Sidebar = ({ isOpen, onClose, onStartTour }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { boldBusinessTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState('home');

  // Filter navigation items based on user permissions
  const getFilteredNavigationItems = () => {
    return navigationItems.filter(item => {
      // Show admin panel only to authorized users
      if (item.adminOnly) {
        // Temporary: Show admin panel for owner email during development
        if (user?.email === 'jlope@boldbusiness.com') {
          return true;
        }
        // Add more permission logic here
        return false;
      }
      return true;
    });
  };

  const handleNavigation = useCallback(async (itemId, path) => {
    setActiveItem(itemId);
    if (itemId === 'logout') {
      // Handle logout using the same functionality as the profile dropdown
      try {
        await signOut();
        navigate('/auth/signin');
      } catch (error) {
        console.error('Error signing out:', error);
        navigate('/auth/signin');
      }
      return;
    }

    if (itemId === 'submit-bold-idea') {
      // Dispatch event to open bold idea modal (handled by App.js)
      const event = new CustomEvent('openBoldIdeaModal');
      window.dispatchEvent(event);
      return;
    }

    // Navigate to the route
    navigate(path);
    onClose?.();
  }, [navigate, onClose, signOut]);

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };



  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-screen flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Logo Section - Always visible, styled based on theme */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="block hover:opacity-80 transition-opacity duration-200">
            <div className="flex flex-col items-center">
              <div className={`text-sm font-medium mb-2 ${boldBusinessTheme ? 'text-cyan-400' : 'text-gray-500'}`}>
                Bold Business
              </div>
              <img
                src="/images/AI Workbench Logo.png"
                alt="AI Workbench Logo"
                className={`h-15 object-contain transition-all duration-300 ${
                  boldBusinessTheme ? 'filter brightness-110 drop-shadow-lg' : ''
                }`}
              />
            </div>
          </Link>
        </div>

        {/* MY AI-AMPLIFIERS Section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            MY AI-AMPLIFIERS
          </p>
          <nav className="space-y-1">
            {getFilteredNavigationItems().slice(0, 5).map((item) => {
              const active = isActive(item.path);
              const href = item.id === 'home' ? '/' : item.path;

              return (
                <Link
                  key={item.id}
                  to={href}
                  className={cn(
                    "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                    active
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                    active
                      ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                      : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                    item.adminOnly && active && "ring-purple-400/50",
                    item.adminOnly && !active && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                  )}>
                    <img
                      src={item.icon}
                      alt={`${item.name} icon`}
                      className={cn(
                        "w-4 h-4 transition-all duration-300 relative z-10",
                        item.id === 'home' && "brightness-0 invert"
                      )}
                    />
                    {active && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                  <span className={cn(
                    "transition-all duration-300",
                    active && "font-semibold"
                  )}>
                    {item.name}
                  </span>
                  {item.adminOnly && (
                    <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* EMPLOYEE TOOLS Section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            EMPLOYEE TOOLS
          </p>
          <nav className="space-y-1">
            {getFilteredNavigationItems().slice(5, -2).map((item) => {
              const active = isActive(item.path);
              const href = item.id === 'submit-bold-idea' ? '#' : item.path;

              return (
                <Link
                  key={item.id}
                  to={href}
                  onClick={(e) => {
                    if (item.id === 'submit-bold-idea') {
                      e.preventDefault();
                      handleNavigation(item.id, href);
                    }
                  }}
                  className={cn(
                    "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                    active
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                    active
                      ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                      : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                    item.adminOnly && active && "ring-purple-400/50",
                    item.adminOnly && !active && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                  )}>
                    <img
                      src={item.icon}
                      alt={`${item.name} icon`}
                      className="w-4 h-4 transition-all duration-300 relative z-10"
                    />
                    {active && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                  <span className={cn(
                    "transition-all duration-300",
                    active && "font-semibold"
                  )}>
                    {item.name}
                  </span>
                  {item.adminOnly && (
                    <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* OTHER OPTIONS Section */}
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            OTHER OPTIONS
          </p>
          <nav className="space-y-1">
            {getFilteredNavigationItems().slice(-2).map((item) => {
              const Icon = iconMap[item.icon];
              const active = isActive(item.path);
              const isSvgIcon = item.icon.startsWith('/images/');
              const href = item.id === 'logout' ? '#' : item.path;

              return (
                <Link
                  key={item.id}
                  to={href}
                  onClick={(e) => {
                    if (item.id === 'logout') {
                      e.preventDefault();
                      handleNavigation(item.id, href);
                    }
                  }}
                  className={cn(
                    "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                    item.id === 'logout'
                      ? "text-red-700 hover:text-red-900 hover:bg-red-50"
                      : active
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                    item.id === 'logout'
                      ? "bg-white hover:bg-gray-50 shadow-sm"
                      : active
                      ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                      : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                    item.adminOnly && active && "ring-purple-400/50",
                    item.adminOnly && !active && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                  )}>
                    {isSvgIcon ? (
                      <img
                        src={item.icon}
                        alt={`${item.name} icon`}
                        className={cn(
                          "transition-all duration-300 relative z-10",
                          item.id === 'logout' ? "w-6 h-6" : "w-4 h-4"
                        )}
                      />
                    ) : (
                      Icon && <Icon className={cn(
                        "h-5 w-5 transition-all duration-300 relative z-10",
                        item.id === 'logout'
                          ? "text-white drop-shadow-sm"
                          : active
                          ? "text-white drop-shadow-sm"
                          : "text-gray-300 group-hover:text-white"
                      )} />
                    )}
                    {active && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                  <span className={cn(
                    "transition-all duration-300",
                    active && "font-semibold"
                  )}>
                    {item.name}
                  </span>
                  {item.adminOnly && (
                    <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

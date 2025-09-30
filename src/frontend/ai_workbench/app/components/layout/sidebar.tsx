
"use client";

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// Temporary: Using custom icons until lucide-react is installed
// import {
//   Home,
//   BookOpen,
//   Bot,
//   Zap,
//   ClipboardList,
//   Users,
//   Activity as ActivityIcon,
//   FileText,
//   GraduationCap,
//   Lightbulb,
//   Settings,
//   LogOut
// } from 'lucide-react';
import {
  Home,
  BookOpen,
  Bot,
  Zap,
  ClipboardList,
  Users,
  Activity as ActivityIcon,
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
  Document,
  Circle,
  Shield,
  Clock
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/lib/mock-data';
import TicketConfirmationModal from '@/components/ui/ticket-confirmation-modal';
import BoldIdeaModal from '@/components/ui/bold-idea-modal';
import TrackTimeModal from '@/components/ui/track-time-modal';
import { canAccessAdminPanel } from '@/lib/permissions';

const iconMap = {
  Home,
  BookOpen,
  Bot,
  Zap,
  ClipboardList,
  Users,
  Activity: ActivityIcon,
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
  Document,
  Circle,
  Shield,
  Clock
};

interface SidebarProps {
  onStartTour?: () => void;
}

export default function Sidebar({ onStartTour }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeItem, setActiveItem] = useState('home');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isBoldIdeaModalOpen, setIsBoldIdeaModalOpen] = useState(false);
  const [isTrackTimeModalOpen, setIsTrackTimeModalOpen] = useState(false);

  // Filter navigation items based on user permissions
  const getFilteredNavigationItems = () => {
    return navigationItems.filter(item => {
      // Show admin panel only to authorized users
      if (item.adminOnly) {
        const user = session?.user as any; // Type assertion for now

        // Temporary: Show admin panel for owner email during development
        if (user?.email === 'jlope@boldbusiness.com') {
          return true;
        }

        return canAccessAdminPanel(user);
      }
      return true;
    });
  };

  const handleNavigation = useCallback((itemId: string, href: string) => {
    setActiveItem(itemId);
    if (itemId === 'logout') {
      // Handle logout logic here
      console.log('Logout clicked');
      return;
    }
    if (itemId === 'submit-ticket') {
      // Open ticket modal instead of navigating
      setIsTicketModalOpen(true);
      return;
    }
    if (itemId === 'submit-bold-idea') {
      // Open bold idea modal instead of navigating
      setIsBoldIdeaModalOpen(true);
      return;
    }
    if (itemId === 'track-my-time') {
      // Open track time modal instead of navigating
      setIsTrackTimeModalOpen(true);
      return;
    }
    // Navigate to the route
    router.push(href);
  }, [router]);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-right">
          <div className="text-sm text-gray-500 font-medium">Bold Business</div>
          <div className="text-xl font-bold text-blue-600">
            AI W<span className="text-cyan-500">o</span>rkbench<span className="text-sm align-super">™</span>
          </div>
        </div>
      </div>

      {/* AI Assistants Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          AI ASSISTANTS
        </p>
        <nav className="space-y-1">
          {getFilteredNavigationItems().slice(0, 5).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}` || (pathname === '/' && item.id === 'home');

            const href = item.id === 'home' ? '/' : `/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onMouseEnter={() => router.prefetch(href)}
                className={cn(
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                  isActive
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                  item.adminOnly && isActive && "ring-purple-400/50",
                  item.adminOnly && !isActive && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300 relative z-10",
                    isActive
                      ? "text-white drop-shadow-sm"
                      : "text-gray-300 group-hover:text-white"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
                  )}
                </div>
                <span className={cn(
                  "transition-all duration-300",
                  isActive && "font-semibold"
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

      {/* Other Pages Section */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          EMPLOYEE TOOLS
        </p>
        <nav className="space-y-1">
          {getFilteredNavigationItems().slice(5, -4).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;

            const href = item.id === 'submit-bold-idea' || item.id === 'track-my-time' ? '#' : `/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onClick={(e) => {
                  if (item.id === 'submit-bold-idea' || item.id === 'track-my-time') {
                    e.preventDefault();
                    handleNavigation(item.id, href);
                  }
                }}
                onMouseEnter={() => href !== '#' && router.prefetch(href)}
                className={cn(
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                  isActive
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                  item.adminOnly && isActive && "ring-purple-400/50",
                  item.adminOnly && !isActive && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300 relative z-10",
                    isActive
                      ? "text-white drop-shadow-sm"
                      : "text-gray-300 group-hover:text-white"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
                  )}
                </div>
                <span className={cn(
                  "transition-all duration-300",
                  isActive && "font-semibold"
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

      {/* Other Options Section */}
      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          OTHER OPTIONS
        </p>
        <nav className="space-y-1">
          {getFilteredNavigationItems().slice(-4).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;

            const href = item.id === 'logout' || item.id === 'submit-ticket' ? '#' : `/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onClick={(e) => {
                  if (item.id === 'logout' || item.id === 'submit-ticket') {
                    e.preventDefault();
                    handleNavigation(item.id, href);
                  }
                }}
                onMouseEnter={() => href !== '#' && router.prefetch(href)}
                className={cn(
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                  isActive
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                  item.adminOnly && isActive && "ring-purple-400/50",
                  item.adminOnly && !isActive && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300 relative z-10",
                    isActive
                      ? "text-white drop-shadow-sm"
                      : "text-gray-300 group-hover:text-white"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50 animate-pulse pointer-events-none"></div>
                  )}
                </div>
                <span className={cn(
                  "transition-all duration-300",
                  isActive && "font-semibold"
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

      {/* Tutorial Button */}
      <div className="p-4 border-t border-gray-200">
        <div
          onClick={onStartTour}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer text-center"
        >
          Start Tutorial Tour
        </div>
      </div>

      {/* Ticket Confirmation Modal */}
      <TicketConfirmationModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      {/* Bold Idea Modal */}
      <BoldIdeaModal
        isOpen={isBoldIdeaModalOpen}
        onClose={() => setIsBoldIdeaModalOpen(false)}
      />

      {/* Track Time Modal */}
      <TrackTimeModal
        isOpen={isTrackTimeModalOpen}
        onClose={() => setIsTrackTimeModalOpen(false)}
      />
    </div>
  );
}

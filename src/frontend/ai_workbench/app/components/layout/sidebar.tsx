
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
  Shield
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/lib/mock-data';
import TicketConfirmationModal from '@/components/ui/ticket-confirmation-modal';
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
  Shield
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
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  item.adminOnly && "bg-purple-50 text-purple-700 hover:bg-purple-100"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
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
          OTHER PAGES
        </p>
        <nav className="space-y-1">
          {getFilteredNavigationItems().slice(5, -3).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;

            const href = `/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onMouseEnter={() => router.prefetch(href)}
                className={cn(
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  item.adminOnly && "bg-purple-50 text-purple-700 hover:bg-purple-100"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
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
          {getFilteredNavigationItems().slice(-3).map((item) => {
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
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  item.adminOnly && "bg-purple-50 text-purple-700 hover:bg-purple-100"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
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
    </div>
  );
}

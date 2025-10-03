
"use client";

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
import BoldIdeaModal from '@/components/ui/bold-idea-modal';

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
  const [isBoldIdeaModalOpen, setIsBoldIdeaModalOpen] = useState(false);


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

  const handleNavigation = useCallback(async (itemId: string, href: string) => {
    setActiveItem(itemId);
    if (itemId === 'logout') {
      // Mirror the same functionality from Sign Out button
      await signOut({ callbackUrl: '/auth/signin' });
      return;
    }

    if (itemId === 'submit-bold-idea') {
      // Open bold idea modal instead of navigating
      setIsBoldIdeaModalOpen(true);
      return;
    }

    // Navigate to the route
    router.push(href);
  }, [router]);

  // Listen for search-triggered modal events
  useEffect(() => {
    const handleOpenTicketModal = () => setIsTicketModalOpen(true);
    const handleOpenBoldIdeaModal = () => setIsBoldIdeaModalOpen(true);

    window.addEventListener('openTicketModal', handleOpenTicketModal);
    window.addEventListener('openBoldIdeaModal', handleOpenBoldIdeaModal);

    return () => {
      window.removeEventListener('openTicketModal', handleOpenTicketModal);
      window.removeEventListener('openBoldIdeaModal', handleOpenBoldIdeaModal);
    };
  }, []);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col overflow-hidden">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="block hover:opacity-80 transition-opacity duration-200">
          <div className="flex flex-col items-center">
            <div className="text-sm text-gray-500 font-medium mb-2">Bold Business</div>
            <Image
              src="/images/AI Workbench Logo.png"
              alt="AI Workbench Logo"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* My AI-Amplifiers Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          MY AI-AMPLIFIERS
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
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          EMPLOYEE TOOLS
        </p>
        <nav className="space-y-1">
          {getFilteredNavigationItems().slice(5, -2).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;

            const href = item.id === 'submit-bold-idea' ? '#' : `/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onClick={(e) => {
                  if (item.id === 'submit-bold-idea') {
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
          {getFilteredNavigationItems().slice(-2).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;

            const href = item.id === 'logout' ? '#' : `/${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onClick={(e) => {
                  if (item.id === 'logout') {
                    e.preventDefault();
                    handleNavigation(item.id, href);
                  }
                }}
                onMouseEnter={() => href !== '#' && router.prefetch(href)}
                className={cn(
                  "nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                  item.id === 'logout'
                    ? "text-red-700 hover:text-red-900 hover:bg-red-50"
                    : isActive
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                  item.id === 'logout'
                    ? "bg-gradient-to-br from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 hover:shadow-md hover:shadow-red-700/20"
                    : isActive
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-slate-800/30 ring-2 ring-blue-400/50"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 hover:shadow-md hover:shadow-slate-700/20",
                  item.adminOnly && isActive && "ring-purple-400/50",
                  item.adminOnly && !isActive && "from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300 relative z-10",
                    item.id === 'logout'
                      ? "text-white drop-shadow-sm"
                      : isActive
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


    </div>
  );
}

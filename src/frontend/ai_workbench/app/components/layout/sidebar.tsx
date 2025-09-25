
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogOut
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/lib/mock-data';

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
  LogOut
};

interface SidebarProps {
  onStartTour?: () => void;
}

export default function Sidebar({ onStartTour }: SidebarProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('home');

  const handleNavigation = (itemId: string) => {
    setActiveItem(itemId);
    if (itemId === 'logout') {
      // Handle logout logic here
      console.log('Logout clicked');
      return;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">
          AI <span className="text-gray-900">Workbench</span>
          <sup className="text-xs">TM</sup>
        </h1>
      </div>

      {/* AI Assistants Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          AI ASSISTANTS
        </p>
        <nav className="space-y-1">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}` || (pathname === '/' && item.id === 'home');
            
            return (
              <Link
                key={item.id}
                href={item.id === 'home' ? '/' : `/${item.id}`}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
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
          {navigationItems.slice(5, -2).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;
            
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
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
          {navigationItems.slice(-2).map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive = pathname === `/${item.id}`;
            
            return (
              <Link
                key={item.id}
                href={item.id === 'logout' ? '#' : `/${item.id}`}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tutorial Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onStartTour}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Start Tutorial Tour
        </button>
      </div>
    </div>
  );
}

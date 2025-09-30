"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

// Search icon component
const Search = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

// AI Sparkle icon
const Sparkles = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

// Comprehensive search data
const searchData = {
  pages: [
    { id: 'home', title: 'AI Home', description: 'Dashboard with quick actions and activity feed', path: '/', category: 'Navigation' },
    { id: 'prompt-tutor', title: 'Prompts', description: 'Learn AI prompting techniques and best practices', path: '/prompt-tutor', category: 'AI Learning' },
    { id: 'automations', title: 'Automations', description: 'Create and manage workflow automations', path: '/automations', category: 'AI Tools' },
    { id: 'ai-agents', title: 'AI Agents', description: 'Manage and interact with AI assistants', path: '/ai-agents', category: 'AI Tools' },
    { id: 'trainings', title: 'Trainings', description: 'Browse available training courses', path: '/trainings', category: 'Learning' },
    { id: 'my-space', title: 'My Space', description: 'Your personal workspace and preferences', path: '/my-space', category: 'Personal' },
    { id: 'activity', title: 'Activity', description: 'View recent activities and updates', path: '/activity', category: 'Navigation' },
    { id: 'groups', title: 'Groups', description: 'Manage teams and group collaborations', path: '/groups', category: 'Collaboration' },
    { id: 'resources', title: 'Resources', description: 'Access documents, forms, and policies', path: '/resources', category: 'Documentation' },
    { id: 'admin', title: 'Admin Panel', description: 'Administrative tools and settings', path: '/admin', category: 'Administration' },
    { id: 'settings', title: 'Settings', description: 'Configure your preferences', path: '/settings', category: 'Configuration' },
  ],
  actions: [
    { id: 'submit-ticket', title: 'Submit Ticket', description: 'Get technical support and help', action: 'modal', category: 'Support' },
    { id: 'submit-bold-idea', title: 'Submit Bold Idea', description: 'Share innovative ideas and suggestions', action: 'modal', category: 'Innovation' },
  ],
  resources: [
    { id: 'quickbooks', title: 'Quickbooks Timesheets', description: 'Employee timesheet manual for all countries', category: 'Important Tools' },
    { id: 'aup', title: 'Acceptable Use Policy', description: 'IT usage guidelines for all countries', category: 'Important Tools' },
    { id: 'payroll-sprout', title: 'Payroll Sprout', description: 'Philippines payroll system', category: 'Important Tools' },
    { id: 'payroll-aleluya', title: 'Payroll Aleluya', description: 'Colombia payroll system', category: 'Important Tools' },
    { id: 'rippling', title: 'Rippling Account', description: 'US payroll and HR system', category: 'Important Tools' },
    { id: 'leave-policy', title: 'Leave Application Policy', description: 'Leave policies for PH & COL', category: 'Reading Manuals' },
    { id: 'referral-program', title: 'BBPH Referral Program', description: 'Employee referral guidelines', category: 'Reading Manuals' },
    { id: 'code-conduct', title: 'Code of Conduct', description: 'Company conduct guidelines', category: 'Reading Manuals' },
    { id: 'pip-form', title: 'PIP Form', description: 'Performance Improvement Plan documentation', category: 'Supervisor Tools' },
  ],
  trainings: [
    { id: 'react-basics', title: 'React Basics', description: '2h 30min course on React fundamentals', category: 'Development' },
    { id: 'typescript', title: 'TypeScript Fundamentals', description: '1h 45min TypeScript course', category: 'Development' },
    { id: 'nextjs', title: 'Next.js Advanced', description: '3h 15min advanced Next.js course', category: 'Development' },
  ]
};

interface AISearchProps {
  className?: string;
}

export default function AISearch({ className = "" }: AISearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const allResults: any[] = [];

    // Search pages
    searchData.pages.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) || 
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'page' });
      }
    });

    // Search actions
    searchData.actions.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) || 
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'action' });
      }
    });

    // Search resources
    searchData.resources.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) || 
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'resource' });
      }
    });

    // Search trainings
    searchData.trainings.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) || 
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'training' });
      }
    });

    setResults(allResults.slice(0, 8)); // Limit to 8 results
  }, [query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery('');

    if (item.type === 'page') {
      router.push(item.path);
    } else if (item.type === 'action') {
      // Trigger modal actions
      if (item.id === 'submit-ticket') {
        // Trigger ticket modal
        const event = new CustomEvent('openTicketModal');
        window.dispatchEvent(event);
      } else if (item.id === 'submit-bold-idea') {
        // Trigger bold idea modal
        const event = new CustomEvent('openBoldIdeaModal');
        window.dispatchEvent(event);
      }
    } else if (item.type === 'resource') {
      router.push('/resources');
    } else if (item.type === 'training') {
      router.push('/trainings');
    }
  };

  const getItemIcon = (type: string, category: string) => {
    switch (type) {
      case 'page':
        return '📄';
      case 'action':
        return '⚡';
      case 'resource':
        return '📚';
      case 'training':
        return '🎓';
      default:
        return '🔍';
    }
  };

  return (
    <>
      {/* Search Trigger */}
      <div className={`relative ${className}`}>
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-3 flex items-center space-x-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 shadow-sm hover:shadow-md group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <Sparkles className="h-4 w-4 text-cyan-400 group-hover:text-cyan-500 transition-colors animate-pulse" />
          </div>
          <span className="flex-1 text-gray-500 group-hover:text-gray-700 transition-colors font-medium">
            Search anything... AI-amplified
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">⌘</kbd>
            <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">K</kbd>
          </div>
        </motion.button>
      </div>

      {/* Search Modal */}
      {isMounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-purple-500/15 backdrop-blur-sm flex items-start justify-center pt-20"
              style={{ zIndex: 999999 }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                ref={searchRef}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-2xl mx-4 relative"
                style={{ zIndex: 1000000 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Command className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative" style={{ zIndex: 1000001 }}>
                <div className="flex items-center border-b px-4 py-3 bg-white">
                  <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <Sparkles className="h-4 w-4 text-cyan-400 mr-3 animate-pulse flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search pages, actions, resources, trainings..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 focus:ring-0 text-base bg-transparent text-gray-900 placeholder:text-gray-500 flex-1 outline-none w-full h-11 py-3"
                    autoFocus
                  />
                  <motion.button
                    onClick={() => setIsAIMode(!isAIMode)}
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isAIMode 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    AI Mode
                  </motion.button>
                </div>

                <CommandList className="max-h-96 overflow-y-auto">
                  {results.length === 0 && query && (
                    <CommandEmpty className="py-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Sparkles className="h-8 w-8 text-gray-300" />
                        <p className="text-gray-500">No results found</p>
                        <p className="text-xs text-gray-400">Try different keywords or enable AI Mode</p>
                      </div>
                    </CommandEmpty>
                  )}

                  {results.length > 0 && (
                    <>
                      <CommandGroup heading="Search Results">
                        {results.map((item) => (
                          <CommandItem
                            key={`${item.type}-${item.id}`}
                            onSelect={() => handleSelect(item)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 cursor-pointer"
                          >
                            <span className="text-lg">{getItemIcon(item.type, item.category)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 truncate">{item.description}</p>
                            </div>
                            {isAIMode && (
                              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}

                  {!query && (
                    <CommandGroup heading="Quick Actions">
                      <CommandItem onSelect={() => handleSelect({ type: 'action', id: 'submit-ticket' })} className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 cursor-pointer">
                        <span className="text-lg">🎫</span>
                        <div>
                          <p className="font-medium text-gray-900">Submit Ticket</p>
                          <p className="text-sm text-gray-500">Get technical support</p>
                        </div>
                      </CommandItem>
                      <CommandItem onSelect={() => handleSelect({ type: 'action', id: 'submit-bold-idea' })} className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 cursor-pointer">
                        <span className="text-lg">💡</span>
                        <div>
                          <p className="font-medium text-gray-900">Submit Bold Idea</p>
                          <p className="text-sm text-gray-500">Share your innovations</p>
                        </div>
                      </CommandItem>
                      <CommandItem onSelect={() => handleSelect({ type: 'page', path: '/resources' })} className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 cursor-pointer">
                        <span className="text-lg">📚</span>
                        <div>
                          <p className="font-medium text-gray-900">Resources</p>
                          <p className="text-sm text-gray-500">Access documents and forms</p>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>

                <div className="border-t px-4 py-2 text-xs text-gray-500 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span>Press ↵ to select • ⌘K to search • ESC to close</span>
                    <div className="flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      <span>AI-Amplified Search</span>
                    </div>
                  </div>
                </div>
                </Command>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

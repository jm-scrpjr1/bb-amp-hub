import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Search, Sparkles } from 'lucide-react';

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
    { id: 'laptop-reselling', title: 'Laptop Reselling Program', description: 'Employee laptop reselling program for PH', category: 'Employee Benefits' },
    { id: 'hr-service-desk', title: 'HR Service Desk', description: 'Monday.com HR support portal', category: 'Important Tools' },
    { id: 'it-service-desk', title: 'IT Service Desk', description: 'JIRA IT support portal', category: 'Important Tools' },
    { id: 'sprout-training', title: 'Sprout Training Modules', description: 'Manager and employee training for Sprout system', category: 'Training' },
    { id: 'email-signature', title: 'BB Email Signature', description: 'Company email signature template', category: 'General' },
    { id: 'ooo-template', title: 'Out of Office Template', description: 'Email template for out of office messages', category: 'General' },
    { id: 'bank-info-form', title: 'Bank Information Update', description: 'Form to update banking details (PH)', category: 'HR Forms' },
    { id: 'hmo-form', title: 'HMO Form', description: 'Health maintenance organization form (PH)', category: 'HR Forms' },
    { id: 'gli-form', title: 'GLI Form', description: 'Group life insurance form (PH)', category: 'HR Forms' },
    { id: 'sss-loan-form', title: 'SSS/HDMF Loan Form', description: 'Social security loan form (PH)', category: 'HR Forms' },
    { id: 'coaching-log', title: 'Coaching Log Form', description: 'Employee coaching documentation', category: 'Supervisor Tools' },
    { id: 'caf-form', title: 'CAF Form', description: 'Corrective Action Form for supervisors', category: 'Supervisor Tools' },
    { id: 'performance-eval', title: 'Performance Evaluation Form', description: 'Probationary employee evaluation', category: 'Supervisor Tools' },
    { id: 'incident-report', title: 'Incident Report Form', description: 'Workplace incident reporting form', category: 'Supervisor Tools' },
  ],
  trainings: [
    { id: 'react-basics', title: 'React Basics', description: '2h 30min course on React fundamentals', category: 'Development' },
    { id: 'typescript', title: 'TypeScript Fundamentals', description: '1h 45min TypeScript course', category: 'Development' },
    { id: 'nextjs', title: 'Next.js Advanced', description: '3h 15min advanced Next.js course', category: 'Development' },
  ]
};

const AISearch = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle keyboard shortcuts and custom events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    const handleOpenAISearch = () => {
      setIsOpen(true);
      setIsAIMode(true); // Open in AI mode for better assistance
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openAISearch', handleOpenAISearch);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openAISearch', handleOpenAISearch);
    };
  }, []);

  // AI-powered natural language processing
  const processAIQuery = (query) => {
    const lowerQuery = query.toLowerCase();

    // Intent recognition patterns
    const intents = {
      timeTracking: ['log time', 'track time', 'timesheet', 'hours', 'log hours', 'time entry'],
      submitTicket: ['help', 'support', 'issue', 'problem', 'ticket', 'bug', 'error'],
      submitIdea: ['idea', 'suggestion', 'improve', 'feature', 'innovation', 'bold idea'],
      training: ['learn', 'training', 'course', 'tutorial', 'education', 'skill'],
      groups: ['team', 'group', 'collaborate', 'members', 'create team'],
      resources: ['document', 'policy', 'manual', 'form', 'resource', 'guide'],
      navigation: ['go to', 'open', 'navigate', 'show me', 'take me to']
    };

    // Smart suggestions based on query
    const suggestions = [];

    if (intents.timeTracking.some(intent => lowerQuery.includes(intent))) {
      suggestions.push('Open time tracking', 'Start timer', 'View timesheet');
      setAiResponse('I can help you track your time! Would you like to log hours or start a timer?');
    } else if (intents.submitTicket.some(intent => lowerQuery.includes(intent))) {
      suggestions.push('Submit IT ticket', 'Submit HR ticket', 'View ticket status');
      setAiResponse('I can help you get support! What type of issue are you experiencing?');
    } else if (intents.submitIdea.some(intent => lowerQuery.includes(intent))) {
      suggestions.push('Submit bold idea', 'View innovation portal', 'Browse ideas');
      setAiResponse('Great! I love innovative thinking. Let me help you submit your idea.');
    } else if (intents.training.some(intent => lowerQuery.includes(intent))) {
      suggestions.push('Browse trainings', 'My learning path', 'Skill assessments');
      setAiResponse('Ready to learn something new? I can show you available courses and training materials.');
    } else if (intents.groups.some(intent => lowerQuery.includes(intent))) {
      suggestions.push('Create new group', 'Join existing group', 'Manage teams');
      setAiResponse('Team collaboration is key! Would you like to create a new group or join an existing one?');
    } else if (intents.resources.some(intent => lowerQuery.includes(intent))) {
      suggestions.push('Browse resources', 'Company policies', 'Forms & documents');
      setAiResponse('I can help you find the right documents and resources. What are you looking for?');
    } else {
      suggestions.push('Search everything', 'Browse categories', 'Quick actions');
      setAiResponse('I\'m here to help! Try asking me something like "I need to log my time" or "How do I submit a ticket?"');
    }

    return suggestions;
  };

  // Enhanced search logic with AI mode
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setAiSuggestions([]);
      setAiResponse('');
      return;
    }

    setIsProcessing(true);

    if (isAIMode) {
      // AI Mode: Call ARIA to scan the site and provide intelligent responses
      const callARIA = async () => {
        try {
          const response = await fetch('http://localhost:3002/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: query
            })
          });

          const data = await response.json();

          if (data.success) {
            // Set ARIA's response
            setAiResponse(data.response);

            // Process routing suggestions from ARIA
            const ariaResults = [];

            if (data.routingSuggestions && data.routingSuggestions.length > 0) {
              data.routingSuggestions.forEach((suggestion) => {
                ariaResults.push({
                  id: suggestion.key,
                  title: suggestion.title,
                  description: suggestion.description,
                  type: 'ai-suggestion',
                  category: 'ARIA Suggestion',
                  aiRelevance: 'high',
                  path: suggestion.path,
                  action: suggestion.action
                });
              });
            }

            // Also do semantic search for additional context
            const searchTerm = query.toLowerCase();
            const semanticMatches = {
              'time': ['timesheet', 'hours', 'tracking', 'log'],
              'help': ['support', 'ticket', 'assistance', 'issue'],
              'learn': ['training', 'course', 'education', 'skill'],
              'team': ['group', 'collaborate', 'members', 'together'],
              'document': ['resource', 'policy', 'manual', 'guide']
            };

            // Enhanced search with semantic understanding
            Object.entries(semanticMatches).forEach(([key, synonyms]) => {
              if (searchTerm.includes(key) || synonyms.some(syn => searchTerm.includes(syn))) {
                searchData.pages.forEach(item => {
                  if (synonyms.some(syn =>
                    item.title.toLowerCase().includes(syn) ||
                    item.description.toLowerCase().includes(syn)
                  )) {
                    ariaResults.push({ ...item, type: 'page', aiRelevance: 'high' });
                  }
                });
              }
            });

            // Remove duplicates and prioritize ARIA suggestions
            const uniqueResults = ariaResults.filter((item, index, self) =>
              index === self.findIndex(t => t.id === item.id && t.type === item.type)
            );

            // Sort by AI relevance - ARIA suggestions first
            uniqueResults.sort((a, b) => {
              if (a.type === 'ai-suggestion' && b.type !== 'ai-suggestion') return -1;
              if (b.type === 'ai-suggestion' && a.type !== 'ai-suggestion') return 1;
              if (a.aiRelevance === 'high' && b.aiRelevance !== 'high') return -1;
              if (b.aiRelevance === 'high' && a.aiRelevance !== 'high') return 1;
              return 0;
            });

            setResults(uniqueResults.slice(0, 8));
            setAiSuggestions(processAIQuery(query));
          } else {
            // Fallback to local processing if ARIA fails
            setAiResponse('I\'m having trouble connecting to ARIA. Let me help you with local search.');
            setAiSuggestions(processAIQuery(query));
            performLocalSearch(query);
          }
        } catch (error) {
          console.error('Error calling ARIA:', error);
          // Fallback to local processing
          setAiResponse('I\'m having trouble connecting to ARIA. Let me help you with local search.');
          setAiSuggestions(processAIQuery(query));
          performLocalSearch(query);
        }

        setIsProcessing(false);
      };

      callARIA();
      return; // Don't continue with the timer-based approach for AI mode
    }

    // Standard mode: Use timer-based local search
    const timer = setTimeout(() => {
      // Clear AI-related states in normal mode
      setAiSuggestions([]);
      setAiResponse('');
      performLocalSearch(query);
      setIsProcessing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isAIMode]);

  // Local search function for standard mode and AI fallback
  const performLocalSearch = (searchQuery) => {
    const searchTerm = searchQuery.toLowerCase();
    const allResults = [];

    console.log('Performing local search for:', searchTerm);

    // Standard search (both modes)
    searchData.pages.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'page' });
      }
    });

    searchData.actions.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'action' });
      }
    });

    searchData.resources.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'resource' });
      }
    });

    searchData.trainings.forEach(item => {
      if (item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)) {
        allResults.push({ ...item, type: 'training' });
      }
    });

    // Remove duplicates
    const uniqueResults = allResults.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id && t.type === item.type)
    );

    console.log('Search results found:', uniqueResults.length, uniqueResults);
    setResults(uniqueResults.slice(0, 8));
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');

    if (item.type === 'page') {
      navigate(item.path);
    } else if (item.type === 'action') {
      // Trigger modal actions
      if (item.id === 'submit-ticket') {
        const event = new CustomEvent('openTicketModal');
        window.dispatchEvent(event);
      } else if (item.id === 'submit-bold-idea') {
        const event = new CustomEvent('openBoldIdeaModal');
        window.dispatchEvent(event);
      }
    } else if (item.type === 'resource') {
      navigate('/resources');
    } else if (item.type === 'training') {
      navigate('/trainings');
    } else if (item.type === 'ai-suggestion') {
      // Handle ARIA suggestions
      if (item.path) {
        navigate(item.path);
      } else if (item.action) {
        // Handle custom actions from ARIA
        const event = new CustomEvent(item.action);
        window.dispatchEvent(event);
      } else {
        // Fallback to title-based handling
        handleAISuggestion(item.title);
      }
    }
  };

  const handleAISuggestion = (suggestion) => {
    switch (suggestion) {
      case 'Open time tracking':
        const trackTimeEvent = new CustomEvent('openTrackTimeModal');
        window.dispatchEvent(trackTimeEvent);
        break;
      case 'Start timer':
        // Could integrate with actual timer functionality
        console.log('Starting timer...');
        break;
      case 'Submit IT ticket':
        const itTicketEvent = new CustomEvent('openITTicketModal');
        window.dispatchEvent(itTicketEvent);
        break;
      case 'Submit HR ticket':
        const hrTicketEvent = new CustomEvent('openHRTicketModal');
        window.dispatchEvent(hrTicketEvent);
        break;
      case 'Submit bold idea':
        const ideaEvent = new CustomEvent('openBoldIdeaModal');
        window.dispatchEvent(ideaEvent);
        break;
      case 'Browse trainings':
        navigate('/trainings');
        break;
      case 'Create new group':
        const groupEvent = new CustomEvent('openCreateGroupModal');
        window.dispatchEvent(groupEvent);
        break;
      case 'Browse resources':
        navigate('/resources');
        break;
      default:
        console.log('AI suggestion:', suggestion);
    }
  };

  const getItemIcon = (type, category) => {
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
          className="w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-6 py-3 flex items-center space-x-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 shadow-sm hover:shadow-md group min-w-0"
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <Sparkles className="h-4 w-4 text-cyan-400 group-hover:text-cyan-500 transition-colors animate-pulse" />
          </div>
          <span className="flex-1 text-gray-500 group-hover:text-gray-700 transition-colors font-medium text-left min-w-0 truncate">
            Search anything... AI-amplified
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-400 flex-shrink-0">
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
                className="w-full max-w-4xl mx-4 relative"
                style={{ zIndex: 1000000 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative" style={{ zIndex: 1000001 }}>
                  <div className="flex items-center border-b px-4 py-3 bg-white">
                    <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <Sparkles className="h-4 w-4 text-cyan-400 mr-3 animate-pulse flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={isAIMode ? "Ask me anything... 'I need to log my time' or 'How do I submit a ticket?'" : "Search pages, actions, resources, trainings..."}
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

                  <div className="max-h-96 overflow-y-auto">
                    {/* AI Processing Indicator */}
                    {isProcessing && isAIMode && (
                      <div className="py-6 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-cyan-400 animate-spin" />
                            <span className="text-sm text-gray-600">AI is thinking...</span>
                          </div>
                          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Response */}
                    {isAIMode && aiResponse && !isProcessing && (
                      <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
                        <div className="flex items-start space-x-3">
                          <Sparkles className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 mb-1">ARIA suggests:</p>
                            <p className="text-sm text-gray-600">{aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Suggestions */}
                    {isAIMode && aiSuggestions.length > 0 && !isProcessing && (
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-medium text-gray-500 mb-2">🤖 AI Suggestions</h3>
                        {aiSuggestions.map((suggestion, index) => (
                          <div
                            key={`ai-suggestion-${index}`}
                            onClick={() => handleAISuggestion(suggestion)}
                            className="flex items-center space-x-3 px-2 py-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer border-l-2 border-transparent hover:border-cyan-400 rounded-r-lg"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{suggestion}</p>
                              <p className="text-xs text-gray-500">AI-powered action</p>
                            </div>
                            <div className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full">
                              Smart
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {results.length === 0 && query && !isProcessing && (
                      <div className="py-8 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <Sparkles className="h-8 w-8 text-gray-300" />
                          <p className="text-gray-500">No results found</p>
                          <p className="text-xs text-gray-400">
                            {isAIMode ? 'Try asking in natural language like "I need help with..."' : 'Try different keywords or enable AI Mode'}
                          </p>
                        </div>
                      </div>
                    )}

                    {results.length > 0 && !isProcessing && (
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-medium text-gray-500 mb-2">{isAIMode ? "🔍 Search Results" : "Search Results"}</h3>
                        {results.map((item) => (
                          <div
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleSelect(item)}
                            className={`flex items-center space-x-3 px-2 py-3 hover:bg-blue-50 cursor-pointer rounded-lg ${
                              item.aiRelevance === 'high' ? 'border-l-2 border-cyan-400 bg-cyan-50/30' : ''
                            }`}
                          >
                            <span className="text-lg">{getItemIcon(item.type, item.category)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {item.category}
                                </span>
                                {item.aiRelevance === 'high' && (
                                  <span className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full">
                                    AI Match
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">{item.description}</p>
                            </div>
                            {isAIMode && (
                              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!query && (
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-medium text-gray-500 mb-2">Quick Actions</h3>
                        <div onClick={() => handleSelect({ type: 'action', id: 'submit-ticket' })} className="flex items-center space-x-3 px-2 py-3 hover:bg-blue-50 cursor-pointer rounded-lg">
                          <span className="text-lg">🎫</span>
                          <div>
                            <p className="font-medium text-gray-900">Submit Ticket</p>
                            <p className="text-sm text-gray-500">Get technical support</p>
                          </div>
                        </div>
                        <div onClick={() => handleSelect({ type: 'action', id: 'submit-bold-idea' })} className="flex items-center space-x-3 px-2 py-3 hover:bg-blue-50 cursor-pointer rounded-lg">
                          <span className="text-lg">💡</span>
                          <div>
                            <p className="font-medium text-gray-900">Submit Bold Idea</p>
                            <p className="text-sm text-gray-500">Share your innovations</p>
                          </div>
                        </div>
                        <div onClick={() => handleSelect({ type: 'page', path: '/resources' })} className="flex items-center space-x-3 px-2 py-3 hover:bg-blue-50 cursor-pointer rounded-lg">
                          <span className="text-lg">📚</span>
                          <div>
                            <p className="font-medium text-gray-900">Resources</p>
                            <p className="text-sm text-gray-500">Access documents and forms</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`border-t px-4 py-2 text-xs text-gray-500 ${isAIMode ? 'bg-gradient-to-r from-cyan-50 to-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span>
                        {isAIMode
                          ? 'Press ↵ to select • Try natural language • ESC to close'
                          : 'Press ↵ to select • ⌘K to search • ESC to close'
                        }
                      </span>
                      <div className="flex items-center space-x-1">
                        <Sparkles className={`h-3 w-3 ${isAIMode ? 'text-cyan-500' : 'text-cyan-400'}`} />
                        <span className={isAIMode ? 'text-cyan-700 font-medium' : ''}>
                          {isAIMode ? 'AI Mode Active' : 'AI-Amplified Search'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default AISearch;

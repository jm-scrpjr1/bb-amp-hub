import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, TrendingUp, Sparkles, RefreshCw, Clock, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../providers/AuthProvider';
import environmentConfig from '../../config/environment';
import WeeklyOptimizerSetupModal from './WeeklyOptimizerSetupModal';

const WeeklyOptimizerModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [error, setError] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentOptimization();
    }
  }, [isOpen]);

  const fetchCurrentOptimization = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${environmentConfig.apiUrl}/weekly-optimizer/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 404 is expected when no optimization exists yet
      if (response.status === 404) {
        setOptimization(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch optimization');
      }

      const data = await response.json();
      setOptimization(data.data);
    } catch (err) {
      console.error('Error fetching optimization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNow = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${environmentConfig.apiUrl}/weekly-optimizer/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.details || errorData.error || 'Failed to trigger optimization';
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Set the optimization from the response
      if (data.data) {
        setOptimization(data.data);
      } else {
        // If no data returned, fetch the current optimization
        await fetchCurrentOptimization();
      }
    } catch (err) {
      console.error('Error triggering optimization:', err);
      setError(err.message);
      // Re-throw for parent handlers
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const optimizationData = optimization?.optimization_data;
  const weekOverview = optimizationData?.week_overview;
  const recommendations = optimizationData?.recommendations || [];

  // Handle both old object format and new string format for daily_breakdown
  let dailyBreakdownContent = '';
  if (optimizationData?.daily_breakdown) {
    if (typeof optimizationData.daily_breakdown === 'string') {
      dailyBreakdownContent = optimizationData.daily_breakdown;
    } else if (typeof optimizationData.daily_breakdown === 'object') {
      // Convert old object format to string
      dailyBreakdownContent = Object.entries(optimizationData.daily_breakdown)
        .map(([day, content]) => `**${day}:**\n${content}`)
        .join('\n\n');
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-6 text-white">
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setShowSetup(true)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* AI Agent Image */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
                <img
                  src="/images/AI AGENT 4.png"
                  alt="Weekly Optimizer AI"
                  className="relative h-20 w-20 object-contain drop-shadow-2xl"
                />
              </motion.div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">Weekly Optimizer AI</h2>
                <p className="text-white/90 text-sm">Your intelligent planning assistant</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading && (
              <div className="space-y-6">
                {/* AI Agent Working */}
                <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 border-2 border-cyan-200">
                  <div className="flex items-start gap-4">
                    <motion.img
                      src="/images/AI AGENT 4.png"
                      alt="AI Agent"
                      className="h-16 w-16 object-contain"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="flex-1">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="h-4 w-4 text-cyan-500 animate-spin" />
                          <p className="text-gray-800 font-semibold">Analyzing your week...</p>
                        </div>
                        <p className="text-gray-600 text-sm">
                          I'm reviewing your calendar events, emails, and tasks to create your personalized optimization plan. This will just take a moment! ✨
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                    <p className="text-blue-900 text-sm font-medium">Scanning calendar...</p>
                  </motion.div>
                  <motion.div
                    className="bg-purple-50 rounded-xl p-4 border border-purple-200"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Sparkles className="h-6 w-6 text-purple-600 mb-2" />
                    <p className="text-purple-900 text-sm font-medium">Generating insights...</p>
                  </motion.div>
                  <motion.div
                    className="bg-cyan-50 rounded-xl p-4 border border-cyan-200"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  >
                    <RefreshCw className="h-6 w-6 text-cyan-600 mb-2" />
                    <p className="text-cyan-900 text-sm font-medium">Creating plan...</p>
                  </motion.div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <h3 className="text-red-800 font-semibold mb-2">Error loading optimization</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchCurrentOptimization}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && !optimization && (
              <div className="space-y-6">
                {/* AI Agent Greeting */}
                <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 border-2 border-cyan-200">
                  <div className="flex items-start gap-4">
                    <motion.img
                      src="/images/AI AGENT 4.png"
                      alt="AI Agent"
                      className="h-16 w-16 object-contain"
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="flex-1">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-gray-800 leading-relaxed">
                          👋 <strong>Hi there!</strong> I'm your Weekly Optimizer AI assistant.
                          I can analyze your calendar, emails, and tasks to create a personalized weekly plan.
                        </p>
                        <p className="text-gray-600 text-sm mt-3">
                          ✨ I'll help you prioritize meetings, find focus time, and optimize your schedule for maximum productivity!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Card */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-500" />
                    Ready to optimize your week?
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Configure your preferences or generate your first optimization right away!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowSetup(true)}
                      className="px-6 py-4 bg-white border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Settings className="h-5 w-5" />
                      Configure Settings
                    </button>
                    <button
                      onClick={handleGenerateNow}
                      disabled={loading}
                      className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      Generate Now
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Calendar Analysis</h4>
                    <p className="text-blue-700 text-xs">Review meetings & find focus time</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <Sparkles className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-900 text-sm mb-1">AI Insights</h4>
                    <p className="text-purple-700 text-xs">Smart recommendations & tips</p>
                  </div>
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <RefreshCw className="h-6 w-6 text-cyan-600 mb-2" />
                    <h4 className="font-semibold text-cyan-900 text-sm mb-1">Daily Breakdown</h4>
                    <p className="text-cyan-700 text-xs">Day-by-day action plan</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && optimization && (
              <div className="space-y-6">
                {/* Demo Data Banner */}
                {optimization.is_demo_data && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-500 rounded-full p-2 mt-0.5">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-1">📊 Demo Mode</h4>
                        <p className="text-sm text-amber-800">
                          This optimization uses sample data for demonstration. Calendar access requires Google Workspace admin configuration. Contact your IT admin to enable full calendar integration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Week Overview Stats */}
                {weekOverview && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Meetings</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {weekOverview.total_meetings || 0}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {typeof weekOverview.total_meeting_hours === 'number'
                          ? weekOverview.total_meeting_hours.toFixed(2)
                          : weekOverview.total_meeting_hours || 0}h scheduled
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Emails</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {weekOverview.total_emails || 0}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {weekOverview.unread_emails || 0} unread
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Workload</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {weekOverview.workload_level || 'Moderate'}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {weekOverview.available_hours || 0}h available
                      </p>
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                {optimizationData?.executive_summary && (
                  <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl p-6 border-2 border-cyan-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">🎯 Executive Summary</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {optimizationData.executive_summary}
                    </p>
                  </div>
                )}

                {/* Balance Analysis (Heijunka) */}
                {optimizationData?.balance_analysis && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">⚖️ Balance Analysis (Heijunka)</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {optimizationData.balance_analysis}
                    </p>
                  </div>
                )}

                {/* Recommended Priorities */}
                {optimizationData?.recommended_priorities && (
                  <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">🚀 Recommended Priorities</h3>
                    </div>

                    {/* Handle both string and array formats */}
                    {typeof optimizationData.recommended_priorities === 'string' ? (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {optimizationData.recommended_priorities}
                      </div>
                    ) : Array.isArray(optimizationData.recommended_priorities) ? (
                      <div className="space-y-4">
                        {optimizationData.recommended_priorities.map((item, index) => (
                          <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.priority}</h4>
                                <p className="text-gray-700 text-sm mb-2">{item.action}</p>

                                {/* Meeting details */}
                                {item.meeting_name && (
                                  <p className="text-purple-700 text-sm font-medium mb-2">
                                    📅 {item.meeting_name} {item.day && `- ${item.day}`} {item.time && `at ${item.time}`}
                                  </p>
                                )}

                                {/* Conflict details */}
                                {item.conflict_details && (
                                  <p className="text-gray-700 text-sm mb-2 bg-white p-2 rounded border-l-2 border-purple-400">
                                    {item.conflict_details}
                                  </p>
                                )}

                                {/* Reason */}
                                {item.reason && (
                                  <p className="text-gray-600 text-xs italic">💡 {item.reason}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Improvement Insights (Kaizen) */}
                {optimizationData?.improvement_insights && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">📈 Improvement Insights (Kaizen)</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {optimizationData.improvement_insights}
                    </p>
                  </div>
                )}

                {/* Risks & Conflicts */}
                {optimizationData?.risks_and_conflicts && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-300">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-800">⚠️ Risks & Items for Review</h3>
                    </div>

                    {/* Handle both string and array formats */}
                    {typeof optimizationData.risks_and_conflicts === 'string' ? (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {optimizationData.risks_and_conflicts}
                      </p>
                    ) : Array.isArray(optimizationData.risks_and_conflicts) && optimizationData.risks_and_conflicts.length > 0 ? (
                      <div className="space-y-3">
                        {optimizationData.risks_and_conflicts.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {item.type === 'conflict' && <span className="text-2xl">⚠️</span>}
                                {item.type === 'risk' && <span className="text-2xl">🚨</span>}
                                {item.type === 'attention' && <span className="text-2xl">👀</span>}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.description}</h4>
                                {item.meetings && item.meetings.length > 0 && (
                                  <div className="text-sm text-gray-700 mb-2">
                                    <strong>Meetings:</strong> {item.meetings.join(', ')}
                                  </div>
                                )}
                                {item.day && item.time && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    📅 {item.day} at {item.time}
                                  </p>
                                )}
                                {item.suggestion && (
                                  <div className="mt-2 bg-amber-100 rounded-md p-3 border border-amber-200">
                                    <p className="text-sm text-amber-900">
                                      <strong>💡 Suggestion:</strong> {item.suggestion}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No conflicts or risks detected for this week! 🎉</p>
                    )}
                  </div>
                )}

                {/* Daily Breakdown */}
                {dailyBreakdownContent && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-gray-800">📅 Daily Breakdown</h3>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {dailyBreakdownContent}
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleGenerateNow}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Optimization
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Setup Modal */}
      <WeeklyOptimizerSetupModal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        onSaveComplete={async () => {
          // After saving settings, trigger optimization
          await handleGenerateNow();
        }}
      />
    </AnimatePresence>
  );
};

export default WeeklyOptimizerModal;


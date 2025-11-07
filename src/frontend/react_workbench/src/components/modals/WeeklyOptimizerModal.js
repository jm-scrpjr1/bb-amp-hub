import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, TrendingUp, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../providers/AuthProvider';
import environmentConfig from '../../config/environment';

const WeeklyOptimizerModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [error, setError] = useState(null);

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
      setOptimization(data.optimization);
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
        throw new Error('Failed to trigger optimization');
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const optimizationData = optimization?.optimization_data;
  const weekOverview = optimizationData?.week_overview;
  const recommendations = optimizationData?.recommendations || [];
  const dailyBreakdown = optimizationData?.daily_breakdown || [];

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

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
                    Click below to generate your first AI-powered weekly optimization. I'll analyze your upcoming week and provide personalized insights.
                  </p>
                  <button
                    onClick={handleGenerateNow}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Generate My Weekly Optimization
                  </button>
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
                        {weekOverview.total_meeting_hours || 0}h scheduled
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

                {/* ARIA Insights */}
                {optimizationData?.aria_insights && (
                  <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl p-6 border border-cyan-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">ARIA's Insights</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {optimizationData.aria_insights}
                    </p>
                  </div>
                )}

                {/* Top Recommendations */}
                {recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Recommendations</h3>
                    <div className="space-y-3">
                      {recommendations.slice(0, 5).map((rec, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium">{rec.title || rec}</p>
                              {rec.description && (
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                              )}
                              {rec.impact && (
                                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  rec.impact === 'High' ? 'bg-red-100 text-red-700' :
                                  rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {rec.impact} Impact
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily Breakdown */}
                {dailyBreakdown.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
                    <div className="space-y-3">
                      {dailyBreakdown.map((day, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800">{day.day}</span>
                            <span className="text-sm text-gray-600">{day.meetings || 0} meetings</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${Math.min((day.capacity || 0) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">{day.summary}</p>
                        </div>
                      ))}
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
    </AnimatePresence>
  );
};

export default WeeklyOptimizerModal;


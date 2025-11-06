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
      setOptimization(data.optimization);
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
            
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Your Optimized Week</h2>
            </div>
            <p className="text-white/90">AI-powered insights for maximum productivity</p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-gray-600">Analyzing your week...</p>
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
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Your weekly optimization is being prepared!
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate your first optimization to get AI-powered insights
                </p>
                <button
                  onClick={handleGenerateNow}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Generate Now
                </button>
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


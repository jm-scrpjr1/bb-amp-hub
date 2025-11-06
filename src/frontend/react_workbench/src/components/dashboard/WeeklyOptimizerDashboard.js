import React, { useState, useEffect } from 'react';
import { Calendar, Mail, TrendingUp, Settings, RefreshCw, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { ScrollEffects } from '../effects';
import environmentConfig from '../../config/environment';

const API_URL = environmentConfig.apiUrl;

const WeeklyOptimizerDashboard = () => {
  const { user } = useAuth();
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchOptimization();
  }, []);

  const fetchOptimization = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/weekly-optimizer/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // No optimization yet - this is okay
        setOptimization(null);
        setError(null);
      } else if (!response.ok) {
        throw new Error('Failed to fetch optimization');
      } else {
        const data = await response.json();
        setOptimization(data.data);
      }
    } catch (err) {
      console.error('Error fetching optimization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/weekly-optimizer/trigger`, {
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
      setOptimization({ optimization_data: data.data });
      setError(null);
    } catch (err) {
      console.error('Error triggering optimization:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const optimizationData = optimization?.optimization_data || {};
  const weekOverview = optimizationData.week_overview || {};
  const recommendations = optimizationData.recommendations || [];
  const ariaInsights = optimizationData.aria_insights || '';
  const dailyBreakdown = optimizationData.daily_breakdown || {};

  // Calculate workload color
  const getWorkloadColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    const statusLower = status.toLowerCase();
    if (statusLower === 'high') return 'bg-red-100 text-red-700';
    if (statusLower === 'moderate') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ScrollEffects effect="fadeUp" delay={0.1}>
        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8" />
                <h2 className="text-3xl font-bold">Your Optimized Week</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh optimization"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!optimization ? (
              <div className="text-center py-8">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
                <p className="text-xl mb-4">Your weekly optimization is being prepared!</p>
                <p className="text-sm opacity-75">Check back soon or visit the AI Agents page to generate manually</p>
              </div>
            ) : (
              <p className="text-lg opacity-90">
                Week of {new Date(optimization.week_start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </ScrollEffects>

      {optimization && (
        <>
          {/* Week Overview Stats */}
          <ScrollEffects effect="fadeUp" delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Meetings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-cyan-500">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-6 w-6 text-cyan-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {weekOverview.total_meetings || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Meetings</p>
                <p className="text-xs text-gray-500 mt-1">
                  {weekOverview.total_meeting_hours || 0} hours total
                </p>
              </div>

              {/* Emails */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <Mail className="h-6 w-6 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {weekOverview.unread_emails || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Unread Emails</p>
                <p className="text-xs text-gray-500 mt-1">
                  {weekOverview.high_priority_emails || 0} high priority
                </p>
              </div>

              {/* Workload */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getWorkloadColor(weekOverview.workload_status)}`}>
                    {weekOverview.workload_status || 'Moderate'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Workload Status</p>
                <p className="text-xs text-gray-500 mt-1">
                  {weekOverview.workload_percentage || 0}% capacity
                </p>
              </div>
            </div>
          </ScrollEffects>

          {/* ARIA Insights */}
          {ariaInsights && (
            <ScrollEffects effect="fadeUp" delay={0.3}>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">ARIA's Insights</h3>
                    <p className="text-blue-800 leading-relaxed">{ariaInsights}</p>
                  </div>
                </div>
              </div>
            </ScrollEffects>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <ScrollEffects effect="fadeUp" delay={0.4}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-6 w-6 mr-2 text-purple-600" />
                  Top Recommendations
                </h3>
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-500 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {rec.title || rec.type}
                          </h4>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                        {rec.impact && (
                          <span className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                            rec.impact === 'high' ? 'bg-red-100 text-red-700' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.impact}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollEffects>
          )}

          {/* Daily Breakdown */}
          {Object.keys(dailyBreakdown).length > 0 && (
            <ScrollEffects effect="fadeUp" delay={0.5}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-cyan-600" />
                  Daily Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(dailyBreakdown).map(([day, data]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium text-gray-700">{day}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                data.capacity >= 85 ? 'bg-red-500' :
                                data.capacity >= 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(data.capacity, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {data.capacity}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 w-32 text-right">
                        {data.meetings} meetings ({data.hours}h)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollEffects>
          )}
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">Error loading optimization</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyOptimizerDashboard;


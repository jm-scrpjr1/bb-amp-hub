import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, RefreshCw, Clock, Users } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import environmentConfig from '../../config/environment';

const API_URL = environmentConfig.apiUrl;

const WeeklyOptimizerCard = () => {
  const { user } = useAuth();
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOptimization();
  }, []);

  const fetchOptimization = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');

      // Try current week first, then next week
      let response = await fetch(`${API_URL}/weekly-optimizer/current?weekType=current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If no current week data, try next week
      if (response.status === 404) {
        console.log('No current week optimization found, trying next week...');
        response = await fetch(`${API_URL}/weekly-optimizer/current?weekType=next`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.status === 404) {
        console.log('No optimization data found for current or next week');
        setOptimization(null);
      } else if (response.ok) {
        const data = await response.json();
        console.log('Weekly Optimizer data loaded:', data);
        setOptimization(data.data);
      } else {
        console.error('Failed to fetch optimization:', response.status, response.statusText);
        setOptimization(null);
      }
    } catch (err) {
      console.error('Error fetching optimization:', err);
      setOptimization(null);
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

      if (response.ok) {
        const data = await response.json();
        setOptimization({ optimization_data: data.data });
      }
    } catch (err) {
      console.error('Error triggering optimization:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const optimizationData = optimization?.optimization_data || {};
  const weekOverview = optimizationData.week_overview || {};
  const dailyBreakdown = optimizationData.daily_breakdown || {};

  console.log('WeeklyOptimizerCard - optimization:', optimization);
  console.log('WeeklyOptimizerCard - optimizationData:', optimizationData);
  console.log('WeeklyOptimizerCard - dailyBreakdown:', dailyBreakdown);
  const totalMeetings = Object.values(dailyBreakdown).reduce((sum, day) =>
    sum + (day.meetings?.length || 0), 0
  );

  const totalMeetingHours = Object.values(dailyBreakdown).reduce((sum, day) =>
    sum + (day.total_meeting_hours || 0), 0
  );

  // Find day with most meetings
  const daysWithMeetings = Object.entries(dailyBreakdown)
    .map(([day, data]) => ({
      day: new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count: data.meetings?.length || 0,
      hours: data.total_meeting_hours || 0
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const busiestDay = daysWithMeetings[0];

  // Get unique people from meetings
  const uniquePeople = new Set();
  Object.values(dailyBreakdown).forEach(day => {
    day.meetings?.forEach(meeting => {
      meeting.attendees?.forEach(attendee => {
        if (attendee.email !== user?.email) {
          uniquePeople.add(attendee.email);
        }
      });
    });
  });

  if (!optimization) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Optimized Week</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-center py-6">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No optimization data yet</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium shadow-sm"
          >
            {refreshing ? 'Analyzing...' : 'Analyze My Week'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">Your Optimized Week</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh optimization"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Week Date Range */}
      {weekOverview.week_start && weekOverview.week_end && (
        <div className="flex items-center text-xs text-gray-500 mb-5 pb-4 border-b border-gray-100">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          <span>
            {new Date(weekOverview.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekOverview.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* Time in Meetings Section */}
      {busiestDay && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-900 flex items-center">
              Time in meetings
              <span className="ml-2 text-gray-400 cursor-help" title="Total time spent in meetings this week">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </h4>
          </div>

          {/* Most meetings & Daily average */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Most meetings</div>
              <div className="text-lg font-bold text-gray-900">{busiestDay.day.split(',')[0]}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Daily average</div>
              <div className="text-lg font-bold text-gray-900">{(totalMeetingHours / Object.keys(dailyBreakdown).length).toFixed(1)} hr</div>
            </div>
          </div>

          {/* Daily Breakdown with Bars */}
          <div className="space-y-2">
            {daysWithMeetings.slice(0, 5).map((day, idx) => {
              const isToday = day.day.includes(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
              const isBusiest = idx === 0;

              return (
                <div key={idx} className="flex items-center">
                  <span className={`text-xs w-20 flex-shrink-0 ${isBusiest ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                    {day.day}
                  </span>
                  <div className="flex-1 mx-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isBusiest ? 'bg-green-600' : 'bg-green-500'}`}
                        style={{ width: `${(day.hours / Math.max(...daysWithMeetings.map(d => d.hours))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs w-12 text-right ${isBusiest ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {day.hours.toFixed(1)} hr
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-3 h-3 bg-green-600 rounded-full mr-1.5"></div>
              <span>Recurring</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-3 h-3 bg-green-300 rounded-full mr-1.5"></div>
              <span>One-time</span>
            </div>
          </div>
        </div>
      )}

      {/* People You Meet With Section */}
      {uniquePeople.size > 0 && (
        <div className="pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-gray-900 flex items-center">
              People you meet with
              <span className="ml-2 text-gray-400 cursor-help" title="Unique people in your meetings">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </h4>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Users className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <Users className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-medium">{uniquePeople.size} unique {uniquePeople.size === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyOptimizerCard;


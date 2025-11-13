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
      const response = await fetch(`${API_URL}/weekly-optimizer/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        setOptimization(null);
      } else if (response.ok) {
        const data = await response.json();
        setOptimization(data.data);
      }
    } catch (err) {
      console.error('Error fetching optimization:', err);
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

  // Calculate totals
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
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No optimization data yet</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
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

      {/* Week Date Range */}
      {weekOverview.week_start && weekOverview.week_end && (
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(weekOverview.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekOverview.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* Time Insights */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total meetings</span>
          <span className="text-sm font-semibold text-gray-900">{totalMeetings}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Time in meetings</span>
          <span className="text-sm font-semibold text-gray-900">{totalMeetingHours.toFixed(1)} hr</span>
        </div>
      </div>

      {/* Time in Meetings - Visual */}
      {busiestDay && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Time in meetings</span>
            <span className="text-xs text-gray-500">Daily average {(totalMeetingHours / Object.keys(dailyBreakdown).length).toFixed(1)} hr</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Most meetings: <span className="font-semibold text-gray-900">{busiestDay.day}</span>
          </div>
          <div className="space-y-1.5">
            {daysWithMeetings.slice(0, 5).map((day, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-xs text-gray-600 w-20 flex-shrink-0">{day.day}</span>
                <div className="flex-1 mx-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(day.hours / Math.max(...daysWithMeetings.map(d => d.hours))) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-900 w-10 text-right">{day.hours.toFixed(1)} hr</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People You Meet With */}
      {uniquePeople.size > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">People you meet with</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{uniquePeople.size} unique {uniquePeople.size === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyOptimizerCard;


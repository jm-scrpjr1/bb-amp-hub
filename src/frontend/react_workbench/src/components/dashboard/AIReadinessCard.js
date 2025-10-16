import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import environmentConfig from '../../config/environment';

const AIReadinessCard = () => {
  const { user } = useAuth();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${environmentConfig.apiUrl}/assessment/history?limit=2`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assessment history');
        }

        const data = await response.json();
        
        if (data.success && data.history && data.history.length > 0) {
          // Get the most recent assessment and the previous one (if exists)
          const latest = data.history[0];
          const previous = data.history.length > 1 ? data.history[1] : null;
          
          setAssessmentData({
            latest,
            previous,
            hasMultiple: data.history.length > 1
          });
        } else {
          setAssessmentData(null);
        }
      } catch (err) {
        console.error('Error fetching assessment history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentHistory();
  }, [user]);

  // Get level color based on AI readiness level
  const getLevelColor = (level) => {
    const levelMap = {
      'AI Champion': 'from-purple-500 to-pink-500',
      'AI Explorer': 'from-blue-500 to-cyan-500',
      'AI Learner': 'from-green-500 to-teal-500',
      'AI Starter': 'from-yellow-500 to-orange-500',
      'AI Beginner': 'from-gray-500 to-slate-500',
      'Expert': 'from-purple-500 to-pink-500',
      'Advanced': 'from-blue-500 to-cyan-500',
      'Intermediate': 'from-green-500 to-teal-500',
      'Beginner': 'from-yellow-500 to-orange-500',
      'Novice': 'from-gray-500 to-slate-500'
    };
    return levelMap[level] || 'from-gray-500 to-slate-500';
  };

  // Get level icon
  const getLevelIcon = (level) => {
    if (level?.includes('Champion') || level === 'Expert') {
      return <Award className="w-5 h-5" />;
    }
    return <Target className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Readiness</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Take your first AI Assessment to discover your AI readiness level!
          </p>
          <a
            href="/ai-assessments"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
          >
            Start Assessment
          </a>
        </div>
      </div>
    );
  }

  const { latest, previous, hasMultiple } = assessmentData;
  const improvement = hasMultiple ? latest.improvementFromPrevious : 0;
  const hasImproved = improvement > 0;
  const hasDeclined = improvement < 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Readiness</h3>
        <a
          href="/ai-assessments"
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          View Details →
        </a>
      </div>

      {/* Main Readiness Display */}
      <div className={`bg-gradient-to-br ${getLevelColor(latest.aiReadinessLevel)} rounded-xl p-5 mb-4 text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getLevelIcon(latest.aiReadinessLevel)}
              <span className="text-sm font-medium opacity-90">Current Level</span>
            </div>
            <div className="text-2xl font-bold">{latest.overallPercentage}%</div>
          </div>
          
          <div className="text-xl font-bold mb-1">
            {latest.aiReadinessLevel}
          </div>
          
          <div className="text-sm opacity-90">
            Assessed on {new Date(latest.assessmentDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {hasMultiple && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {hasImproved ? (
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{Math.abs(improvement).toFixed(1)}%</span>
              </div>
            ) : hasDeclined ? (
              <div className="flex items-center space-x-1 text-orange-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">-{Math.abs(improvement).toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-600">
                <span className="text-sm font-medium">No change</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            vs. previous assessment
          </div>
        </div>
      )}

      {/* Previous Assessment (if exists) */}
      {hasMultiple && previous && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Previous:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{previous.aiReadinessLevel}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{previous.overallPercentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      {!hasMultiple && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Take another assessment to track your progress!
          </p>
        </div>
      )}
    </div>
  );
};

export default AIReadinessCard;


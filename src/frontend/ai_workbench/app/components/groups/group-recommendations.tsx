"use client";

import { useState, useEffect } from 'react';
import { GroupRecommendation } from '@/lib/ai-group-service';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Brain, 
  ChevronRight,
  Star,
  Building,
  Briefcase,
  Zap,
  Clock
} from 'lucide-react';
import { GroupType } from '@/lib/permissions';

interface GroupRecommendationsProps {
  onJoinGroup?: (groupId: string) => void;
}

export default function GroupRecommendations({ onJoinGroup }: GroupRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GroupRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups/ai/recommendations');
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      setError('Error loading recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGroupTypeIcon = (type: GroupType) => {
    switch (type) {
      case GroupType.DEPARTMENT: return Building;
      case GroupType.PROJECT: return Briefcase;
      case GroupType.FUNCTIONAL: return Users;
      case GroupType.TEMPORARY: return Clock;
      case GroupType.CUSTOM: return Zap;
      default: return Users;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'role-based': return 'bg-purple-100 text-purple-800';
      case 'activity-based': return 'bg-green-100 text-green-800';
      case 'skill-based': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recommendations available at this time.</p>
          <p className="text-sm text-gray-400 mt-1">Join more groups to get personalized suggestions!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            AI Enhanced
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Personalized group suggestions based on your role and activity
        </p>
      </div>

      <div className="p-6 space-y-4">
        {recommendations.map((rec, index) => {
          const TypeIcon = getGroupTypeIcon(rec.group.type);
          
          return (
            <div
              key={rec.group.id}
              className="group border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TypeIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{rec.group.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-500">
                          {Math.round(rec.score * 100)}% match
                        </span>
                      </div>
                    </div>
                    
                    {rec.group.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {rec.group.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(rec.category)}`}>
                        {rec.category.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {rec.group.type}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Why:</strong> {rec.reason}
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-200">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800">
                          <strong>AI Insight:</strong> {rec.aiInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onJoinGroup?.(rec.group.id)}
                  className="ml-4 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Join
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Recommendations update based on your activity</span>
          </div>
          <button
            onClick={fetchRecommendations}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState } from 'react';
import { GroupType, GroupVisibility } from '@/lib/permissions';
import { X, Users, Building, Briefcase, Clock, Zap, Eye, EyeOff, Shield } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: GroupType.FUNCTIONAL,
    visibility: GroupVisibility.PUBLIC,
    maxMembers: '',
    autoApprove: false,
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch AI suggestions when name changes
  useEffect(() => {
    if (formData.name.length > 3) {
      fetchAiSuggestions();
    }
  }, [formData.name, formData.description]);

  const fetchAiSuggestions = async () => {
    if (!formData.name.trim()) return;

    try {
      setLoadingSuggestions(true);
      const response = await fetch('/api/groups/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: formData.name,
          description: formData.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions);
        setShowAiSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applyAiSuggestion = (field: 'type' | 'visibility') => {
    if (!aiSuggestions) return;

    setFormData(prev => ({
      ...prev,
      [field]: field === 'type' ? aiSuggestions.recommendedType : aiSuggestions.recommendedVisibility
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        visibility: formData.visibility,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined,
        autoApprove: formData.autoApprove,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      };

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          type: GroupType.FUNCTIONAL,
          visibility: GroupVisibility.PUBLIC,
          maxMembers: '',
          autoApprove: false,
          tags: '',
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create group');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: GroupType) => {
    switch (type) {
      case GroupType.DEPARTMENT: return Building;
      case GroupType.PROJECT: return Briefcase;
      case GroupType.FUNCTIONAL: return Users;
      case GroupType.TEMPORARY: return Clock;
      case GroupType.CUSTOM: return Zap;
      default: return Users;
    }
  };

  const getVisibilityIcon = (visibility: GroupVisibility) => {
    switch (visibility) {
      case GroupVisibility.PUBLIC: return Eye;
      case GroupVisibility.PRIVATE: return EyeOff;
      case GroupVisibility.RESTRICTED: return Shield;
      default: return Eye;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter group name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the purpose of this group"
              />
            </div>
          </div>

          {/* AI Suggestions */}
          {showAiSuggestions && aiSuggestions && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">AI Suggestions</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  AI Enhanced
                </span>
              </div>

              <div className="space-y-3">
                {/* Type Suggestion */}
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Recommended Type:</span>
                      <span className="text-sm text-purple-700 font-semibold">
                        {aiSuggestions.recommendedType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyAiSuggestion('type')}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Visibility Suggestion */}
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Recommended Visibility:</span>
                      <span className="text-sm text-purple-700 font-semibold">
                        {aiSuggestions.recommendedVisibility}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyAiSuggestion('visibility')}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* AI Insights */}
                {aiSuggestions.aiInsights.length > 0 && (
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">AI Insights:</span>
                        <ul className="mt-1 space-y-1">
                          {aiSuggestions.aiInsights.map((insight, index) => (
                            <li key={index} className="text-xs text-gray-600">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {loadingSuggestions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-700">Generating AI suggestions...</span>
              </div>
            </div>
          )}

          {/* Group Type */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Group Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(GroupType).map((type) => {
                const Icon = getTypeIcon(type);
                return (
                  <label
                    key={type}
                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as GroupType })}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{type}</div>
                      <div className="text-xs text-gray-500">
                        {type === GroupType.DEPARTMENT && 'Organizational departments'}
                        {type === GroupType.PROJECT && 'Project-specific teams'}
                        {type === GroupType.FUNCTIONAL && 'Cross-functional teams'}
                        {type === GroupType.TEMPORARY && 'Time-limited groups'}
                        {type === GroupType.CUSTOM && 'Custom group type'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Visibility</h3>
            <div className="space-y-2">
              {Object.values(GroupVisibility).map((visibility) => {
                const Icon = getVisibilityIcon(visibility);
                return (
                  <label
                    key={visibility}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.visibility === visibility ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={visibility}
                      checked={formData.visibility === visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as GroupVisibility })}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{visibility}</div>
                      <div className="text-xs text-gray-500">
                        {visibility === GroupVisibility.PUBLIC && 'Visible to all users'}
                        {visibility === GroupVisibility.PRIVATE && 'Only visible to members'}
                        {visibility === GroupVisibility.RESTRICTED && 'Visible to specific roles'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Members
                </label>
                <input
                  type="number"
                  id="maxMembers"
                  min="1"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="No limit"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoApprove}
                    onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-approve join requests</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tags help categorize and search for groups
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

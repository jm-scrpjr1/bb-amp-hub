'use client'

import { useState, useEffect } from 'react';
import { GroupType, GroupVisibility, GroupInfo } from '@/lib/permissions';
import { X, Users, Building, Briefcase, Clock, Zap, Eye, EyeOff, Shield, Save } from 'lucide-react';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: GroupInfo;
}

export default function EditGroupModal({ isOpen, onClose, onSuccess, group }: EditGroupModalProps) {
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

  // Initialize form data when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        type: group.type || GroupType.FUNCTIONAL,
        visibility: group.visibility || GroupVisibility.PUBLIC,
        maxMembers: group.maxMembers ? group.maxMembers.toString() : '',
        autoApprove: group.autoApprove || false,
        tags: group.tags ? group.tags.join(', ') : '',
      });
    }
  }, [group]);

  const resetForm = () => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        type: group.type || GroupType.FUNCTIONAL,
        visibility: group.visibility || GroupVisibility.PUBLIC,
        maxMembers: group.maxMembers ? group.maxMembers.toString() : '',
        autoApprove: group.autoApprove || false,
        tags: group.tags ? group.tags.join(', ') : '',
      });
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

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

      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update group');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the purpose of this group"
            />
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(GroupType).map((type) => {
                const Icon = getTypeIcon(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium capitalize">{type.toLowerCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(GroupVisibility).map((visibility) => {
                const Icon = getVisibilityIcon(visibility);
                return (
                  <button
                    key={visibility}
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility })}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      formData.visibility === visibility
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium capitalize">{visibility.toLowerCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Members (optional)
            </label>
            <input
              type="number"
              id="maxMembers"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          {/* Auto Approve */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoApprove"
              checked={formData.autoApprove}
              onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoApprove" className="ml-2 block text-sm text-gray-700">
              Auto-approve join requests
            </label>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., engineering, frontend, react"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import PageTemplate from '@/components/common/page-template';
import { useRBAC, useGroupPermissions } from '@/providers/rbac-provider';
import { GroupType, GroupVisibility, GroupInfo } from '@/lib/permissions';
import CreateGroupModal from '@/components/groups/create-group-modal-simple';
import {
  Users,
  Plus,
  Search,
  Filter,
  Settings,
  UserPlus,
  Eye,
  EyeOff,
  Crown,
  Building,
  Briefcase,
  Zap,
  Trash2,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';

export default function GroupsPage() {
  const rbac = useRBAC();
  const groupPermissions = useGroupPermissions();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<GroupType | 'ALL'>('ALL');
  const [filterVisibility, setFilterVisibility] = useState<GroupVisibility | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [filterType, filterVisibility, searchTerm]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (filterVisibility !== 'ALL') params.append('visibility', filterVisibility);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/groups?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate
      title="Groups"
      description="Manage team groups and collaborate on projects together"
      icon={Users}
    >
      <div className="space-y-6">
        {/* Create Group Button */}
        {groupPermissions.canCreateGroups && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as GroupType | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value={GroupType.DEPARTMENT}>Department</option>
                <option value={GroupType.PROJECT}>Project</option>
                <option value={GroupType.FUNCTIONAL}>Functional</option>
                <option value={GroupType.TEMPORARY}>Temporary</option>
                <option value={GroupType.CUSTOM}>Custom</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="sm:w-48">
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as GroupVisibility | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Visibility</option>
                <option value={GroupVisibility.PUBLIC}>Public</option>
                <option value={GroupVisibility.PRIVATE}>Private</option>
                <option value={GroupVisibility.RESTRICTED}>Restricted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'ALL' || filterVisibility !== 'ALL'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first group.'}
            </p>
            {groupPermissions.canCreateGroups && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} onUpdate={fetchGroups} />
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchGroups();
            setShowCreateModal(false);
          }}
        />
      </div>
    </PageTemplate>
  );
}

// Group Card Component
function GroupCard({ group, onUpdate }: { group: GroupInfo; onUpdate: () => void }) {
  const groupPermissions = useGroupPermissions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const TypeIcon = getGroupTypeIcon(group.type);
  const VisibilityIcon = getVisibilityIcon(group.visibility);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
        setShowDeleteConfirm(false);
      } else {
        console.error('Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TypeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {group.type}
                </span>
                <div className="flex items-center gap-1">
                  <VisibilityIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{group.visibility}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {groupPermissions.canManageGroups && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete group"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{group.memberCount || 0} members</span>
          </div>
          <div className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Join</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Group</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{group.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getGroupTypeIcon(type: GroupType) {
  switch (type) {
    case GroupType.DEPARTMENT:
      return Building;
    case GroupType.PROJECT:
      return Briefcase;
    case GroupType.FUNCTIONAL:
      return Settings;
    case GroupType.TEMPORARY:
      return Zap;
    case GroupType.CUSTOM:
      return Crown;
    default:
      return Users;
  }
}

function getVisibilityIcon(visibility: GroupVisibility) {
  switch (visibility) {
    case GroupVisibility.PUBLIC:
      return Eye;
    case GroupVisibility.PRIVATE:
      return EyeOff;
    case GroupVisibility.RESTRICTED:
      return Crown;
    default:
      return Eye;
  }
}

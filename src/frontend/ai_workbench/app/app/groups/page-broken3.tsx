
"use client";

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, AnimatedText, ScrollTextReveal } from '@/components/effects';
import { useRBAC, useGroupPermissions } from '@/providers/rbac-provider';
import { GroupType, GroupVisibility, GroupInfo } from '@/lib/permissions';
import CreateGroupModal from '@/components/groups/create-group-modal';
import GroupRecommendations from '@/components/groups/group-recommendations';
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
  Shield,
  Star,
  Clock,
  Building,
  Briefcase,
  Zap
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
    <MainLayout>
      <ScrollEffects>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <AnimatedText>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      Groups
                    </h1>
                  </AnimatedText>
                  <ScrollTextReveal>
                    <p className="mt-2 text-gray-600">
                      Manage team groups and collaborate on projects together
                    </p>
                  </ScrollTextReveal>
                </div>
                {groupPermissions.canCreateGroups && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </button>
                )}
              </div>
            </div>
          </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

        {/* Main Content with AI Recommendations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Groups Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {groupPermissions.canCreateGroups
                ? "Get started by creating a new group."
                : "No groups match your current filters."
              }
            </p>
            {groupPermissions.canCreateGroups && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
            </div>

            {/* AI Recommendations Sidebar */}
            <div className="lg:col-span-1">
              <GroupRecommendations
                onJoinGroup={(groupId) => {
                  // Handle joining group
                  console.log('Join group:', groupId);
                  fetchGroups(); // Refresh groups after joining
                }}
              />
            </div>
          </div>
        </div>

        {/* Create Group Modal */}
        {/* <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchGroups();
            setShowCreateModal(false);
          }}
        /> */}
        </div>
      </ScrollEffects>
    </MainLayout>
  );
}

// Group Card Component
function GroupCard({ group }: { group: GroupInfo }) {
  const groupPermissions = useGroupPermissions();
  const TypeIcon = getGroupTypeIcon(group.type);
  const VisibilityIcon = getVisibilityIcon(group.visibility);

  const handleViewGroup = () => {
    // Navigate to group details page
    window.location.href = `/groups/${group.id}`;
  };

  const handleManageGroup = () => {
    // Navigate to group management page
    window.location.href = `/groups/${group.id}/manage`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TypeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
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

          {/* Manager Badge */}
          {group.managerId && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <Crown className="h-3 w-3" />
              Manager
            </div>
          )}
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{group.memberCount} members</span>
            </div>
            {group.maxMembers && (
              <div className="text-xs">
                / {group.maxMembers} max
              </div>
            )}
          </div>

          {group.tags && group.tags.length > 0 && (
            <div className="flex gap-1">
              {group.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {group.tags.length > 2 && (
                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full">
                  +{group.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleViewGroup}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            View Details
          </button>

          {groupPermissions.canManageGroup(group.id) && (
            <button
              onClick={handleManageGroup}
              className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions (moved outside component to avoid re-creation)
function getGroupTypeIcon(type: GroupType) {
  switch (type) {
    case GroupType.DEPARTMENT: return Building;
    case GroupType.PROJECT: return Briefcase;
    case GroupType.FUNCTIONAL: return Users;
    case GroupType.TEMPORARY: return Clock;
    case GroupType.CUSTOM: return Zap;
    default: return Users;
  }
}

function getVisibilityIcon(visibility: GroupVisibility) {
  switch (visibility) {
    case GroupVisibility.PUBLIC: return Eye;
    case GroupVisibility.PRIVATE: return EyeOff;
    case GroupVisibility.RESTRICTED: return Shield;
    default: return Eye;
  }
}

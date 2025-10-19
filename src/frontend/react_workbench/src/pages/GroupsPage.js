import React, { useState, useEffect } from 'react';
import { Edit, Users, Trash2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { EditGroupModal, ManageMembersModal } from '../components/ui';
import { useGroupPermissions } from '../providers/RBACProvider';
import { apiService } from '../services/apiService';

const GroupsPage = () => {
  const groupPermissions = useGroupPermissions();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [userPermissions, setUserPermissions] = useState({
    canViewAllGroups: false,
    canCreateGroups: false
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGroupForAction, setSelectedGroupForAction] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGroups();
      setGroups(response.groups || []);
      setUserPermissions(response.userPermissions || {
        canViewAllGroups: false,
        canCreateGroups: false
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMembers = async (groupId) => {
    try {
      setLoadingMembers(true);
      const response = await apiService.getGroupMembers(groupId);
      setGroupMembers(response.members || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading group members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleFavorite = (groupId) => {
    setFavorites(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Filter groups based on search and filter
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'favorites') {
      return matchesSearch && favorites.includes(group.id);
    }

    return matchesSearch;
  });

  // Separate groups by type
  const departmentGroups = filteredGroups.filter(group => group.type === 'DEPARTMENT');
  // My Groups: groups where user is a member (has membershipRole)
  const myGroups = filteredGroups.filter(group => group.membershipRole);

  const getGroupIcon = (type, name) => {
    if (type === 'DEPARTMENT') {
      switch (name.toLowerCase()) {
        case 'hr': return '👥';
        case 'finance': return '💰';
        case 'it': return '💻';
        case 'sales': return '📈';
        case 'marketing': return '📢';
        case 'developers': return '⚡';
        default: return '🏢';
      }
    } else if (type === 'FUNCTIONAL') {
      switch (name.toLowerCase()) {
        case 'general': return '👥';
        case 'philippines': return '🇵🇭';
        case 'colombia': return '🇨🇴';
        case 'mexico': return '🇲🇽';
        case 'united states': return '🇺🇸';
        case 'india': return '🇮🇳';
        default: return '🌍';
      }
    }
    return '👥';
  };

  // Modal handlers
  const handleEditGroup = (group) => {
    setSelectedGroupForAction(group);
    setShowEditModal(true);
  };

  const handleManageMembers = (group) => {
    setSelectedGroupForAction(group);
    setShowMembersModal(true);
  };

  const handleDeleteGroup = async (group) => {
    if (window.confirm(`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`)) {
      try {
        await apiService.deleteGroup(group.id);
        await loadGroups(); // Reload groups
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === updatedGroup.id ? updatedGroup : group
      )
    );
  };

  const handleMembersUpdated = () => {
    // Reload group members if a group is selected
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.id);
    }
  };

  const GroupCard = ({ group, isSelected, onClick }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 hover:border-purple-300'
      }`}
      onClick={() => {
        onClick(group);
        loadGroupMembers(group.id);
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getGroupIcon(group.type, group.name)}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(group.id);
              }}
              className={`p-1 rounded-full transition-colors ${
                favorites.includes(group.id)
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              ⭐
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <span className={`inline-block text-xs px-2 py-1 rounded-full ${
              group.type === 'DEPARTMENT'
                ? 'bg-blue-100 text-blue-800'
                : group.type === 'FUNCTIONAL'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {group.type === 'DEPARTMENT' ? 'Department' : group.type === 'FUNCTIONAL' ? 'Functional' : group.type}
            </span>
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {group.visibility}
            </span>
            {group.isActive && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>

          {/* Management buttons */}
          {groupPermissions.canManageGroup(group.id) && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditGroup(group);
                }}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Edit group"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleManageMembers(group);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Manage members"
              >
                <Users className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteGroup(group);
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete group"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groups & Teams</h1>
            <p className="text-gray-600 mt-2">
              {userPermissions.canViewAllGroups
                ? "Manage your organization's departments and functional groups"
                : "View and manage your group memberships"}
            </p>
            {!userPermissions.canViewAllGroups && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  👥 Showing only your groups
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadGroups}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Groups
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Groups
              </button>
              <button
                onClick={() => setSelectedFilter('favorites')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'favorites'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⭐ Favorites
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Groups */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="text-xl font-semibold text-gray-900">Department Groups</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {departmentGroups.length}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading departments...</span>
              </div>
            ) : departmentGroups.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No department groups found.</p>
            ) : (
              <div className="space-y-3">
                {departmentGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isSelected={selectedGroup?.id === group.id}
                    onClick={setSelectedGroup}
                  />
                ))}
              </div>
            )}
          </div>

          {/* My Groups */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👥</span>
              <h2 className="text-xl font-semibold text-gray-900">My Groups</h2>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {myGroups.length}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading teams...</span>
              </div>
            ) : myGroups.length === 0 ? (
              <p className="text-gray-600 text-center py-8">You are not a member of any groups yet.</p>
            ) : (
              <div className="space-y-3">
                {myGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isSelected={selectedGroup?.id === group.id}
                    onClick={setSelectedGroup}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Group Details & Members */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👥</span>
              <h2 className="text-xl font-semibold text-gray-900">Group Members</h2>
            </div>
            {selectedGroup ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getGroupIcon(selectedGroup.type, selectedGroup.name)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedGroup.type === 'DEPARTMENT' ? 'Department' :
                       selectedGroup.type === 'FUNCTIONAL' ? 'Functional Group' : selectedGroup.type}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">{selectedGroup.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">Type</div>
                    <div className="text-blue-900 font-semibold">
                      {selectedGroup.type === 'DEPARTMENT' ? 'Department' :
                       selectedGroup.type === 'FUNCTIONAL' ? 'Functional Group' : selectedGroup.type}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600 font-medium">Visibility</div>
                    <div className="text-green-900 font-semibold">{selectedGroup.visibility}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600 font-medium">Status</div>
                    <div className="text-purple-900 font-semibold">
                      {selectedGroup.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600 font-medium">Auto Approve</div>
                    <div className="text-orange-900 font-semibold">
                      {selectedGroup.autoApprove ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Group Members List */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>👥</span>
                    <span>Members ({groupMembers.length})</span>
                  </h4>

                  {loadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Loading members...</span>
                    </div>
                  ) : groupMembers.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <span className="text-4xl mb-2 block">👥</span>
                      <p className="text-gray-600">No members found in this group</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {groupMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {member.user?.image ? (
                              <img
                                src={member.user.image}
                                alt={member.user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span className={member.user?.image ? 'hidden' : 'block'}>
                              {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{member.user?.name || 'Unknown User'}</div>
                            <div className="text-sm text-gray-600">{member.user?.email}</div>
                          </div>
                          <div className="flex gap-2">
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                              member.role === 'ADMIN'
                                ? 'bg-red-100 text-red-800'
                                : member.role === 'MODERATOR'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.role}
                            </span>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                              member.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-gray-600 text-lg">Select a group to view details and analyze its health</p>
                <p className="text-gray-500 text-sm mt-2">Choose from departments or functional groups above</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && groups.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Organization Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{groups.length}</div>
                <div className="text-purple-200">Total Groups</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{departmentGroups.length}</div>
                <div className="text-purple-200">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{groups.filter(g => g.isActive).length}</div>
                <div className="text-purple-200">Active Groups</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditGroupModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroupForAction(null);
        }}
        group={selectedGroupForAction}
        onGroupUpdated={handleGroupUpdated}
      />

      <ManageMembersModal
        isOpen={showMembersModal}
        onClose={() => {
          setShowMembersModal(false);
          setSelectedGroupForAction(null);
        }}
        group={selectedGroupForAction}
        onMembersUpdated={handleMembersUpdated}
      />
    </MainLayout>
  );
};

export default GroupsPage;

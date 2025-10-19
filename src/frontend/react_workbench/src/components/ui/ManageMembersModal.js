import React, { useState, useEffect, useCallback, memo } from 'react';
import { X, Users, Plus, Trash2, Search, AlertCircle, UserPlus } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../providers/AuthProvider';
import { useRBAC } from '../../providers/RBACProvider';

const ManageMembersModal = memo(function ManageMembersModal({ isOpen, onClose, group, onMembersUpdated }) {
  const { user: currentUser } = useAuth();
  const { canManageGroup } = useRBAC();

  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (group && isOpen) {
      loadGroupMembers();
      loadAvailableUsers();
    }
  }, [group, isOpen]);

  const loadGroupMembers = useCallback(async () => {
    if (!group) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getGroupMembers(group.id);
      setMembers(response.members || []);
      setError(null);
    } catch (err) {
      setError('Failed to load group members');
      console.error('Error loading group members:', err);
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  const loadAvailableUsers = useCallback(async () => {
    try {
      // Get all users to show in the add member dropdown
      const response = await apiService.getUsers({ limit: 1000 });
      setAvailableUsers(response.users || []);
    } catch (err) {
      console.error('Error loading available users:', err);
    }
  }, []);

  const handleAddMember = useCallback(async (userId, role) => {
    if (!userId || !group) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.addGroupMember(group.id, {
        userId: userId,
        role: role
      });

      // Reload members
      await loadGroupMembers();

      // Reset form
      setSelectedUser('');
      setUserSearchTerm('');
      setSelectedRole('MEMBER');

      if (onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  }, [group, loadGroupMembers, onMembersUpdated]);

  const handleRemoveMember = useCallback(async (userId) => {
    if (!group || !window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await apiService.removeGroupMember(group.id, userId);
      
      // Reload members
      await loadGroupMembers();
      
      if (onMembersUpdated) {
        onMembersUpdated();
      }
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  }, [group, loadGroupMembers, onMembersUpdated]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setError(null);
      setSearchTerm('');
      setUserSearchTerm('');
      setSelectedUser('');
      setSelectedRole('MEMBER');
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Check if current user can manage this group
  const canManageThisGroup = group ? canManageGroup(group.id) : false;

  const filteredMembers = members.filter(member =>
    member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsersForAdd = availableUsers.filter(user =>
    !members.some(member => member.userId === user.id)
  );

  // Filter users based on search term
  const filteredAvailableUsers = availableUsersForAdd.filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Members</h2>
              <p className="text-sm text-gray-600">{group?.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Add Member Form */}
          {!canManageThisGroup ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  You don't have permission to manage members in this group. Only ADMIN, SUPER_ADMIN, OWNER, or group MANAGERS can add/remove members.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Member
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Available Users List */}
                <div className="bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {filteredAvailableUsers.length > 0 ? (
                    filteredAvailableUsers.map(user => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          selectedUser === user.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedUser === user.id ? selectedRole : 'MEMBER'}
                            onChange={(e) => {
                              setSelectedUser(user.id);
                              setSelectedRole(e.target.value);
                            }}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const role = selectedUser === user.id ? selectedRole : 'MEMBER';
                              handleAddMember(user.id, role);
                            }}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      {userSearchTerm ? 'No users found' : 'All users are already members'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Members */}
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Current Members ({filteredMembers.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No members found matching your search' : 'No members in this group yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.user?.name}</h4>
                        <p className="text-sm text-gray-600">{member.user?.email}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                            member.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800'
                              : member.role === 'MANAGER'
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
                          {member.joinedAt && (
                            <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canManageThisGroup && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ManageMembersModal;

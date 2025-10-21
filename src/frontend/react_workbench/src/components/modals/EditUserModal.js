import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User,
  Mail,
  Shield,
  Globe,
  Users,
  AlertCircle,
  CheckCircle,
  Crown,
  UserCheck,
  Lock,
  Eye
} from 'lucide-react';
import adminService from '../../services/adminService';

const EditUserModal = ({ user, onClose, onSave, viewMode = false }) => {
  const [formData, setFormData] = useState({
    status: user?.status || 'ACTIVE',
    roleId: user?.roleId || '',
    country: user?.country || 'US',
    teamId: user?.teamId || '',
  });
  
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load roles, teams, and groups
      const [rolesData, teamsData, groupsData, userGroupsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getTeams(),
        adminService.getGroups(),
        adminService.getUserGroups(user.id)
      ]);

      // Ensure we have arrays
      const rolesArray = Array.isArray(rolesData?.roles) ? rolesData.roles : [];
      const teamsArray = Array.isArray(teamsData?.teams) ? teamsData.teams : [];
      const groupsArray = Array.isArray(groupsData?.groups) ? groupsData.groups : [];
      const userGroupsArray = Array.isArray(userGroupsData?.groups) ? userGroupsData.groups : [];

      setRoles(rolesArray);
      setTeams(teamsArray);
      setGroups(groupsArray);
      setUserGroups(userGroupsArray);

      // Set selected groups - ensure we're mapping over an array
      setSelectedGroups(userGroupsArray.map(g => g.id));

      // Set form data with current user values
      setFormData({
        status: user.status || 'ACTIVE',
        roleId: user.roleId || '',
        country: user.country || 'US',
        teamId: user.teamId || '',
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user basic info
      await adminService.updateUser(user.id, {
        status: formData.status,
        roleId: formData.roleId,
        country: formData.country,
        teamId: formData.teamId || null,
      });

      // Update group memberships if changed
      const currentGroupIds = userGroups.map(g => g.id);
      const addedGroups = selectedGroups.filter(id => !currentGroupIds.includes(id));
      const removedGroups = currentGroupIds.filter(id => !selectedGroups.includes(id));

      // Add user to new groups
      for (const groupId of addedGroups) {
        await adminService.addGroupMember(groupId, {
          userId: user.id,
          role: 'MEMBER'
        });
      }

      // Remove user from groups
      for (const groupId of removedGroups) {
        await adminService.removeGroupMember(groupId, user.id);
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'OWNER': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'SUPER_ADMIN': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'TEAM_MANAGER': return <UserCheck className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleGroup = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${viewMode ? 'from-green-600 to-teal-600' : 'from-blue-600 to-purple-600'} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              {viewMode ? (
                <Eye className="h-6 w-6 text-white" />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {viewMode ? 'View User' : 'Edit User'}
              </h2>
              <p className="text-blue-100 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800">User updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only User Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                User Information (Synced from Google Workspace)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  <div className="text-gray-900 font-medium">{user.name || 'No name'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <div className="text-gray-900 font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50"
                  required
                  disabled={viewMode}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50"
                  required
                  disabled={viewMode}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                  maxLength={2}
                  placeholder="US"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase disabled:bg-gray-50 disabled:opacity-50"
                  disabled={viewMode}
                />
                <p className="text-xs text-gray-500 mt-1">2-letter country code (e.g., US, UK, CA)</p>
              </div>

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team (Optional)
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50"
                  disabled={viewMode}
                >
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Group Memberships */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Group Memberships
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                {groups.length === 0 ? (
                  <p className="text-gray-500 text-sm">No groups available</p>
                ) : (
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <label
                        key={group.id}
                        className={`flex items-center p-3 rounded-lg transition-colors ${viewMode ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => toggleGroup(group.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          disabled={viewMode}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">{group.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{group.type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {viewMode ? 'Close' : 'Cancel'}
          </button>
          {!viewMode && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;


'use client'

import { useState, useEffect } from 'react';
import { GroupInfo } from '@/lib/permissions';
import { X, Users, UserPlus, UserMinus, Search, Crown, Shield, User } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: GroupInfo;
}

export default function ManageMembersModal({ isOpen, onClose, onSuccess, group }: ManageMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Load group members when modal opens
  useEffect(() => {
    if (isOpen && group) {
      loadMembers();
      loadAllUsers();
    }
  }, [isOpen, group]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${group.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        setError('Failed to load group members');
      }
    } catch (error) {
      setError('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch('/api/users?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const addMember = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${group.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          role: 'MEMBER'
        }),
      });

      if (response.ok) {
        await loadMembers();
        setSelectedUser('');
        setShowAddUser(false);
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add member');
      }
    } catch (error) {
      setError('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${group.id}/members/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadMembers();
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove member');
      }
    } catch (error) {
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return Crown;
      case 'ADMIN': 
      case 'SUPER_ADMIN': return Shield;
      case 'MANAGER': return Users;
      default: return User;
    }
  };

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = allUsers.filter(user => 
    !members.some(member => member.id === user.id) &&
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Members</h2>
            <p className="text-sm text-gray-600 mt-1">{group.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Search and Add Member */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>

          {/* Add User Section */}
          {showAddUser && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Member</h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={addMember}
                  disabled={!selectedUser || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddUser(false);
                    setSelectedUser('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">
              Current Members ({filteredMembers.length})
            </h3>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && filteredMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No members found matching your search.' : 'No members in this group yet.'}
              </div>
            )}

            {!loading && filteredMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);
              return (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs">
                      <RoleIcon className="h-3 w-3" />
                      <span className="capitalize">{member.role?.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

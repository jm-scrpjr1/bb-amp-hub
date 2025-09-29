"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, ScrollTextReveal } from '@/components/effects';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Crown,
  Shield,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  MoreVertical,
  Mail,
  Calendar
} from 'lucide-react';
import { canManageUsers, UserRole, UserStatus } from '@/lib/permissions';

// Mock user data - will be replaced with real API calls
const mockUsers = [
  {
    id: '1',
    name: 'John Lopez',
    email: 'jlope@boldbusiness.com',
    role: 'OWNER' as UserRole,
    status: 'ACTIVE' as UserStatus,
    teamId: null,
    team: null,
    lastLoginAt: new Date('2024-01-26T10:30:00'),
    createdAt: new Date('2024-01-01T09:00:00'),
    loginCount: 156,
    image: null
  },
  {
    id: '2',
    name: 'Alice Johnson',
    email: 'alice@boldbusiness.com',
    role: 'ADMIN' as UserRole,
    status: 'ACTIVE' as UserStatus,
    teamId: 'team1',
    team: { id: 'team1', name: 'Engineering', managerId: '2' },
    lastLoginAt: new Date('2024-01-26T08:45:00'),
    createdAt: new Date('2024-01-15T14:20:00'),
    loginCount: 89,
    image: null
  },
  {
    id: '3',
    name: 'Bob Smith',
    email: 'bob@boldbusiness.com',
    role: 'TEAM_MANAGER' as UserRole,
    status: 'ACTIVE' as UserStatus,
    teamId: 'team2',
    team: { id: 'team2', name: 'Marketing', managerId: '3' },
    lastLoginAt: new Date('2024-01-25T16:10:00'),
    createdAt: new Date('2024-01-10T11:30:00'),
    loginCount: 67,
    image: null
  },
  {
    id: '4',
    name: 'Carol Davis',
    email: 'carol@boldbusiness.com',
    role: 'MEMBER' as UserRole,
    status: 'INACTIVE' as UserStatus,
    teamId: 'team1',
    team: { id: 'team1', name: 'Engineering', managerId: '2' },
    lastLoginAt: new Date('2024-01-20T12:15:00'),
    createdAt: new Date('2024-01-05T09:45:00'),
    loginCount: 34,
    image: null
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@boldbusiness.com',
    role: 'MEMBER' as UserRole,
    status: 'SUSPENDED' as UserStatus,
    teamId: 'team2',
    team: { id: 'team2', name: 'Marketing', managerId: '3' },
    lastLoginAt: new Date('2024-01-18T14:30:00'),
    createdAt: new Date('2024-01-03T16:20:00'),
    loginCount: 12,
    image: null
  }
];

export default function UserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user can manage users
    const user = session.user as any; // Type assertion for now

    // Temporary: Allow access for owner email during development
    const isOwnerEmail = user?.email === 'jlope@boldbusiness.com';

    if (!isOwnerEmail && !canManageUsers(user)) {
      router.push('/admin');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'ADMIN': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'TEAM_MANAGER': return <Users className="h-4 w-4 text-blue-600" />;
      default: return <UserCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'INACTIVE': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'SUSPENDED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <UserX className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TEAM_MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-96"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
            
            <div className="relative z-10">
              <ScrollTextReveal effect="scramble" delay={0.4}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  User Management
                </h1>
              </ScrollTextReveal>
              
              <ScrollEffects effect="fadeUp" delay={0.6}>
                <p className="text-xl text-blue-100 mb-6 max-w-3xl">
                  Manage user accounts, roles, and permissions across the Bold Business AI Workbench platform.
                </p>
              </ScrollEffects>
              
              <ScrollEffects effect="fadeUp" delay={0.8}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">{filteredUsers.length} Users</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{filteredUsers.filter(u => u.status === 'ACTIVE').length} Active</span>
                  </div>
                </div>
              </ScrollEffects>
            </div>
          </div>
        </ScrollEffects>

        {/* Search and Filters */}
        <ScrollEffects effect="fadeUp" delay={1.0}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Roles</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEAM_MANAGER">Team Manager</option>
                  <option value="MEMBER">Member</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'ALL')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollEffects>

        {/* Users Table */}
        <ScrollEffects effect="fadeUp" delay={1.2}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.team ? (
                          <div className="text-sm text-gray-900">{user.team.name}</div>
                        ) : (
                          <div className="text-sm text-gray-500">No team</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.loginCount} logins</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last: {user.lastLoginAt?.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.role !== 'OWNER' && (
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </ScrollEffects>

        {/* Pagination */}
        <ScrollEffects effect="fadeUp" delay={1.4}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{filteredUsers.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
}

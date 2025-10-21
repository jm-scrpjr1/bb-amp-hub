import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import adminService from '../services/adminService';
import { useAuth } from '../providers/AuthProvider';
import { useRBAC } from '../providers/RBACProvider';
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const { canAccessAdminPanel, canManageUsers } = useRBAC();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canAccessAdminPanel()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [canAccessAdminPanel]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics data from backend
      const analyticsData = await adminService.getAnalytics();

      setAnalytics({
        totalUsers: analyticsData.users.total,
        activeUsers: analyticsData.users.active,
        totalGroups: analyticsData.groups.total,
        newUsersToday: analyticsData.activity.newUsersToday,
        todayLogins: analyticsData.activity.activeToday,
        usersByRole: analyticsData.users.byRole,
        usersByStatus: {
          ACTIVE: analyticsData.users.active,
          INACTIVE: analyticsData.users.inactive,
          SUSPENDED: analyticsData.users.suspended
        },
        recentUsers: analyticsData.users.recent
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'ADMIN': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'TEAM_MANAGER': return <UserCheck className="h-4 w-4 text-blue-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.INACTIVE}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading admin dashboard...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}. Manage your Bold Business AI Workbench platform.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Total Users</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.totalUsers}</div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{analytics.newUsersToday || 0} today
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Active Users</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.activeUsers}</div>
              <div className="text-sm text-gray-600">
                {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Total Groups</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.totalGroups}</div>
              <div className="text-sm text-blue-600 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Active groups
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Today's Activity</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {analytics.todayLogins || 0}
              </div>
              <div className="text-sm text-gray-600">
                Users logged in today
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
                <div className="text-sm text-blue-600 mt-2">
                  {analytics?.totalUsers || 0} users total
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/groups"
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Group Management</h3>
                <p className="text-gray-600">Create and manage user groups</p>
                <div className="text-sm text-purple-600 mt-2">
                  {analytics?.totalGroups || 0} groups total
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow group cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View detailed system reports</p>
                <div className="text-sm text-green-600 mt-2">
                  Real-time data
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        {analytics?.recentUsers && analytics.recentUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
                <Link
                  to="/admin/users"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all users →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm font-medium text-gray-700">{user.role}</span>
                      </div>
                      {getStatusBadge(user.status)}
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Role Distribution */}
        {analytics?.usersByRole && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Users by Role</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(analytics.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(role)}
                        <span className="font-medium text-gray-900">{role}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / analytics.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Users by Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(analytics.usersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {status === 'ACTIVE' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {status === 'INACTIVE' && <Clock className="h-4 w-4 text-gray-600" />}
                        {status === 'SUSPENDED' && <UserX className="h-4 w-4 text-red-600" />}
                        <span className="font-medium text-gray-900">{status}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'ACTIVE' ? 'bg-green-600' :
                              status === 'INACTIVE' ? 'bg-gray-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${(count / analytics.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, ScrollTextReveal } from '@/components/effects';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Activity, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Crown,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { canAccessAdminPanel } from '@/lib/permissions';

// Mock data for now - will be replaced with real API calls
const mockAnalytics = {
  totalUsers: 156,
  activeUsers: 142,
  newUsersToday: 8,
  totalLogins: 2847,
  usersByRole: {
    OWNER: 1,
    ADMIN: 3,
    TEAM_MANAGER: 12,
    MEMBER: 140
  },
  usersByStatus: {
    ACTIVE: 142,
    INACTIVE: 10,
    SUSPENDED: 4
  },
  recentActivity: [
    { date: '2024-01-20', newUsers: 5, totalLogins: 89 },
    { date: '2024-01-21', newUsers: 8, totalLogins: 124 },
    { date: '2024-01-22', newUsers: 3, totalLogins: 98 },
    { date: '2024-01-23', newUsers: 12, totalLogins: 156 },
    { date: '2024-01-24', newUsers: 7, totalLogins: 134 },
    { date: '2024-01-25', newUsers: 9, totalLogins: 167 },
    { date: '2024-01-26', newUsers: 8, totalLogins: 145 }
  ]
};

const mockRecentUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@boldbusiness.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLoginAt: new Date('2024-01-26T10:30:00'),
    createdAt: new Date('2024-01-20T09:15:00'),
    loginCount: 24
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@boldbusiness.com',
    role: 'TEAM_MANAGER',
    status: 'ACTIVE',
    lastLoginAt: new Date('2024-01-26T08:45:00'),
    createdAt: new Date('2024-01-19T14:20:00'),
    loginCount: 18
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@boldbusiness.com',
    role: 'MEMBER',
    status: 'INACTIVE',
    lastLoginAt: new Date('2024-01-24T16:10:00'),
    createdAt: new Date('2024-01-18T11:30:00'),
    loginCount: 12
  }
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has admin access
    const user = session.user as any; // Type assertion for now

    // Temporary: Allow access for owner email during development
    const isOwnerEmail = user?.email === 'jlope@boldbusiness.com';

    if (!isOwnerEmail && !canAccessAdminPanel(user)) {
      router.push('/');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading || status === 'loading') {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-96"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'ADMIN': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'TEAM_MANAGER': return <Users className="h-4 w-4 text-blue-600" />;
      default: return <UserCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'INACTIVE': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'SUSPENDED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <UserX className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>
            
            <div className="relative z-10">
              <ScrollTextReveal effect="scramble" delay={0.4}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </ScrollTextReveal>
              
              <ScrollEffects effect="fadeUp" delay={0.6}>
                <p className="text-xl text-purple-100 mb-6 max-w-3xl">
                  Comprehensive system analytics, user management, and administrative controls for the Bold Business AI Workbench.
                </p>
              </ScrollEffects>
              
              <ScrollEffects effect="fadeUp" delay={0.8}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Admin Access</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-semibold">Real-time Analytics</span>
                  </div>
                </div>
              </ScrollEffects>
            </div>
          </div>
        </ScrollEffects>

        {/* Analytics Overview */}
        <ScrollEffects effect="fadeUp" delay={1.0}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Total Users</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{mockAnalytics.totalUsers}</div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{mockAnalytics.newUsersToday} today
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Active Users</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{mockAnalytics.activeUsers}</div>
              <div className="text-sm text-gray-600">
                {Math.round((mockAnalytics.activeUsers / mockAnalytics.totalUsers) * 100)}% of total
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Total Logins</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{mockAnalytics.totalLogins.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                Avg: {Math.round(mockAnalytics.totalLogins / mockAnalytics.totalUsers)} per user
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">New Today</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{mockAnalytics.newUsersToday}</div>
              <div className="text-sm text-gray-600">
                {mockAnalytics.newUsersToday > 5 ? 'High activity' : 'Normal activity'}
              </div>
            </div>
          </div>
        </ScrollEffects>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScrollEffects effect="fadeUp" delay={1.2}>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Users by Role
              </h3>
              <div className="space-y-4">
                {Object.entries(mockAnalytics.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(role)}
                      <span className="font-medium text-gray-700">{role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / mockAnalytics.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollEffects>

          <ScrollEffects effect="fadeUp" delay={1.4}>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Users by Status
              </h3>
              <div className="space-y-4">
                {Object.entries(mockAnalytics.usersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <span className="font-medium text-gray-700">{status}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'ACTIVE' ? 'bg-green-600' : 
                            status === 'INACTIVE' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${(count / mockAnalytics.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollEffects>
        </div>

        {/* Recent Users & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ScrollEffects effect="fadeUp" delay={1.6} className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Users
                </h3>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View All Users
                </button>
              </div>
              <div className="space-y-4">
                {mockRecentUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="text-sm font-medium text-gray-700">{user.role.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(user.status)}
                          <span className="text-xs text-gray-500">{user.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{user.loginCount} logins</div>
                        <div className="text-xs text-gray-500">
                          Last: {user.lastLoginAt.toLocaleDateString()}
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollEffects>

          <ScrollEffects effect="fadeUp" delay={1.8}>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Manage Users</div>
                      <div className="text-sm text-gray-600">View and edit user accounts</div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">View Analytics</div>
                      <div className="text-sm text-gray-600">Detailed system reports</div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Security Settings</div>
                      <div className="text-sm text-gray-600">Configure permissions</div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-600 rounded-lg group-hover:bg-yellow-700 transition-colors">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">System Settings</div>
                      <div className="text-sm text-gray-600">Configure application</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </ScrollEffects>
        </div>

        {/* System Health */}
        <ScrollEffects effect="fadeUp" delay={2.0}>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  System Status: All Systems Operational
                </h3>
                <p className="text-gray-600 mb-4">
                  All services are running smoothly. Last system check: {new Date().toLocaleString()}
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Database: Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Authentication: Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">API: Online</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </ScrollEffects>
      </div>
    </MainLayout>
  );
}

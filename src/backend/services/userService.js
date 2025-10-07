// User service for managing users and permissions
// JavaScript version converted from TypeScript

// Mock database for development - in production, use actual database
const mockUsers = new Map();

// User roles and statuses
const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  TEAM_MANAGER: 'TEAM_MANAGER',
  MEMBER: 'MEMBER'
};

const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING'
};

// Owner email for God mode
const OWNER_EMAIL = 'jlope@boldbusiness.com';

function isOwnerEmail(email) {
  return email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

class UserService {
  // Get user by email with permissions
  static async getUserByEmail(email) {
    try {
      // For development, create a fallback user
      return this.createFallbackUser(email);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Create or update user from authentication
  static async upsertUserFromAuth(authUser) {
    try {
      const email = authUser.email.toLowerCase();
      
      // God mode: Owner email always gets OWNER role
      const role = isOwnerEmail(email) ? UserRole.OWNER : UserRole.MEMBER;

      const user = {
        id: 'user-' + email.replace('@', '-').replace('.', '-'),
        email,
        name: authUser.name,
        image: authUser.image,
        role,
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date(),
        loginCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        teamId: null,
        team: null,
        permissions: [],
        groupMemberships: [],
        managedGroups: []
      };

      mockUsers.set(email, user);
      return user;
    } catch (error) {
      console.error('Error upserting user from auth:', error);
      return null;
    }
  }

  // Get all users with pagination
  static async getUsers(options = {}) {
    try {
      const { page = 1, limit = 20, search, role, status } = options;
      
      let users = Array.from(mockUsers.values());
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user => 
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }
      
      if (role) {
        users = users.filter(user => user.role === role);
      }
      
      if (status) {
        users = users.filter(user => user.status === status);
      }

      // Pagination
      const total = users.length;
      const skip = (page - 1) * limit;
      const paginatedUsers = users.slice(skip, skip + limit);

      return {
        users: paginatedUsers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  // Get user analytics
  static async getUserAnalytics() {
    try {
      const users = Array.from(mockUsers.values());
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE).length;
      const newUsersToday = users.filter(u => {
        const today = new Date().toDateString();
        return u.createdAt.toDateString() === today;
      }).length;

      // Role counts
      const usersByRole = {};
      Object.values(UserRole).forEach(role => {
        usersByRole[role] = users.filter(u => u.role === role).length;
      });

      // Status counts
      const usersByStatus = {};
      Object.values(UserStatus).forEach(status => {
        usersByStatus[status] = users.filter(u => u.status === status).length;
      });

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalLogins: users.reduce((sum, u) => sum + u.loginCount, 0),
        usersByRole,
        usersByStatus,
        recentActivity: []
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        totalLogins: 0,
        usersByRole: {},
        usersByStatus: {},
        recentActivity: []
      };
    }
  }

  // Update user profile
  static async updateUser(userId, data) {
    try {
      // Find user by ID
      const user = Array.from(mockUsers.values()).find(u => u.id === userId);
      if (!user) return null;

      // Update user data
      Object.assign(user, data, { updatedAt: new Date() });
      mockUsers.set(user.email, user);

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Fallback user creation when database is not available
  static createFallbackUser(email) {
    const isOwner = isOwnerEmail(email);

    return {
      id: 'fallback-' + email.replace('@', '-').replace('.', '-'),
      email: email.toLowerCase(),
      name: isOwner ? 'John Lopez (God Mode)' : 'User',
      image: null,
      role: isOwner ? UserRole.OWNER : UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      loginCount: 0,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      teamId: null,
      team: null,
      permissions: [],
      groupMemberships: [],
      managedGroups: []
    };
  }
}

module.exports = {
  UserService,
  UserRole,
  UserStatus,
  OWNER_EMAIL,
  isOwnerEmail
};

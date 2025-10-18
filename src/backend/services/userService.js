// User service for managing users and permissions
// JavaScript version converted from TypeScript

const { prisma } = require('../lib/db');
const { GoogleWorkspaceService } = require('./googleWorkspaceService');

// Mock database for development - fallback when database is not available
const mockUsers = new Map();

// User roles and statuses - Updated for new RBAC system
const UserRole = {
  OWNER: 'OWNER',           // God mode access to ALL
  SUPER_ADMIN: 'SUPER_ADMIN', // Can manage groups and users (add, update, delete)
  MANAGER: 'MANAGER',       // Can view users in the groups they belong to
  MEMBER: 'MEMBER'          // Basic access own groups
};

const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING'
};

// Owner emails for God mode
const OWNER_EMAILS = ['jlope@boldbusiness.com', 'jmadrino@boldbusiness.com'];

function isOwnerEmail(email) {
  return OWNER_EMAILS.some(ownerEmail =>
    email.toLowerCase() === ownerEmail.toLowerCase()
  );
}

class UserService {
  // Get user by email with permissions
  static async getUserByEmail(email) {
    try {
      // Try to get user from database first
      const user = await prisma.users.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (user) {
        return user;
      }

      // If not found in database, try to sync from Google Workspace
      const googleWorkspace = new GoogleWorkspaceService();
      await googleWorkspace.initialize();

      const workspaceUser = await googleWorkspace.getUserFromWorkspace(email);
      if (workspaceUser) {
        console.log(`User ${email} found in Google Workspace, syncing...`);
        return await googleWorkspace.syncSingleUser(workspaceUser);
      }

      // Fallback to mock user for development
      console.log(`User ${email} not found in database or Google Workspace, using fallback`);
      return this.createFallbackUser(email);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      // Fallback to mock user on database error
      return this.createFallbackUser(email);
    }
  }

  // Create or update user from authentication
  static async upsertUserFromAuth(authUser) {
    try {
      const email = authUser.email.toLowerCase();

      // God mode: Owner email always gets OWNER role
      const role = isOwnerEmail(email) ? UserRole.OWNER : UserRole.MEMBER;

      console.log(`🔄 Upserting user: ${email} with role: ${role}`);
      console.log(`📸 User image data:`, authUser.image);

      // Try to upsert in database first
      try {
        const user = await prisma.users.upsert({
          where: { email },
          update: {
            name: authUser.name,
            image: authUser.image,
            lastLoginAt: new Date(),
            loginCount: {
              increment: 1
            }
          },
          create: {
            email,
            name: authUser.name,
            image: authUser.image,
            role,
            status: UserStatus.ACTIVE,
            country: 'US', // Default country for new users
            lastLoginAt: new Date(),
            loginCount: 1,
          },

        });

        // Auto-assign new users to General group if they're not in any groups
        const userGroups = await prisma.$queryRaw`
          SELECT * FROM group_memberships WHERE "userId" = ${user.id}
        `;

        if (userGroups.length === 0) {
          // Find General group
          const generalGroups = await prisma.$queryRaw`
            SELECT * FROM groups WHERE name = 'General' LIMIT 1
          `;

          if (generalGroups.length > 0) {
            const generalGroup = generalGroups[0];
            const membershipId = 'cm' + Math.random().toString(36).substr(2, 20);

            await prisma.$queryRaw`
              INSERT INTO group_memberships (
                id, "userId", "groupId", role, status, "joinedAt", "createdAt", "updatedAt"
              ) VALUES (
                ${membershipId}, ${user.id}, ${generalGroup.id}, 'MEMBER', 'ACTIVE', NOW(), NOW(), NOW()
              )
            `;

            console.log(`✅ Auto-assigned user ${user.email} to General group`);
          }
        }

        // Load user with group memberships and managed groups
        const userWithGroups = await this.getUserWithGroups(user.id);
        return userWithGroups || user;
      } catch (dbError) {
        console.error('Database upsert failed, using fallback:', dbError);

        // Fallback to mock user
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
          updatedAt: new Date()
        };

        mockUsers.set(email, user);
        return user;
      }
    } catch (error) {
      console.error('Error upserting user from auth:', error);
      return null;
    }
  }

  // Get user with group memberships and managed groups
  static async getUserWithGroups(userId) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          groupMemberships: {
            where: { status: 'ACTIVE' },
            include: {
              group: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  visibility: true
                }
              }
            }
          },
          managedGroups: {
            select: {
              id: true,
              name: true,
              type: true,
              visibility: true
            }
          }
        }
      });

      return user;
    } catch (error) {
      console.error('Error fetching user with groups:', error);
      return null;
    }
  }

  // Get all users with pagination
  static async getUsers(options = {}) {
    try {
      const { page = 1, limit = 20, search, role, status } = options;

      // Convert string parameters to integers
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;

      // Build where clause for filtering
      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status) {
        where.status = status;
      }

      // Get total count
      const total = await prisma.users.count({ where });

      // Get paginated users
      const skip = (pageNum - 1) * limitNum;
      const users = await prisma.users.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Add missing fields that frontend expects
      const usersWithFields = users.map(user => ({
        ...user,
        permissions: [],
        groupMemberships: [],
        managedGroups: []
      }));

      return {
        users: usersWithFields,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
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
      name: isOwner ? 'John Madrino' : 'User',
      image: null,
      role: isOwner ? UserRole.OWNER : UserRole.MEMBER,
      status: UserStatus.ACTIVE,
      loginCount: 0,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

module.exports = {
  UserService,
  UserRole,
  UserStatus,
  OWNER_EMAILS,
  isOwnerEmail
};

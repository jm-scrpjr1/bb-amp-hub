// User service for managing users and permissions
// JavaScript version converted from TypeScript

const { prisma } = require('../lib/db');
const { GoogleWorkspaceService } = require('./googleWorkspaceService');

// Mock database for development - fallback when database is not available
const mockUsers = new Map();

// User role IDs - Updated for new RBAC system with roles table
const UserRole = {
  OWNER: 'role_owner',           // God mode access to ALL
  SUPER_ADMIN: 'role_super_admin', // Can manage groups and users (add, update, delete)
  TEAM_MANAGER: 'role_team_manager',       // Can view users in the groups they belong to
  MEMBER: 'role_member'          // Basic access own groups
};

// Role names for comparison
const RoleName = {
  OWNER: 'OWNER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  TEAM_MANAGER: 'TEAM_MANAGER',
  MEMBER: 'MEMBER'
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
        where: { email: email.toLowerCase() },
        include: { roles: true } // Include role relation
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
      const roleId = isOwnerEmail(email) ? UserRole.OWNER : UserRole.MEMBER;

      console.log(`🔄 Upserting user: ${email} with roleId: ${roleId}`);
      console.log(`📸 User image data:`, authUser.image);

      // Check if user already exists and has a custom uploaded image
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });

      // Determine if we should update the image
      // Only update image if:
      // 1. User doesn't exist (new user), OR
      // 2. User exists but doesn't have a custom uploaded image (base64)
      const hasCustomImage = existingUser?.image?.startsWith('data:image/');
      const shouldUpdateImage = !existingUser || !hasCustomImage;

      console.log(`📸 Existing user has custom image: ${hasCustomImage}`);
      console.log(`📸 Should update image: ${shouldUpdateImage}`);

      // Fetch country from Google Workspace
      let country = 'US'; // Default fallback
      try {
        const googleWorkspace = new GoogleWorkspaceService();
        await googleWorkspace.initialize();
        const workspaceUser = await googleWorkspace.getUserFromWorkspace(email);

        if (workspaceUser && workspaceUser.locations && workspaceUser.locations.length > 0) {
          const primaryLocation = workspaceUser.locations[0];
          country = primaryLocation.countryCode || 'US';
          console.log(`📍 User ${email} country from Google Workspace: ${country}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not fetch country from Google Workspace: ${error.message}`);
        // Continue with default country
      }

      // Try to upsert in database first
      try {
        const updateData = {
          name: authUser.name,
          lastLoginAt: new Date(),
          loginCount: {
            increment: 1
          },
          country // Update country from Google Workspace
        };

        // Only update image if user doesn't have a custom uploaded one
        if (shouldUpdateImage) {
          updateData.image = authUser.image;
        }

        const user = await prisma.users.upsert({
          where: { email },
          update: updateData,
          create: {
            id: 'cm' + Math.random().toString(36).substr(2, 20), // Generate unique ID
            email,
            name: authUser.name,
            image: authUser.image,
            roleId,
            status: UserStatus.ACTIVE,
            country, // Use country from Google Workspace
            lastLoginAt: new Date(),
            loginCount: 1,
            updatedAt: new Date(), // Required field
          },
          include: { roles: true } // Include role relation
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
          roleId, // Fixed: was 'role', should be 'roleId'
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
          roles: true, // Include role relation
          group_memberships: {
            where: { status: 'ACTIVE' },
            include: {
              groups: {  // Fixed: was 'group', should be 'groups'
                select: {
                  id: true,
                  name: true,
                  type: true,
                  visibility: true
                }
              }
            }
          },
          groups_groups_managerIdTousers: {
            select: {
              id: true,
              name: true,
              type: true,
              visibility: true
            }
          }
        }
      });

      // Transform to camelCase for consistency with frontend
      if (user) {
        user.groupMemberships = user.group_memberships || [];
        user.managedGroups = user.groups_groups_managerIdTousers || [];
        delete user.group_memberships;
        delete user.groups_groups_managerIdTousers;
      }

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
        include: { roles: true }, // Include role relation
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
      Object.values(UserRole).forEach(roleId => {
        usersByRole[roleId] = users.filter(u => u.roleId === roleId).length;
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
      // Update user in database
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: { roles: true }
      });

      // Return user with role name
      return {
        ...updatedUser,
        role: updatedUser.roles?.name || 'MEMBER'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Fallback user creation when database is not available
  static createFallbackUser(email) {
    const isOwner = isOwnerEmail(email);
    const roleId = isOwner ? UserRole.OWNER : UserRole.MEMBER;
    const roleName = isOwner ? RoleName.OWNER : RoleName.MEMBER;

    return {
      id: 'fallback-' + email.replace('@', '-').replace('.', '-'),
      email: email.toLowerCase(),
      name: isOwner ? 'John Madrino' : 'User',
      image: null,
      roleId,
      roles: { id: roleId, name: roleName }, // Mock role relation (named 'roles' to match schema)
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
  RoleName,
  UserStatus,
  OWNER_EMAILS,
  isOwnerEmail
};

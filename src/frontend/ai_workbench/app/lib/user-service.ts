// User service for managing users and permissions

import { prisma } from './db';
import { UserRole, UserStatus, UserWithPermissions, OWNER_EMAIL, isOwnerEmail } from './permissions';

export class UserService {
  // Get user by email with permissions
  static async getUserByEmail(email: string): Promise<UserWithPermissions | null> {
    try {
      // Check if database is available
      if (!prisma) {
        console.warn('Database not available, using fallback for user:', email);
        return this.createFallbackUser(email);
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              managerId: true,
            }
          },
          managedTeams: {
            select: {
              id: true,
              name: true,
            }
          },
          permissions: {
            select: {
              permission: true,
              resource: true,
            }
          }
        }
      });

      return user as UserWithPermissions | null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Create or update user from authentication
  static async upsertUserFromAuth(authUser: {
    email: string;
    name?: string;
    image?: string;
  }): Promise<UserWithPermissions | null> {
    try {
      const email = authUser.email.toLowerCase();

      // Check if database is available
      if (!prisma) {
        console.warn('Database not available, using fallback for auth user:', email);
        return this.createFallbackUser(email);
      }

      // God mode: Owner email always gets OWNER role
      const role = isOwnerEmail(email) ? UserRole.OWNER : UserRole.MEMBER;

      const user = await prisma.user.upsert({
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
          lastLoginAt: new Date(),
          loginCount: 1,
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              managerId: true,
            }
          },
          managedTeams: {
            select: {
              id: true,
              name: true,
            }
          },
          permissions: {
            select: {
              permission: true,
              resource: true,
            }
          }
        }
      });

      return user as UserWithPermissions;
    } catch (error) {
      console.error('Error upserting user from auth:', error);
      return null;
    }
  }

  // Get all users with pagination
  static async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
  } = {}): Promise<{
    users: UserWithPermissions[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 20, search, role, status } = options;
      const skip = (page - 1) * limit;

      const where: any = {};

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

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { role: 'asc' },
            { createdAt: 'desc' }
          ],
          include: {
            team: {
              select: {
                id: true,
                name: true,
                managerId: true,
              }
            },
            managedTeams: {
              select: {
                id: true,
                name: true,
              }
            },
            permissions: {
              select: {
                permission: true,
                resource: true,
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users: users as UserWithPermissions[],
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

  // Update user role
  static async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Update user status
  static async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status }
      });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  // Get system analytics
  static async getSystemAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalLogins: number;
    usersByRole: Record<UserRole, number>;
    usersByStatus: Record<UserStatus, number>;
    recentActivity: Array<{
      date: string;
      newUsers: number;
      totalLogins: number;
    }>;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        totalLogins,
        usersByRole,
        usersByStatus,
        recentActivity
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.user.aggregate({ _sum: { loginCount: true } }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        }),
        prisma.user.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.user.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          select: {
            createdAt: true,
            loginCount: true
          }
        })
      ]);

      // Process role counts
      const roleCountsMap: Record<UserRole, number> = {
        [UserRole.OWNER]: 0,
        [UserRole.ADMIN]: 0,
        [UserRole.TEAM_MANAGER]: 0,
        [UserRole.MEMBER]: 0,
      };
      usersByRole.forEach(item => {
        roleCountsMap[item.role as UserRole] = item._count.role;
      });

      // Process status counts
      const statusCountsMap: Record<UserStatus, number> = {
        [UserStatus.ACTIVE]: 0,
        [UserStatus.INACTIVE]: 0,
        [UserStatus.SUSPENDED]: 0,
      };
      usersByStatus.forEach(item => {
        statusCountsMap[item.status as UserStatus] = item._count.status;
      });

      // Process recent activity (simplified for now)
      const activityMap: Record<string, { newUsers: number; totalLogins: number }> = {};
      recentActivity.forEach(user => {
        const date = user.createdAt.toISOString().split('T')[0];
        if (!activityMap[date]) {
          activityMap[date] = { newUsers: 0, totalLogins: 0 };
        }
        activityMap[date].newUsers += 1;
        activityMap[date].totalLogins += user.loginCount;
      });

      const recentActivityArray = Object.entries(activityMap).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalLogins: totalLogins._sum.loginCount || 0,
        usersByRole: roleCountsMap,
        usersByStatus: statusCountsMap,
        recentActivity: recentActivityArray
      };
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        totalLogins: 0,
        usersByRole: {
          [UserRole.OWNER]: 0,
          [UserRole.ADMIN]: 0,
          [UserRole.TEAM_MANAGER]: 0,
          [UserRole.MEMBER]: 0,
        },
        usersByStatus: {
          [UserStatus.ACTIVE]: 0,
          [UserStatus.INACTIVE]: 0,
          [UserStatus.SUSPENDED]: 0,
        },
        recentActivity: []
      };
    }
  }

  // Update user profile
  static async updateUser(
    userId: string,
    data: {
      name?: string;
      image?: string;
      role?: UserRole;
      status?: UserStatus;
      teamId?: string;
    }
  ): Promise<UserWithPermissions | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        include: {
          team: {
            select: {
              id: true,
              name: true,
              managerId: true,
            }
          },
          managedTeams: {
            select: {
              id: true,
              name: true,
            }
          },
          permissions: {
            select: {
              permission: true,
              resource: true,
            }
          }
        }
      });

      return user as UserWithPermissions;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Fallback user creation when database is not available
  private static createFallbackUser(email: string): UserWithPermissions {
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

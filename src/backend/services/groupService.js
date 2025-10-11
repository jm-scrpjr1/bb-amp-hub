// Group service for managing groups, memberships, and permissions
// Updated to use Prisma database

const { PrismaClient } = require('@prisma/client');
const { GroupType, GroupVisibility, MembershipStatus } = require('./permissionService');

const prisma = new PrismaClient();

class GroupService {
  // Get all groups with filtering and pagination
  static async getGroups(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        type,
        visibility
      } = options;

      // Build where clause for filtering
      const where = {
        isActive: true
      };

      // Apply filters
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (type) {
        where.type = type;
      }

      if (visibility) {
        where.visibility = visibility;
      }

      // Get total count for pagination
      const total = await prisma.group.count({ where });

      // Get groups with pagination
      const skip = (page - 1) * limit;
      const groups = await prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              memberships: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      });

      return {
        groups: groups.map(group => ({
          ...group,
          memberCount: group._count.memberships
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching groups:', error);
      return {
        groups: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  // Get group by ID
  static async getGroupById(groupId) {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          memberships: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return group;
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      return null;
    }
  }

  // Create new group
  static async createGroup(groupData, createdById) {
    try {
      const groupId = 'group-' + Date.now();
      
      const group = {
        id: groupId,
        name: groupData.name,
        description: groupData.description,
        type: groupData.type || GroupType.CUSTOM,
        visibility: groupData.visibility || GroupVisibility.PRIVATE,
        maxMembers: groupData.maxMembers,
        autoApprove: groupData.autoApprove || false,
        tags: groupData.tags || [],
        metadata: groupData.metadata || {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById
      };

      mockGroups.set(groupId, group);
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  // Update group
  static async updateGroup(groupId, updateData) {
    try {
      const group = mockGroups.get(groupId);
      if (!group) return null;

      Object.assign(group, updateData, { updatedAt: new Date() });
      mockGroups.set(groupId, group);

      return group;
    } catch (error) {
      console.error('Error updating group:', error);
      return null;
    }
  }

  // Delete group (soft delete)
  static async deleteGroup(groupId) {
    try {
      const group = mockGroups.get(groupId);
      if (!group) return false;

      group.isActive = false;
      group.updatedAt = new Date();
      mockGroups.set(groupId, group);

      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  // Get group members
  static async getGroupMembers(groupId) {
    try {
      const memberships = await prisma.groupMember.findMany({
        where: {
          groupId: groupId,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              country: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { user: { name: 'asc' } }
        ]
      });

      return memberships;
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  }

  // Add member to group
  static async addGroupMember(groupId, userId, role = 'MEMBER') {
    try {
      const membershipId = `membership-${groupId}-${userId}`;
      
      const membership = {
        id: membershipId,
        groupId,
        userId,
        role,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockMemberships.set(membershipId, membership);
      return membership;
    } catch (error) {
      console.error('Error adding group member:', error);
      return null;
    }
  }

  // Remove member from group
  static async removeGroupMember(groupId, userId) {
    try {
      const membershipId = `membership-${groupId}-${userId}`;
      const membership = mockMemberships.get(membershipId);
      
      if (membership) {
        membership.status = MembershipStatus.REMOVED;
        membership.updatedAt = new Date();
        mockMemberships.set(membershipId, membership);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing group member:', error);
      return false;
    }
  }

  // Get groups for user
  static async getUserGroups(userId) {
    try {
      const userMemberships = Array.from(mockMemberships.values())
        .filter(m => m.userId === userId && m.status === MembershipStatus.ACTIVE);

      const groups = userMemberships.map(membership => {
        const group = mockGroups.get(membership.groupId);
        return {
          ...group,
          membershipRole: membership.role,
          joinedAt: membership.joinedAt
        };
      }).filter(Boolean);

      return groups;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  }

  // Get user memberships with group details
  static async getUserMemberships(userId) {
    try {
      const userMemberships = Array.from(mockMemberships.values())
        .filter(m => m.userId === userId && m.status === MembershipStatus.ACTIVE);

      const memberships = userMemberships.map(membership => {
        const group = mockGroups.get(membership.groupId);
        return {
          id: membership.id,
          groupId: membership.groupId,
          userId: membership.userId,
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt,
          group: group ? {
            id: group.id,
            name: group.name,
            type: group.type,
            visibility: group.visibility
          } : null
        };
      }).filter(m => m.group);

      return memberships;
    } catch (error) {
      console.error('Error fetching user memberships:', error);
      return [];
    }
  }
}

module.exports = {
  GroupService
};

// Group service for managing groups, memberships, and permissions
// Updated to use Prisma database

const { prisma } = require('../lib/db');
const { GroupType, GroupVisibility, MembershipStatus } = require('./permissionService');

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
      const total = await prisma.groups.count({ where });

      // Get groups with pagination
      const skip = (page - 1) * limit;
      const groups = await prisma.groups.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
        include: {
          users_groups_createdByIdTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          users_groups_managerIdTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              group_memberships: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      });

      return {
        groups: groups.map(group => {
          const transformed = {
            ...group,
            createdBy: group.users_groups_createdByIdTousers,
            manager: group.users_groups_managerIdTousers,
            memberCount: group._count.group_memberships
          };
          delete transformed.users_groups_createdByIdTousers;
          delete transformed.users_groups_managerIdTousers;
          return transformed;
        }),
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
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          users_groups_createdByIdTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          users_groups_managerIdTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          group_memberships: {
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
      // First check if group exists
      const existingGroup = await prisma.groups.findUnique({
        where: { id: groupId }
      });

      if (!existingGroup) return null;

      // Filter out unsupported fields (like tags) that don't exist in the database schema
      const { tags, ...validUpdateData } = updateData;

      // Update the group
      const updatedGroup = await prisma.groups.update({
        where: { id: groupId },
        data: {
          ...validUpdateData,
          updatedAt: new Date()
        },
        include: {
          users_groups_createdByIdTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          users_groups_managerIdTousers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              memberships: true
            }
          }
        }
      });

      return updatedGroup;
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
      const memberships = await prisma.group_memberships.findMany({
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

  // Get groups for user with pagination and filtering
  static async getUserGroups(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        type,
        visibility
      } = options;

      // Get user's group memberships
      const userMemberships = await prisma.group_memberships.findMany({
        where: {
          userId: userId,
          status: 'ACTIVE'
        },
        include: {
          group: {
            include: {
              users_groups_createdByIdTousers: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              users_groups_managerIdTousers: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              _count: {
                select: {
                  group_memberships: {
                    where: {
                      status: 'ACTIVE'
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Extract groups and apply filters
      let groups = userMemberships
        .map(membership => ({
          ...membership.group,
          createdBy: membership.group.users_groups_createdByIdTousers,
          manager: membership.group.users_groups_managerIdTousers,
          memberCount: membership.group._count.group_memberships,
          membershipRole: membership.role,
          joinedAt: membership.joinedAt,
          // Remove snake_case fields
          users_groups_createdByIdTousers: undefined,
          users_groups_managerIdTousers: undefined
        }))
        .filter(group => group.isActive); // Only active groups

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        groups = groups.filter(group =>
          group.name.toLowerCase().includes(searchLower) ||
          group.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply type filter
      if (type) {
        groups = groups.filter(group => group.type === type);
      }

      // Apply visibility filter
      if (visibility) {
        groups = groups.filter(group => group.visibility === visibility);
      }

      // Sort groups
      groups.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return a.name.localeCompare(b.name);
      });

      // Apply pagination
      const total = groups.length;
      const skip = (page - 1) * limit;
      const paginatedGroups = groups.slice(skip, skip + limit);

      return {
        groups: paginatedGroups,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return {
        groups: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
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

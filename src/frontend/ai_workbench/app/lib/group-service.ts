// Group service for managing groups, memberships, and permissions

import { prisma } from './db';
import { 
  GroupType, 
  GroupVisibility, 
  MembershipStatus, 
  Permission,
  UserWithPermissions,
  GroupInfo,
  GroupMembershipInfo
} from './permissions';

export interface CreateGroupData {
  name: string;
  description?: string;
  type: GroupType;
  visibility: GroupVisibility;
  maxMembers?: number;
  autoApprove?: boolean;
  tags?: string[];
  metadata?: any;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  type?: GroupType;
  visibility?: GroupVisibility;
  maxMembers?: number;
  autoApprove?: boolean;
  tags?: string[];
  metadata?: any;
  isActive?: boolean;
}

export interface AddMemberData {
  userId: string;
  role?: string;
  canInvite?: boolean;
  canRemove?: boolean;
  canEdit?: boolean;
}

export class GroupService {
  // Create a new group
  static async createGroup(
    createdById: string, 
    data: CreateGroupData
  ): Promise<GroupInfo | null> {
    try {
      const group = await prisma.group.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          visibility: data.visibility,
          createdById,
          maxMembers: data.maxMembers,
          autoApprove: data.autoApprove || false,
          tags: data.tags || [],
          metadata: data.metadata,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              memberships: {
                where: {
                  status: MembershipStatus.ACTIVE
                }
              }
            }
          }
        }
      });

      // Add creator as the first member with full permissions
      await this.addMember(group.id, {
        userId: createdById,
        role: 'Creator',
        canInvite: true,
        canRemove: true,
        canEdit: true,
      });

      return {
        ...group,
        memberCount: group._count.memberships,
      } as GroupInfo;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  // Get group by ID with full details
  static async getGroupById(groupId: string): Promise<GroupInfo | null> {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              memberships: {
                where: {
                  status: MembershipStatus.ACTIVE
                }
              }
            }
          }
        }
      });

      if (!group) return null;

      return {
        ...group,
        memberCount: group._count.memberships,
      } as GroupInfo;
    } catch (error) {
      console.error('Error fetching group:', error);
      return null;
    }
  }

  // Get all groups with filtering options
  static async getGroups(options: {
    userId?: string;
    type?: GroupType;
    visibility?: GroupVisibility;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<GroupInfo[]> {
    try {
      const where: any = {
        // Default to active groups only, unless explicitly set to false
        isActive: options.isActive !== false
      };

      if (options.type) where.type = options.type;
      if (options.visibility) where.visibility = options.visibility;
      if (options.search) {
        where.OR = [
          { name: { contains: options.search, mode: 'insensitive' } },
          { description: { contains: options.search, mode: 'insensitive' } },
          { tags: { has: options.search } }
        ];
      }

      const groups = await prisma.group.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              memberships: {
                where: {
                  status: MembershipStatus.ACTIVE
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: options.limit,
        skip: options.offset,
      });

      return groups.map(group => ({
        ...group,
        memberCount: group._count.memberships,
      })) as GroupInfo[];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  // Update group
  static async updateGroup(
    groupId: string, 
    data: UpdateGroupData
  ): Promise<GroupInfo | null> {
    try {
      const group = await prisma.group.update({
        where: { id: groupId },
        data,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              memberships: {
                where: {
                  status: MembershipStatus.ACTIVE
                }
              }
            }
          }
        }
      });

      return {
        ...group,
        memberCount: group._count.memberships,
      } as GroupInfo;
    } catch (error) {
      console.error('Error updating group:', error);
      return null;
    }
  }

  // Delete group
  static async deleteGroup(groupId: string): Promise<boolean> {
    try {
      await prisma.group.delete({
        where: { id: groupId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  // Add member to group
  static async addMember(
    groupId: string, 
    data: AddMemberData
  ): Promise<GroupMembershipInfo | null> {
    try {
      const membership = await prisma.groupMembership.create({
        data: {
          groupId,
          userId: data.userId,
          status: MembershipStatus.ACTIVE,
          role: data.role,
          joinedAt: new Date(),
          canInvite: data.canInvite || false,
          canRemove: data.canRemove || false,
          canEdit: data.canEdit || false,
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              type: true,
              visibility: true,
            }
          }
        }
      });

      return membership as GroupMembershipInfo;
    } catch (error) {
      console.error('Error adding member to group:', error);
      return null;
    }
  }

  // Remove member from group
  static async removeMember(groupId: string, userId: string): Promise<boolean> {
    try {
      await prisma.groupMembership.delete({
        where: {
          userId_groupId: {
            userId,
            groupId
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Error removing member from group:', error);
      return false;
    }
  }

  // Get group members
  static async getGroupMembers(groupId: string): Promise<any[]> {
    try {
      const memberships = await prisma.groupMembership.findMany({
        where: { 
          groupId,
          status: MembershipStatus.ACTIVE
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              status: true,
            }
          }
        },
        orderBy: { joinedAt: 'asc' }
      });

      return memberships;
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  }

  // Get user's group memberships
  static async getUserMemberships(userId: string): Promise<GroupMembershipInfo[]> {
    try {
      const memberships = await prisma.groupMembership.findMany({
        where: { 
          userId,
          status: MembershipStatus.ACTIVE
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              type: true,
              visibility: true,
            }
          }
        }
      });

      return memberships as GroupMembershipInfo[];
    } catch (error) {
      console.error('Error fetching user memberships:', error);
      return [];
    }
  }
}

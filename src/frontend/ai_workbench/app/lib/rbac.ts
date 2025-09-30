// Role-Based Access Control (RBAC) Framework

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  Permission,
  UserRole,
  UserWithPermissions,
  GroupType,
  hasPermission,
  canAccessAdminPanel,
  canManageUsers,
  canCreateGroups,
  canManageGroup,
  canViewGroup,
  canInviteToGroup,
  getAccessibleContent,
  hasGodMode
} from './permissions';
import { UserService } from './user-service';
import { GroupService } from './group-service';
import { prisma } from './db';

// RBAC Context for React components
export interface RBACContext {
  user: UserWithPermissions | null;
  permissions: Permission[];
  hasPermission: (permission: Permission, resource?: string) => boolean;
  canAccessAdminPanel: () => boolean;
  canManageUsers: () => boolean;
  canCreateGroups: () => boolean;
  canManageGroup: (groupId: string) => boolean;
  canViewGroup: (groupId: string) => Promise<boolean>;
  canInviteToGroup: (groupId: string) => boolean;
  getAccessibleContent: () => Permission[];
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isTeamManager: () => boolean;
  isMember: () => boolean;
  hasGodMode: () => boolean;
}

// Create RBAC context from user
export function createRBACContext(user: UserWithPermissions | null): RBACContext {
  return {
    user,
    permissions: user?.permissions.map(p => p.permission) || [],
    
    hasPermission: (permission: Permission, resource?: string) => 
      hasPermission(user, permission, resource),
    
    canAccessAdminPanel: () => canAccessAdminPanel(user),
    canManageUsers: () => canManageUsers(user),
    canCreateGroups: () => canCreateGroups(user),
    canManageGroup: (groupId: string) => canManageGroup(user, groupId),
    
    canViewGroup: async (groupId: string) => {
      const group = await GroupService.getGroupById(groupId);
      return group ? canViewGroup(user, group) : false;
    },
    
    canInviteToGroup: (groupId: string) => canInviteToGroup(user, groupId),
    getAccessibleContent: () => getAccessibleContent(user),
    
    isOwner: () => user?.role === UserRole.OWNER,
    isAdmin: () => user?.role === UserRole.ADMIN,
    isTeamManager: () => user?.role === UserRole.TEAM_MANAGER,
    isMember: () => user?.role === UserRole.MEMBER,
    hasGodMode: () => hasGodMode(user),
  };
}

// Middleware factory for protecting routes
export function createRBACMiddleware(options: {
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  resource?: string;
  customCheck?: (user: UserWithPermissions) => boolean;
}) {
  return async (req: NextRequest) => {
    try {
      const token = await getToken({ req });
      
      if (!token?.email) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }

      const user = await UserService.getUserByEmail(token.email);
      
      if (!user) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }

      // Check required role
      if (options.requiredRole && user.role !== options.requiredRole) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Check allowed roles
      if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Check required permission
      if (options.requiredPermission && !hasPermission(user, options.requiredPermission, options.resource)) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Custom check
      if (options.customCheck && !options.customCheck(user)) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('RBAC Middleware error:', error);
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  };
}

// Higher-order component configuration for protecting React components
export interface RBACComponentOptions {
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  resource?: string;
  customCheck?: (user: UserWithPermissions) => boolean;
}

// Function to check if user meets RBAC requirements
export function checkRBACAccess(
  user: UserWithPermissions | null,
  options: RBACComponentOptions
): boolean {
  if (!user) return false;

  // Check required role
  if (options.requiredRole && user.role !== options.requiredRole) {
    return false;
  }

  // Check allowed roles
  if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
    return false;
  }

  // Check required permission
  if (options.requiredPermission && !hasPermission(user, options.requiredPermission, options.resource)) {
    return false;
  }

  // Custom check
  if (options.customCheck && !options.customCheck(user)) {
    return false;
  }

  return true;
}

// Content filtering based on group membership and permissions
export class ContentFilter {
  static async filterResourcesByAccess(
    user: UserWithPermissions | null,
    resources: any[]
  ): Promise<any[]> {
    if (!user) return [];

    const accessibleContent = getAccessibleContent(user);
    
    return resources.filter(resource => {
      // Check if user has access to this type of content
      switch (resource.category?.toLowerCase()) {
        case 'hr':
          return accessibleContent.includes(Permission.VIEW_HR_CONTENT);
        case 'it':
          return accessibleContent.includes(Permission.VIEW_IT_CONTENT);
        case 'finance':
          return accessibleContent.includes(Permission.VIEW_FINANCE_CONTENT);
        case 'marketing':
          return accessibleContent.includes(Permission.VIEW_MARKETING_CONTENT);
        case 'admin':
          return accessibleContent.includes(Permission.VIEW_ADMIN_CONTENT);
        default:
          return true; // Public content
      }
    });
  }

  static async filterGroupsByVisibility(
    user: UserWithPermissions | null,
    groups: any[]
  ): Promise<any[]> {
    if (!user) return [];

    const filteredGroups = [];
    
    for (const group of groups) {
      if (canViewGroup(user, group)) {
        filteredGroups.push(group);
      }
    }
    
    return filteredGroups;
  }
}

// Permission assignment utilities
export class PermissionManager {
  static async assignPermissionToUser(
    userId: string,
    permission: Permission,
    resource?: string
  ): Promise<boolean> {
    try {
      await prisma.userPermission.create({
        data: {
          userId,
          permission,
          resource,
        }
      });
      return true;
    } catch (error) {
      console.error('Error assigning permission to user:', error);
      return false;
    }
  }

  static async revokePermissionFromUser(
    userId: string,
    permission: Permission,
    resource?: string
  ): Promise<boolean> {
    try {
      await prisma.userPermission.delete({
        where: {
          userId_permission_resource: {
            userId,
            permission,
            resource: resource || null,
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Error revoking permission from user:', error);
      return false;
    }
  }

  static async assignPermissionToGroup(
    groupId: string,
    permission: Permission,
    resource?: string
  ): Promise<boolean> {
    try {
      await prisma.groupPermission.create({
        data: {
          groupId,
          permission,
          resource,
        }
      });
      return true;
    } catch (error) {
      console.error('Error assigning permission to group:', error);
      return false;
    }
  }

  static async getDefaultPermissionsByRole(role: UserRole): Promise<Permission[]> {
    const permissions: Permission[] = [];

    switch (role) {
      case UserRole.OWNER:
        // Owner gets all permissions
        permissions.push(...Object.values(Permission));
        break;
        
      case UserRole.ADMIN:
        permissions.push(
          Permission.ADMIN_PANEL_ACCESS,
          Permission.MANAGE_USERS,
          Permission.VIEW_USER_PROFILES,
          Permission.ASSIGN_ROLES,
          Permission.CREATE_GROUP,
          Permission.MANAGE_GROUP_MEMBERS,
          Permission.VIEW_ALL_GROUPS,
          Permission.ANALYTICS_ACCESS,
          Permission.AI_TRAINING_ACCESS,
          Permission.AI_ASSESSMENT_ACCESS,
          Permission.PROMPT_TUTOR_ACCESS
        );
        break;
        
      case UserRole.TEAM_MANAGER:
        permissions.push(
          Permission.CREATE_GROUP,
          Permission.MANAGE_GROUP_MEMBERS,
          Permission.VIEW_USER_PROFILES,
          Permission.AI_TRAINING_ACCESS,
          Permission.AI_ASSESSMENT_ACCESS,
          Permission.PROMPT_TUTOR_ACCESS
        );
        break;
        
      case UserRole.MEMBER:
        permissions.push(
          Permission.AI_TRAINING_ACCESS,
          Permission.PROMPT_TUTOR_ACCESS
        );
        break;
    }

    return permissions;
  }

  static async assignDefaultPermissions(userId: string, role: UserRole): Promise<void> {
    const permissions = await this.getDefaultPermissionsByRole(role);
    
    for (const permission of permissions) {
      await this.assignPermissionToUser(userId, permission);
    }
  }
}

// Audit logging for RBAC actions
export class RBACLogger {
  static async logAction(
    userId: string,
    action: string,
    resource?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.groupAuditLog.create({
        data: {
          groupId: resource || 'system',
          userId,
          action,
          details,
          ipAddress,
          userAgent,
        }
      });
    } catch (error) {
      console.error('Error logging RBAC action:', error);
    }
  }
}

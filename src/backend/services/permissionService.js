// Permission service for managing user permissions and access control
// JavaScript version converted from TypeScript

const { isOwnerEmail, UserRole, UserStatus } = require('./userService');

// Permissions enum
const Permission = {
  // Group Management
  CREATE_GROUP: 'CREATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  EDIT_GROUP: 'EDIT_GROUP',
  MANAGE_GROUP_MEMBERS: 'MANAGE_GROUP_MEMBERS',
  VIEW_ALL_GROUPS: 'VIEW_ALL_GROUPS',

  // User Management
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_USER_PROFILES: 'VIEW_USER_PROFILES',
  ASSIGN_ROLES: 'ASSIGN_ROLES',

  // Content Access
  VIEW_HR_CONTENT: 'VIEW_HR_CONTENT',
  VIEW_IT_CONTENT: 'VIEW_IT_CONTENT',
  VIEW_FINANCE_CONTENT: 'VIEW_FINANCE_CONTENT',
  VIEW_MARKETING_CONTENT: 'VIEW_MARKETING_CONTENT',
  VIEW_ADMIN_CONTENT: 'VIEW_ADMIN_CONTENT',

  // System Administration
  ADMIN_PANEL_ACCESS: 'ADMIN_PANEL_ACCESS',
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  ANALYTICS_ACCESS: 'ANALYTICS_ACCESS'
};

// Group types and visibility
const GroupType = {
  DEPARTMENT: 'DEPARTMENT',
  PROJECT: 'PROJECT',
  FUNCTIONAL: 'FUNCTIONAL',
  TEMPORARY: 'TEMPORARY',
  CUSTOM: 'CUSTOM'
};

const GroupVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  RESTRICTED: 'RESTRICTED'
};

const MembershipStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
  REMOVED: 'REMOVED'
};

class PermissionService {
  // God mode check - ensures owner email always has access
  static hasGodMode(user) {
    return user ? isOwnerEmail(user.email) : false;
  }

  // Check if user has specific permission
  static hasPermission(user, permission, resource) {
    if (!user || user.status !== UserStatus.ACTIVE) return false;

    // God mode for owner email - ALWAYS has all permissions
    if (isOwnerEmail(user.email)) return true;

    // Owner role has all permissions
    if (user.role === UserRole.OWNER) return true;

    // Check direct user permissions
    return user.permissions.some(p =>
      p.permission === permission &&
      (!resource || p.resource === resource || p.resource === '*')
    );
  }

  // Admin panel access
  static canAccessAdminPanel(user) {
    return this.hasGodMode(user) || 
           this.hasPermission(user, Permission.ADMIN_PANEL_ACCESS) ||
           user?.role === UserRole.ADMIN ||
           user?.role === UserRole.OWNER;
  }

  // User management permissions
  static canManageUsers(user) {
    return this.hasGodMode(user) || 
           this.hasPermission(user, Permission.MANAGE_USERS) ||
           user?.role === UserRole.ADMIN ||
           user?.role === UserRole.OWNER;
  }

  // Group management permissions
  static canCreateGroups(user) {
    return this.hasGodMode(user) || 
           this.hasPermission(user, Permission.CREATE_GROUP) ||
           user?.role === UserRole.TEAM_MANAGER ||
           user?.role === UserRole.ADMIN ||
           user?.role === UserRole.OWNER;
  }

  static canManageGroup(user, groupId) {
    if (!user) return false;
    
    // God mode always has access
    if (this.hasGodMode(user)) return true;
    
    // Check if user has general group management permission
    if (this.hasPermission(user, Permission.MANAGE_GROUP_MEMBERS)) return true;
    
    // Check if user manages this specific group
    if (user.managedGroups?.some(g => g.id === groupId)) return true;
    
    // Admin and Owner roles can manage all groups
    return user.role === UserRole.ADMIN || user.role === UserRole.OWNER;
  }

  static canViewGroup(user, groupId) {
    if (!user) return false;
    
    // God mode always has access
    if (this.hasGodMode(user)) return true;
    
    // Check if user has view all groups permission
    if (this.hasPermission(user, Permission.VIEW_ALL_GROUPS)) return true;
    
    // Check if user is a member of this group
    if (user.groupMemberships?.some(m => m.groupId === groupId && m.status === MembershipStatus.ACTIVE)) {
      return true;
    }
    
    // Check if user manages this group
    if (user.managedGroups?.some(g => g.id === groupId)) return true;
    
    // Admin and Owner roles can view all groups
    return user.role === UserRole.ADMIN || user.role === UserRole.OWNER;
  }

  static canInviteToGroup(user, groupId) {
    if (!user) return false;
    
    // God mode always has access
    if (this.hasGodMode(user)) return true;
    
    // Check if user can manage this specific group
    return this.canManageGroup(user, groupId);
  }

  // Content access permissions
  static getAccessibleContent(user) {
    if (!user) return [];
    
    const accessibleContent = [];
    
    // God mode has access to everything
    if (this.hasGodMode(user)) {
      return ['HR', 'IT', 'FINANCE', 'MARKETING', 'ADMIN'];
    }
    
    // Check specific content permissions
    if (this.hasPermission(user, Permission.VIEW_HR_CONTENT)) {
      accessibleContent.push('HR');
    }
    
    if (this.hasPermission(user, Permission.VIEW_IT_CONTENT)) {
      accessibleContent.push('IT');
    }
    
    if (this.hasPermission(user, Permission.VIEW_FINANCE_CONTENT)) {
      accessibleContent.push('FINANCE');
    }
    
    if (this.hasPermission(user, Permission.VIEW_MARKETING_CONTENT)) {
      accessibleContent.push('MARKETING');
    }
    
    if (this.hasPermission(user, Permission.VIEW_ADMIN_CONTENT)) {
      accessibleContent.push('ADMIN');
    }
    
    return accessibleContent;
  }
}

module.exports = {
  PermissionService,
  Permission,
  GroupType,
  GroupVisibility,
  MembershipStatus
};

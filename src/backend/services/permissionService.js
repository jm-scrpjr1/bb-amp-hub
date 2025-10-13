// Permission service for managing user permissions and access control
// Updated for new RBAC system

const { isOwnerEmail, UserRole, UserStatus } = require('./userService');

// Permissions enum - Updated for new RBAC system
const Permission = {
  // God Mode (OWNER only)
  GOD_MODE: 'GOD_MODE',

  // Group Management (SUPER_ADMIN, OWNER)
  CREATE_GROUP: 'CREATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  EDIT_GROUP: 'EDIT_GROUP',
  MANAGE_GROUP_MEMBERS: 'MANAGE_GROUP_MEMBERS',
  VIEW_ALL_GROUPS: 'VIEW_ALL_GROUPS',

  // User Management (SUPER_ADMIN, OWNER)
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_ALL_USER_PROFILES: 'VIEW_ALL_USER_PROFILES',
  ASSIGN_ROLES: 'ASSIGN_ROLES',
  DELETE_USERS: 'DELETE_USERS',

  // Manager Permissions (MANAGER, SUPER_ADMIN, OWNER)
  VIEW_GROUP_MEMBERS: 'VIEW_GROUP_MEMBERS',
  MANAGE_OWN_GROUP_MEMBERS: 'MANAGE_OWN_GROUP_MEMBERS',

  // Content Access (Country-based)
  VIEW_PH_RESOURCES: 'VIEW_PH_RESOURCES',
  VIEW_COL_RESOURCES: 'VIEW_COL_RESOURCES',
  VIEW_MX_RESOURCES: 'VIEW_MX_RESOURCES',
  VIEW_US_RESOURCES: 'VIEW_US_RESOURCES',
  VIEW_IN_RESOURCES: 'VIEW_IN_RESOURCES',

  // Department Access
  VIEW_HR_CONTENT: 'VIEW_HR_CONTENT',
  VIEW_IT_CONTENT: 'VIEW_IT_CONTENT',
  VIEW_FINANCE_CONTENT: 'VIEW_FINANCE_CONTENT',
  VIEW_MARKETING_CONTENT: 'VIEW_MARKETING_CONTENT',
  VIEW_SALES_CONTENT: 'VIEW_SALES_CONTENT',
  VIEW_DEVELOPER_CONTENT: 'VIEW_DEVELOPER_CONTENT',

  // System Administration (SUPER_ADMIN, OWNER)
  ADMIN_PANEL_ACCESS: 'ADMIN_PANEL_ACCESS',
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  ANALYTICS_ACCESS: 'ANALYTICS_ACCESS',

  // AI Features (All roles)
  AI_TRAINING_ACCESS: 'AI_TRAINING_ACCESS',
  AI_ASSESSMENT_ACCESS: 'AI_ASSESSMENT_ACCESS',
  PROMPT_TUTOR_ACCESS: 'PROMPT_TUTOR_ACCESS',

  // Basic Access (All roles)
  VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
  EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
  VIEW_OWN_GROUPS: 'VIEW_OWN_GROUPS'
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
  // God mode check - OWNER role has access to everything
  static hasGodMode(user) {
    return user && (user.role === 'OWNER' || isOwnerEmail(user.email));
  }

  // Check if user has specific permission based on role
  static hasPermission(user, permission, resource) {
    if (!user || user.status !== UserStatus.ACTIVE) return false;

    // God mode for OWNER - ALWAYS has all permissions
    if (this.hasGodMode(user)) return true;

    // Role-based permissions
    switch (user.role) {
      case 'OWNER':
        return true; // God mode access to ALL

      case 'SUPER_ADMIN':
        return this.getSuperAdminPermissions().includes(permission);

      case 'MANAGER':
        return this.getManagerPermissions().includes(permission);

      case 'MEMBER':
        return this.getMemberPermissions().includes(permission);

      default:
        return false;
    }
  }

  // Get permissions for SUPER_ADMIN role
  static getSuperAdminPermissions() {
    return [
      // Group Management
      Permission.CREATE_GROUP,
      Permission.DELETE_GROUP,
      Permission.EDIT_GROUP,
      Permission.MANAGE_GROUP_MEMBERS,
      Permission.VIEW_ALL_GROUPS,

      // User Management
      Permission.MANAGE_USERS,
      Permission.VIEW_ALL_USER_PROFILES,
      Permission.ASSIGN_ROLES,
      Permission.DELETE_USERS,

      // System Administration
      Permission.ADMIN_PANEL_ACCESS,
      Permission.SYSTEM_SETTINGS,
      Permission.ANALYTICS_ACCESS,

      // AI Features
      Permission.AI_TRAINING_ACCESS,
      Permission.AI_ASSESSMENT_ACCESS,
      Permission.PROMPT_TUTOR_ACCESS,

      // Basic Access
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_PROFILE,
      Permission.VIEW_OWN_GROUPS
    ];
  }

  // Get permissions for MANAGER role
  static getManagerPermissions() {
    return [
      // Manager specific
      Permission.VIEW_GROUP_MEMBERS,
      Permission.MANAGE_OWN_GROUP_MEMBERS,

      // AI Features
      Permission.AI_TRAINING_ACCESS,
      Permission.AI_ASSESSMENT_ACCESS,
      Permission.PROMPT_TUTOR_ACCESS,

      // Basic Access
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_PROFILE,
      Permission.VIEW_OWN_GROUPS
    ];
  }

  // Get permissions for MEMBER role
  static getMemberPermissions() {
    return [
      // AI Features
      Permission.AI_TRAINING_ACCESS,
      Permission.AI_ASSESSMENT_ACCESS,
      Permission.PROMPT_TUTOR_ACCESS,

      // Basic Access
      Permission.VIEW_OWN_PROFILE,
      Permission.EDIT_OWN_PROFILE,
      Permission.VIEW_OWN_GROUPS
    ];
  }

  // Check country-based resource access
  static canAccessCountryResources(user, country) {
    if (!user) return false;

    // God mode always has access
    if (this.hasGodMode(user)) return true;

    // Users can only access resources for their own country
    return user.country === country;
  }

  // Admin panel access - SUPER_ADMIN and OWNER only
  static canAccessAdminPanel(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // User management permissions - SUPER_ADMIN and OWNER only
  static canManageUsers(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Can add/remove users from groups - SUPER_ADMIN and OWNER only
  static canManageGroupMembers(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Can create new groups - SUPER_ADMIN and OWNER only
  static canCreateGroups(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Can edit user details (name, role, groups) - SUPER_ADMIN and OWNER only
  static canEditUserDetails(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Can delete users - SUPER_ADMIN and OWNER only
  static canDeleteUsers(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Group management permissions
  static canCreateGroups(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Can delete groups - SUPER_ADMIN and OWNER only
  static canDeleteGroups(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  // Can edit group details - SUPER_ADMIN and OWNER only
  static canEditGroups(user) {
    return this.hasGodMode(user) ||
           user?.role === 'SUPER_ADMIN';
  }

  static canManageGroup(user, groupId) {
    if (!user) return false;

    // God mode always has access
    if (this.hasGodMode(user)) return true;

    // SUPER_ADMIN can manage all groups
    if (user.role === 'SUPER_ADMIN') return true;

    // MANAGER can manage groups they belong to
    if (user.role === 'MANAGER') {
      return user.managedGroups?.some(g => g.id === groupId) ||
             user.groupMemberships?.some(m => m.groupId === groupId && m.status === 'ACTIVE');
    }

    return false;
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
    return user.role === UserRole.SUPER_ADMIN || user.role === UserRole.OWNER;
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

// Permission system for AI Workbench React

export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  TEAM_MANAGER: 'TEAM_MANAGER',
  MEMBER: 'MEMBER'
};

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export const Permission = {
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
  ANALYTICS_ACCESS: 'ANALYTICS_ACCESS',

  // AI Features
  AI_TRAINING_ACCESS: 'AI_TRAINING_ACCESS',
  AI_ASSESSMENT_ACCESS: 'AI_ASSESSMENT_ACCESS',
  PROMPT_TUTOR_ACCESS: 'PROMPT_TUTOR_ACCESS'
};

// Owner email configuration - Updated for jmadrino@boldbusiness.com
export const OWNER_EMAIL = 'jmadrino@boldbusiness.com';

export function isOwnerEmail(email) {
  return email && email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

// God mode check - ensures owner email always has access
export function hasGodMode(user) {
  return user ? isOwnerEmail(user.email) : false;
}

export function hasPermission(user, permission, resource) {
  if (!user || user.status !== UserStatus.ACTIVE) return false;

  // God mode for owner email - ALWAYS has all permissions
  if (isOwnerEmail(user.email)) return true;

  // Owner role has all permissions
  if (user.role === UserRole.OWNER) return true;

  // Check direct user permissions
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.some(p => {
      if (typeof p === 'string') {
        return p === permission;
      }
      return p.permission === permission &&
             (!resource || p.resource === resource || p.resource === '*');
    });
  }

  return false;
}

export function canAccessAdminPanel(user) {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  return user.role === UserRole.OWNER ||
         user.role === UserRole.ADMIN ||
         hasPermission(user, Permission.ADMIN_PANEL_ACCESS);
}

export function canManageUsers(user) {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  return user.role === UserRole.OWNER ||
         user.role === UserRole.ADMIN ||
         hasPermission(user, Permission.MANAGE_USERS);
}

export function canCreateGroups(user) {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  return user.role === UserRole.OWNER ||
         user.role === UserRole.ADMIN ||
         user.role === UserRole.TEAM_MANAGER ||
         hasPermission(user, Permission.CREATE_GROUP);
}

export function isOwner(user) {
  return user?.role === UserRole.OWNER && user?.status === UserStatus.ACTIVE;
}

export function isAdmin(user) {
  return (user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && 
         user?.status === UserStatus.ACTIVE;
}

export function isTeamManager(user) {
  return (user?.role === UserRole.TEAM_MANAGER || 
          user?.role === UserRole.ADMIN || 
          user?.role === UserRole.OWNER) && 
         user?.status === UserStatus.ACTIVE;
}

// Enhanced user creation function that assigns proper roles based on email
export function createUserWithRole(userData) {
  const baseUser = {
    id: userData.id || 'user-' + Date.now(),
    email: userData.email,
    name: userData.name || 'User',
    image: userData.image || null, // Don't default to robot image, let components handle fallback
    status: UserStatus.ACTIVE,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    loginCount: 1
  };

  // Assign role based on email
  if (isOwnerEmail(userData.email)) {
    return {
      ...baseUser,
      role: UserRole.OWNER,
      permissions: [
        Permission.ADMIN_PANEL_ACCESS,
        Permission.MANAGE_USERS,
        Permission.SYSTEM_SETTINGS,
        Permission.ANALYTICS_ACCESS,
        Permission.CREATE_GROUP,
        Permission.DELETE_GROUP,
        Permission.EDIT_GROUP,
        Permission.MANAGE_GROUP_MEMBERS,
        Permission.VIEW_ALL_GROUPS,
        Permission.VIEW_USER_PROFILES,
        Permission.ASSIGN_ROLES,
        Permission.VIEW_HR_CONTENT,
        Permission.VIEW_IT_CONTENT,
        Permission.VIEW_FINANCE_CONTENT,
        Permission.VIEW_MARKETING_CONTENT,
        Permission.VIEW_ADMIN_CONTENT,
        Permission.AI_TRAINING_ACCESS,
        Permission.AI_ASSESSMENT_ACCESS,
        Permission.PROMPT_TUTOR_ACCESS
      ]
    };
  }

  // Default role for other users
  return {
    ...baseUser,
    role: UserRole.MEMBER,
    permissions: [
      Permission.AI_ASSESSMENT_ACCESS,
      Permission.PROMPT_TUTOR_ACCESS
    ]
  };
}

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [UserRole.OWNER]: [
    // Owners have all permissions
    Permission.ADMIN_PANEL_ACCESS,
    Permission.MANAGE_USERS,
    Permission.SYSTEM_SETTINGS,
    Permission.ANALYTICS_ACCESS,
    Permission.CREATE_GROUP,
    Permission.DELETE_GROUP,
    Permission.EDIT_GROUP,
    Permission.MANAGE_GROUP_MEMBERS,
    Permission.VIEW_ALL_GROUPS,
    Permission.VIEW_USER_PROFILES,
    Permission.ASSIGN_ROLES,
    Permission.VIEW_HR_CONTENT,
    Permission.VIEW_IT_CONTENT,
    Permission.VIEW_FINANCE_CONTENT,
    Permission.VIEW_MARKETING_CONTENT,
    Permission.VIEW_ADMIN_CONTENT,
    Permission.AI_TRAINING_ACCESS,
    Permission.AI_ASSESSMENT_ACCESS,
    Permission.PROMPT_TUTOR_ACCESS
  ],
  
  [UserRole.ADMIN]: [
    // Admins have most permissions except system-level changes
    Permission.ADMIN_PANEL_ACCESS,
    Permission.MANAGE_USERS,
    Permission.ANALYTICS_ACCESS,
    Permission.CREATE_GROUP,
    Permission.EDIT_GROUP,
    Permission.MANAGE_GROUP_MEMBERS,
    Permission.VIEW_ALL_GROUPS,
    Permission.VIEW_USER_PROFILES,
    Permission.VIEW_HR_CONTENT,
    Permission.VIEW_IT_CONTENT,
    Permission.VIEW_FINANCE_CONTENT,
    Permission.VIEW_MARKETING_CONTENT,
    Permission.VIEW_ADMIN_CONTENT,
    Permission.AI_TRAINING_ACCESS,
    Permission.AI_ASSESSMENT_ACCESS,
    Permission.PROMPT_TUTOR_ACCESS
  ],
  
  [UserRole.TEAM_MANAGER]: [
    // Team managers can manage their team and view team analytics
    Permission.CREATE_GROUP,
    Permission.EDIT_GROUP,
    Permission.MANAGE_GROUP_MEMBERS,
    Permission.VIEW_USER_PROFILES,
    Permission.AI_ASSESSMENT_ACCESS,
    Permission.PROMPT_TUTOR_ACCESS
  ],
  
  [UserRole.MEMBER]: [
    // Members have basic permissions
    Permission.AI_ASSESSMENT_ACCESS,
    Permission.PROMPT_TUTOR_ACCESS
  ]
};

export function getUserPermissions(user) {
  if (!user) return [];
  
  // God mode for owner email
  if (hasGodMode(user)) return ROLE_PERMISSIONS[UserRole.OWNER];
  
  return ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS[UserRole.MEMBER];
}

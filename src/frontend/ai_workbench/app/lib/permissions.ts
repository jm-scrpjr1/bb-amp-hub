// Permission system for AI Workbench

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  TEAM_MANAGER = 'TEAM_MANAGER',
  MEMBER = 'MEMBER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface UserWithPermissions {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  status: UserStatus;
  teamId?: string;
  team?: {
    id: string;
    name: string;
    managerId?: string;
  };
  managedTeams?: Array<{
    id: string;
    name: string;
  }>;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  loginCount: number;
  permissions: Array<{
    permission: string;
    resource?: string;
  }>;
}

// Permission constants
export const PERMISSIONS = {
  // System administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_ANALYTICS: 'system:analytics',
  SYSTEM_SETTINGS: 'system:settings',
  
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Team management
  TEAM_CREATE: 'team:create',
  TEAM_READ: 'team:read',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE_MEMBERS: 'team:manage_members',
  
  // Content management
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  
  // Analytics
  ANALYTICS_VIEW_ALL: 'analytics:view_all',
  ANALYTICS_VIEW_TEAM: 'analytics:view_team',
  ANALYTICS_VIEW_OWN: 'analytics:view_own',
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.OWNER]: [
    // Owners have all permissions
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_ANALYTICS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.TEAM_CREATE,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE,
    PERMISSIONS.TEAM_DELETE,
    PERMISSIONS.TEAM_MANAGE_MEMBERS,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],
  
  [UserRole.ADMIN]: [
    // Admins have most permissions except system-level changes
    PERMISSIONS.SYSTEM_ANALYTICS,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.TEAM_CREATE,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE,
    PERMISSIONS.TEAM_DELETE,
    PERMISSIONS.TEAM_MANAGE_MEMBERS,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],
  
  [UserRole.TEAM_MANAGER]: [
    // Team managers can manage their team and view team analytics
    PERMISSIONS.USER_READ,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE,
    PERMISSIONS.TEAM_MANAGE_MEMBERS,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],
  
  [UserRole.MEMBER]: [
    // Members have basic permissions
    PERMISSIONS.USER_READ,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],
};

// Permission checking functions
export function hasPermission(
  user: UserWithPermissions | null,
  permission: string,
  resource?: string
): boolean {
  if (!user || user.status !== UserStatus.ACTIVE) {
    return false;
  }

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Check custom permissions
  return user.permissions.some(
    p => p.permission === permission && (!resource || p.resource === resource)
  );
}

export function hasAnyPermission(
  user: UserWithPermissions | null,
  permissions: string[]
): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

export function hasAllPermissions(
  user: UserWithPermissions | null,
  permissions: string[]
): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

export function isOwner(user: UserWithPermissions | null): boolean {
  return user?.role === UserRole.OWNER && user?.status === UserStatus.ACTIVE;
}

export function isAdmin(user: UserWithPermissions | null): boolean {
  return (user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && 
         user?.status === UserStatus.ACTIVE;
}

export function isTeamManager(user: UserWithPermissions | null): boolean {
  return (user?.role === UserRole.TEAM_MANAGER || 
          user?.role === UserRole.ADMIN || 
          user?.role === UserRole.OWNER) && 
         user?.status === UserStatus.ACTIVE;
}

export function canAccessAdminPanel(user: UserWithPermissions | null): boolean {
  return hasAnyPermission(user, [
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_ANALYTICS,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.ANALYTICS_VIEW_ALL
  ]);
}

export function canManageUsers(user: UserWithPermissions | null): boolean {
  return hasAnyPermission(user, [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ROLES
  ]);
}

export function canViewAnalytics(user: UserWithPermissions | null): boolean {
  return hasAnyPermission(user, [
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_OWN
  ]);
}

// Owner email configuration
export const OWNER_EMAIL = 'jlope@boldbusiness.com';

export function isOwnerEmail(email: string): boolean {
  return email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

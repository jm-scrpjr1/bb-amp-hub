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

export enum GroupType {
  DEPARTMENT = 'DEPARTMENT',
  PROJECT = 'PROJECT',
  FUNCTIONAL = 'FUNCTIONAL',
  TEMPORARY = 'TEMPORARY',
  CUSTOM = 'CUSTOM'
}

export enum GroupVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'RESTRICTED'
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED'
}

export enum Permission {
  // Group Management
  CREATE_GROUP = 'CREATE_GROUP',
  DELETE_GROUP = 'DELETE_GROUP',
  EDIT_GROUP = 'EDIT_GROUP',
  MANAGE_GROUP_MEMBERS = 'MANAGE_GROUP_MEMBERS',
  VIEW_ALL_GROUPS = 'VIEW_ALL_GROUPS',

  // User Management
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_USER_PROFILES = 'VIEW_USER_PROFILES',
  ASSIGN_ROLES = 'ASSIGN_ROLES',

  // Content Access
  VIEW_HR_CONTENT = 'VIEW_HR_CONTENT',
  VIEW_IT_CONTENT = 'VIEW_IT_CONTENT',
  VIEW_FINANCE_CONTENT = 'VIEW_FINANCE_CONTENT',
  VIEW_MARKETING_CONTENT = 'VIEW_MARKETING_CONTENT',
  VIEW_ADMIN_CONTENT = 'VIEW_ADMIN_CONTENT',

  // System Administration
  ADMIN_PANEL_ACCESS = 'ADMIN_PANEL_ACCESS',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
  ANALYTICS_ACCESS = 'ANALYTICS_ACCESS',

  // AI Features
  AI_TRAINING_ACCESS = 'AI_TRAINING_ACCESS',
  AI_ASSESSMENT_ACCESS = 'AI_ASSESSMENT_ACCESS',
  PROMPT_TUTOR_ACCESS = 'PROMPT_TUTOR_ACCESS'
}

export interface GroupMembershipInfo {
  id: string;
  groupId: string;
  group: {
    id: string;
    name: string;
    type: GroupType;
    visibility: GroupVisibility;
  };
  status: MembershipStatus;
  role?: string;
  joinedAt?: Date;
  canInvite: boolean;
  canRemove: boolean;
  canEdit: boolean;
}

export interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  visibility: GroupVisibility;
  managerId?: string;
  manager?: {
    id: string;
    name?: string;
    email: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    name?: string;
    email: string;
  };
  isActive: boolean;
  maxMembers?: number;
  autoApprove: boolean;
  tags: string[];
  metadata?: any;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  status: UserStatus;

  // Legacy team support
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

  // New group system
  groupMemberships?: GroupMembershipInfo[];
  managedGroups?: GroupInfo[];

  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  loginCount: number;
  permissions: Array<{
    permission: Permission;
    resource?: string;
  }>;
}

// Permission checking functions
export const OWNER_EMAILS = ['jlope@boldbusiness.com', 'jmadrino@boldbusiness.com'];

export function isOwnerEmail(email: string): boolean {
  return OWNER_EMAILS.some(ownerEmail =>
    email.toLowerCase() === ownerEmail.toLowerCase()
  );
}

// God mode check - ensures owner email always has access
export function hasGodMode(user: UserWithPermissions | null): boolean {
  return user ? isOwnerEmail(user.email) : false;
}

export function hasPermission(user: UserWithPermissions | null, permission: Permission, resource?: string): boolean {
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

export function canAccessAdminPanel(user: UserWithPermissions | null): boolean {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  return user.role === UserRole.OWNER ||
         user.role === UserRole.ADMIN ||
         hasPermission(user, Permission.ADMIN_PANEL_ACCESS);
}

export function canManageUsers(user: UserWithPermissions | null): boolean {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  return user.role === UserRole.OWNER ||
         user.role === UserRole.ADMIN ||
         hasPermission(user, Permission.MANAGE_USERS);
}

export function canCreateGroups(user: UserWithPermissions | null): boolean {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  return user.role === UserRole.OWNER ||
         user.role === UserRole.SUPER_ADMIN ||
         user.role === UserRole.ADMIN ||
         user.role === UserRole.MANAGER ||
         hasPermission(user, Permission.CREATE_GROUP);
}

export function canManageGroup(user: UserWithPermissions | null, groupId: string): boolean {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  // Owner, Super Admin, and Admin can manage all groups
  if (user.role === UserRole.OWNER ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN) return true;

  // Check if user is the group manager
  const managedGroup = user.managedGroups?.find(g => g.id === groupId);
  if (managedGroup) return true;

  // Check if user has group management permission
  return hasPermission(user, Permission.MANAGE_GROUP_MEMBERS, groupId);
}

export function canViewGroup(user: UserWithPermissions | null, group: GroupInfo): boolean {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  // Owner, Super Admin, and Admin can view all groups
  if (user.role === UserRole.OWNER ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN) return true;

  // Public groups are visible to all
  if (group.visibility === GroupVisibility.PUBLIC) return true;

  // Check if user is a member
  const membership = user.groupMemberships?.find(m => m.groupId === group.id);
  if (membership && membership.status === MembershipStatus.ACTIVE) return true;

  // Check if user is the manager
  if (group.managerId === user.id) return true;

  return false;
}

export function canInviteToGroup(user: UserWithPermissions | null, groupId: string): boolean {
  if (!user) return false;

  // God mode - owner email always has access
  if (hasGodMode(user)) return true;

  // Owner, Super Admin, and Admin can invite to any group
  if (user.role === UserRole.OWNER ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.ADMIN) return true;

  // Check if user is the group manager
  const managedGroup = user.managedGroups?.find(g => g.id === groupId);
  if (managedGroup) return true;

  // Check if user has invite permission in the group
  const membership = user.groupMemberships?.find(m => m.groupId === groupId);
  return membership?.canInvite || false;
}

export function getAccessibleContent(user: UserWithPermissions | null): Permission[] {
  if (!user) return [];

  const accessibleContent: Permission[] = [];

  // Check each content permission
  if (hasPermission(user, Permission.VIEW_HR_CONTENT)) {
    accessibleContent.push(Permission.VIEW_HR_CONTENT);
  }
  if (hasPermission(user, Permission.VIEW_IT_CONTENT)) {
    accessibleContent.push(Permission.VIEW_IT_CONTENT);
  }
  if (hasPermission(user, Permission.VIEW_FINANCE_CONTENT)) {
    accessibleContent.push(Permission.VIEW_FINANCE_CONTENT);
  }
  if (hasPermission(user, Permission.VIEW_MARKETING_CONTENT)) {
    accessibleContent.push(Permission.VIEW_MARKETING_CONTENT);
  }
  if (hasPermission(user, Permission.VIEW_ADMIN_CONTENT)) {
    accessibleContent.push(Permission.VIEW_ADMIN_CONTENT);
  }

  return accessibleContent;
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

// Legacy permission checking function for string-based permissions
export function hasLegacyPermission(
  user: UserWithPermissions | null,
  permission: string,
  resource?: string
): boolean {
  if (!user || user.status !== UserStatus.ACTIVE) {
    return false;
  }

  // God mode for owner email - ALWAYS has all permissions
  if (isOwnerEmail(user.email)) return true;

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
  return permissions.some(permission => hasLegacyPermission(user, permission));
}

export function hasAllPermissions(
  user: UserWithPermissions | null,
  permissions: string[]
): boolean {
  return permissions.every(permission => hasLegacyPermission(user, permission));
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

// Legacy admin panel access function (replaced by enhanced version above)
export function canAccessAdminPanelLegacy(user: UserWithPermissions | null): boolean {
  return hasAnyPermission(user, [
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_ANALYTICS,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.ANALYTICS_VIEW_ALL
  ]);
}

// Legacy user management function (replaced by enhanced version above)
export function canManageUsersLegacy(user: UserWithPermissions | null): boolean {
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

// Owner email configuration (duplicate removed - using the one above)

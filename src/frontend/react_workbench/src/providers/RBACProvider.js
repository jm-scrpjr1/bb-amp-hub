import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import {
  hasPermission,
  canAccessAdminPanel,
  canManageUsers,
  canCreateGroups,
  canManageGroup,
  canViewGroup,
  canInviteToGroup,
  isOwner,
  isAdmin,
  isTeamManager,
  hasGodMode,
  getUserPermissions,
  Permission,
  UserRole,
  OWNER_EMAIL
} from '../lib/permissions';

const RBACContext = createContext(null);

export const RBACProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    async function fetchUserPermissions() {
      if (!user?.email) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        // For now, we'll use mock permissions based on user role
        // In a real app, this would fetch from the API
        const mockPermissions = getMockPermissions(user);
        setPermissions(mockPermissions);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPermissions();
  }, [user]);

  const getMockPermissions = (user) => {
    // Use the new permissions system
    return getUserPermissions(user);
  };

  const hasPermissionCheck = (permission, resource = null) => {
    return hasPermission(user, permission, resource);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const isOwnerCheck = () => {
    return isOwner(user);
  };

  const isAdminCheck = () => {
    return isAdmin(user);
  };

  const isTeamManagerCheck = () => {
    return isTeamManager(user);
  };

  const isMember = () => {
    return !!user;
  };

  const canCreateGroupsCheck = () => {
    return canCreateGroups(user);
  };

  const canManageGroupCheck = (groupId) => {
    return canManageGroup(user, groupId);
  };

  const canViewGroupCheck = (group) => {
    return canViewGroup(user, group);
  };

  const canInviteToGroupCheck = (groupId) => {
    return canInviteToGroup(user, groupId);
  };

  const canAccessAdminPanelCheck = () => {
    return canAccessAdminPanel(user);
  };

  const getAccessibleContent = () => {
    return permissions.filter(p => p.startsWith('VIEW_'));
  };

  const rbacContext = {
    user,
    permissions,
    loading,
    hasPermission: hasPermissionCheck,
    hasRole,
    isOwner: isOwnerCheck,
    isAdmin: isAdminCheck,
    isTeamManager: isTeamManagerCheck,
    isMember,
    canCreateGroups: canCreateGroupsCheck,
    canManageGroup: canManageGroupCheck,
    canViewGroup: canViewGroupCheck,
    canInviteToGroup: canInviteToGroupCheck,
    canAccessAdminPanel: canAccessAdminPanelCheck,
    canManageUsers: () => canManageUsers(user),
    hasGodMode: () => hasGodMode(user),
    getAccessibleContent,
    // Add new permission constants
    Permission,
    UserRole,
    OWNER_EMAIL
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RBACContext.Provider value={rbacContext}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

// Higher-order component for protecting components
export const withRBAC = (Component, options = {}) => {
  return function RBACProtectedComponent(props) {
    const rbac = useRBAC();
    const FallbackComponent = options.fallback || AccessDenied;

    // Check required role
    if (options.requiredRole && rbac.user?.role !== options.requiredRole) {
      return <FallbackComponent />;
    }

    // Check allowed roles
    if (options.allowedRoles && rbac.user && !options.allowedRoles.includes(rbac.user.role)) {
      return <FallbackComponent />;
    }

    // Check required permission
    if (options.requiredPermission && !rbac.hasPermission(options.requiredPermission)) {
      return <FallbackComponent />;
    }

    // Custom check
    if (options.customCheck && !options.customCheck(rbac)) {
      return <FallbackComponent />;
    }

    return <Component {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const PermissionGate = ({
  children,
  permission,
  role,
  allowedRoles,
  fallback = null,
  customCheck
}) => {
  const rbac = useRBAC();

  // Check required role
  if (role && rbac.user?.role !== role) {
    return <>{fallback}</>;
  }

  // Check allowed roles
  if (allowedRoles && rbac.user && !allowedRoles.includes(rbac.user.role)) {
    return <>{fallback}</>;
  }

  // Check required permission
  if (permission && !rbac.hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Custom check
  if (customCheck && !customCheck(rbac)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Default access denied component
const AccessDenied = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this content.</p>
      </div>
    </div>
  );
};

// Hook for checking specific permissions
export const usePermission = (permission, resource = null) => {
  const rbac = useRBAC();
  return rbac.hasPermission(permission, resource);
};

// Hook for checking roles
export const useRole = () => {
  const rbac = useRBAC();
  return {
    isOwner: rbac.isOwner(),
    isAdmin: rbac.isAdmin(),
    isTeamManager: rbac.isTeamManager(),
    isMember: rbac.isMember(),
    role: rbac.user?.role,
  };
};

// Hook for group-related permissions
export const useGroupPermissions = () => {
  const rbac = useRBAC();
  return {
    canCreateGroups: rbac.canCreateGroups(),
    canManageGroup: (groupId) => rbac.canManageGroup(groupId),
    canViewGroup: (group) => rbac.canViewGroup(group),
    canInviteToGroup: (groupId) => rbac.canInviteToGroup(groupId),
  };
};

// Hook for content access
export const useContentAccess = () => {
  const rbac = useRBAC();
  const accessibleContent = rbac.getAccessibleContent();
  
  return {
    canViewHR: accessibleContent.includes('VIEW_HR_CONTENT'),
    canViewIT: accessibleContent.includes('VIEW_IT_CONTENT'),
    canViewFinance: accessibleContent.includes('VIEW_FINANCE_CONTENT'),
    canViewMarketing: accessibleContent.includes('VIEW_MARKETING_CONTENT'),
    canViewAdmin: accessibleContent.includes('VIEW_ADMIN_CONTENT'),
    accessibleContent,
  };
};

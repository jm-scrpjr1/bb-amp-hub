'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserWithPermissions } from '@/lib/permissions';
import { RBACContext, createRBACContext } from '@/lib/rbac';

const RBACContextProvider = createContext<RBACContext | null>(null);

interface RBACProviderProps {
  children: React.ReactNode;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserWithPermissions() {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated' || !session?.user?.email) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserWithPermissions();
  }, [session, status]);

  const rbacContext = createRBACContext(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RBACContextProvider.Provider value={rbacContext}>
      {children}
    </RBACContextProvider.Provider>
  );
}

export function useRBAC(): RBACContext {
  const context = useContext(RBACContextProvider);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}

// Higher-order component for protecting components
export function withRBAC<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requiredPermission?: string;
    requiredRole?: string;
    allowedRoles?: string[];
    fallback?: React.ComponentType;
    customCheck?: (rbac: RBACContext) => boolean;
  }
) {
  return function RBACProtectedComponent(props: T) {
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
    if (options.requiredPermission && !rbac.hasPermission(options.requiredPermission as any)) {
      return <FallbackComponent />;
    }

    // Custom check
    if (options.customCheck && !options.customCheck(rbac)) {
      return <FallbackComponent />;
    }

    return <Component {...props} />;
  };
}

// Component for conditional rendering based on permissions
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
  customCheck?: (rbac: RBACContext) => boolean;
}

export function PermissionGate({
  children,
  permission,
  role,
  allowedRoles,
  fallback = null,
  customCheck
}: PermissionGateProps) {
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
  if (permission && !rbac.hasPermission(permission as any)) {
    return <>{fallback}</>;
  }

  // Custom check
  if (customCheck && !customCheck(rbac)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Default access denied component
function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this content.</p>
      </div>
    </div>
  );
}

// Hook for checking specific permissions
export function usePermission(permission: string, resource?: string) {
  const rbac = useRBAC();
  return rbac.hasPermission(permission as any, resource);
}

// Hook for checking roles
export function useRole() {
  const rbac = useRBAC();
  return {
    isOwner: rbac.isOwner(),
    isAdmin: rbac.isAdmin(),
    isTeamManager: rbac.isTeamManager(),
    isMember: rbac.isMember(),
    role: rbac.user?.role,
  };
}

// Hook for group-related permissions
export function useGroupPermissions() {
  const rbac = useRBAC();
  return {
    canCreateGroups: rbac.canCreateGroups(),
    canManageGroup: (groupId: string) => rbac.canManageGroup(groupId),
    canViewGroup: (groupId: string) => rbac.canViewGroup(groupId),
    canInviteToGroup: (groupId: string) => rbac.canInviteToGroup(groupId),
  };
}

// Hook for content access
export function useContentAccess() {
  const rbac = useRBAC();
  const accessibleContent = rbac.getAccessibleContent();
  
  return {
    canViewHR: accessibleContent.includes('VIEW_HR_CONTENT' as any),
    canViewIT: accessibleContent.includes('VIEW_IT_CONTENT' as any),
    canViewFinance: accessibleContent.includes('VIEW_FINANCE_CONTENT' as any),
    canViewMarketing: accessibleContent.includes('VIEW_MARKETING_CONTENT' as any),
    canViewAdmin: accessibleContent.includes('VIEW_ADMIN_CONTENT' as any),
    accessibleContent,
  };
}

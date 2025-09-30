import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserService } from '@/lib/user-service';
import { PermissionManager } from '@/lib/rbac';
import { canManageUsers, Permission, UserRole } from '@/lib/permissions';

// GET /api/permissions - Get available permissions and user permissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If requesting another user's permissions, check if current user can manage users
    if (userId && userId !== user.id && !canManageUsers(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get target user (or current user if no userId specified)
    const targetUser = userId ? await UserService.getUserByEmail(userId) : user;
    
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Get all available permissions
    const allPermissions = Object.values(Permission);
    
    // Get default permissions for each role
    const defaultPermissionsByRole = {
      [UserRole.OWNER]: await PermissionManager.getDefaultPermissionsByRole(UserRole.OWNER),
      [UserRole.ADMIN]: await PermissionManager.getDefaultPermissionsByRole(UserRole.ADMIN),
      [UserRole.TEAM_MANAGER]: await PermissionManager.getDefaultPermissionsByRole(UserRole.TEAM_MANAGER),
      [UserRole.MEMBER]: await PermissionManager.getDefaultPermissionsByRole(UserRole.MEMBER),
    };

    return NextResponse.json({
      allPermissions,
      defaultPermissionsByRole,
      userPermissions: targetUser.permissions,
      userRole: targetUser.role,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/permissions - Assign permission to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can manage permissions
    if (!canManageUsers(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, permission, resource } = body;

    if (!userId || !permission) {
      return NextResponse.json(
        { error: 'User ID and permission are required' },
        { status: 400 }
      );
    }

    // Validate permission exists
    if (!Object.values(Permission).includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission' },
        { status: 400 }
      );
    }

    const success = await PermissionManager.assignPermissionToUser(
      userId,
      permission,
      resource
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to assign permission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error assigning permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/permissions - Revoke permission from user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can manage permissions
    if (!canManageUsers(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const permission = searchParams.get('permission');
    const resource = searchParams.get('resource');

    if (!userId || !permission) {
      return NextResponse.json(
        { error: 'User ID and permission are required' },
        { status: 400 }
      );
    }

    const success = await PermissionManager.revokePermissionFromUser(
      userId,
      permission as Permission,
      resource || undefined
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to revoke permission' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking permission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

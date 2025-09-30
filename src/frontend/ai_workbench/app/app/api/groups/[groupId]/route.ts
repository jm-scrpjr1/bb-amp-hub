import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserService } from '@/lib/user-service';
import { GroupService } from '@/lib/group-service';
import { canViewGroup, canManageGroup } from '@/lib/permissions';
import { RBACLogger } from '@/lib/rbac';

// GET /api/groups/[groupId] - Get specific group details
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const group = await GroupService.getGroupById(params.groupId);
    
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user can view this group
    if (!canViewGroup(user, group)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get group members if user can view them
    let members = [];
    if (canViewGroup(user, group)) {
      members = await GroupService.getGroupMembers(params.groupId);
    }

    return NextResponse.json({
      ...group,
      members,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[groupId] - Update group
export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can manage this group
    if (!canManageGroup(user, params.groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      visibility,
      maxMembers,
      autoApprove,
      tags,
      metadata,
      isActive
    } = body;

    const updatedGroup = await GroupService.updateGroup(params.groupId, {
      name,
      description,
      type,
      visibility,
      maxMembers,
      autoApprove,
      tags,
      metadata,
      isActive,
    });

    if (!updatedGroup) {
      return NextResponse.json(
        { error: 'Failed to update group' },
        { status: 500 }
      );
    }

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'UPDATE_GROUP',
      params.groupId,
      { changes: body },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[groupId] - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can manage this group
    if (!canManageGroup(user, params.groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const success = await GroupService.deleteGroup(params.groupId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete group' },
        { status: 500 }
      );
    }

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'DELETE_GROUP',
      params.groupId,
      {},
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

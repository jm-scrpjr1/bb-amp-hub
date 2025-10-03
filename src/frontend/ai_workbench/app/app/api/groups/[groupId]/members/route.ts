import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserService } from '@/lib/user-service';
import { GroupService } from '@/lib/group-service';
import { canManageGroup, canInviteToGroup } from '@/lib/permissions';
import { RBACLogger } from '@/lib/rbac';

// GET /api/groups/[groupId]/members - Get group members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
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

    // Check if user can view group members
    if (!canManageGroup(user, params.groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const members = await GroupService.getGroupMembers(params.groupId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[groupId]/members - Add member to group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
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

    // Check if user can invite to this group
    if (!canInviteToGroup(user, params.groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, canInvite, canRemove, canEdit } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await UserService.getUserByEmail(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const membership = await GroupService.addMember(params.groupId, {
      userId: targetUser.id,
      role,
      canInvite: canInvite || false,
      canRemove: canRemove || false,
      canEdit: canEdit || false,
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Failed to add member to group' },
        { status: 500 }
      );
    }

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'ADD_MEMBER',
      params.groupId,
      { targetUserId: targetUser.id, role },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Error adding member to group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

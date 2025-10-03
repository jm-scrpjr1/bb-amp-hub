import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserService } from '@/lib/user-service';
import { GroupService } from '@/lib/group-service';
import { canManageGroup } from '@/lib/permissions';
import { RBACLogger } from '@/lib/rbac';
import { prisma } from '@/lib/db';

// DELETE /api/groups/[groupId]/members/[userId] - Remove member from group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
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

    const { groupId, userId } = await params;

    // Check if user can manage this group
    if (!canManageGroup(user, groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const success = await GroupService.removeMember(groupId, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove member from group' },
        { status: 500 }
      );
    }

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'REMOVE_MEMBER',
      groupId,
      { targetUserId: userId },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member from group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[groupId]/members/[userId] - Update member permissions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
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

    const { groupId, userId } = await params;

    // Check if user can manage this group
    if (!canManageGroup(user, groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { role, canInvite, canRemove, canEdit } = body;

    // Update member permissions
    // Note: Using direct database access since GroupService doesn't have updateMember method
    const updatedMembership = await prisma.$executeRaw`
      UPDATE group_memberships
      SET role = ${role}, can_invite = ${canInvite}, can_remove = ${canRemove}, can_edit = ${canEdit}, updated_at = NOW()
      WHERE user_id = ${userId} AND group_id = ${groupId}
    `;

    // Get the updated membership for response
    const membership = await prisma.$queryRaw`
      SELECT gm.*, u.name as user_name, u.email as user_email, u.image as user_image,
             g.name as group_name, g.type as group_type, g.visibility as group_visibility
      FROM group_memberships gm
      JOIN users u ON gm.user_id = u.id
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.user_id = ${userId} AND gm.group_id = ${groupId}
    `;

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'UPDATE_MEMBER_PERMISSIONS',
      groupId,
      { targetUserId: userId, changes: body },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ membership, success: true });
  } catch (error) {
    console.error('Error updating member permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

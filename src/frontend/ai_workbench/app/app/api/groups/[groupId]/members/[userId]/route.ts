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

    // Check if user can manage this group
    if (!canManageGroup(user, params.groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const success = await GroupService.removeMember(params.groupId, params.userId);

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
      params.groupId,
      { targetUserId: params.userId },
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

    // Check if user can manage this group
    if (!canManageGroup(user, params.groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { role, canInvite, canRemove, canEdit } = body;

    // Update member permissions
    const updatedMembership = await prisma.groupMembership.update({
      where: {
        userId_groupId: {
          userId: params.userId,
          groupId: params.groupId,
        }
      },
      data: {
        role,
        canInvite,
        canRemove,
        canEdit,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            type: true,
            visibility: true,
          }
        }
      }
    });

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'UPDATE_MEMBER_PERMISSIONS',
      params.groupId,
      { targetUserId: params.userId, changes: body },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error('Error updating member permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

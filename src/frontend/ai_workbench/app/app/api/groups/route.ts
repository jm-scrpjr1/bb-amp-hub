import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserService } from '@/lib/user-service';
import { GroupService } from '@/lib/group-service';
import { canCreateGroups, canViewGroup } from '@/lib/permissions';
import { RBACLogger } from '@/lib/rbac';

// GET /api/groups - Get all groups with filtering
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
    const type = searchParams.get('type');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Get all groups
    const allGroups = await GroupService.getGroups({
      type: type as any,
      visibility: visibility as any,
      search: search || undefined,
      limit,
      offset,
    });

    // Filter groups based on user permissions
    const accessibleGroups = [];
    for (const group of allGroups) {
      if (canViewGroup(user, group)) {
        accessibleGroups.push(group);
      }
    }

    return NextResponse.json({
      groups: accessibleGroups,
      total: accessibleGroups.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
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

    // Check if user can create groups
    if (!canCreateGroups(user)) {
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
      metadata
    } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const group = await GroupService.createGroup(user.id, {
      name,
      description,
      type,
      visibility,
      maxMembers,
      autoApprove,
      tags,
      metadata,
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      );
    }

    // Log the action
    await RBACLogger.logAction(
      user.id,
      'CREATE_GROUP',
      group.id,
      { groupName: group.name, groupType: group.type },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

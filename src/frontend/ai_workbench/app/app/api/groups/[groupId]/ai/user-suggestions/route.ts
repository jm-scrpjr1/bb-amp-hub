import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserService } from '@/lib/user-service';
import { AIGroupService } from '@/lib/ai-group-service';
import { canInviteToGroup, hasGodMode } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with permissions
    const user = await UserService.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    // Check if user can invite to this group (or has God mode)
    if (!hasGodMode(user) && !canInviteToGroup(user, groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get AI-powered user assignment suggestions
    const suggestions = await AIGroupService.suggestUserAssignments(groupId, searchTerm || undefined);

    return NextResponse.json({
      success: true,
      suggestions,
      aiPowered: true,
      godMode: hasGodMode(user)
    });

  } catch (error) {
    console.error('Error getting user assignment suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get user suggestions' },
      { status: 500 }
    );
  }
}

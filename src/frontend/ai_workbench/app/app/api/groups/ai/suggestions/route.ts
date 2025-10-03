import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { AIGroupService } from '@/lib/ai-group-service';
import { hasGodMode } from '@/lib/permissions';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { groupName, description } = body;

    if (!groupName) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // Get AI-powered group creation suggestions
    const suggestions = await AIGroupService.getGroupCreationSuggestions(
      user,
      groupName,
      description
    );

    return NextResponse.json({
      success: true,
      suggestions,
      aiPowered: true,
      godMode: hasGodMode(user)
    });

  } catch (error) {
    console.error('Error getting group creation suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserService } from '@/lib/user-service';
import { AIGroupService } from '@/lib/ai-group-service';
import { hasGodMode } from '@/lib/permissions';

export async function GET(request: NextRequest) {
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

    // Get AI-powered group recommendations
    const recommendations = await AIGroupService.getGroupRecommendations(user);

    return NextResponse.json({
      success: true,
      recommendations,
      aiPowered: true,
      godMode: hasGodMode(user)
    });

  } catch (error) {
    console.error('Error getting group recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import { AIGroupService } from '@/lib/ai-group-service';
import { canManageGroup, hasGodMode } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
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

    const { groupId } = await params;

    // Check if user can manage this group (or has God mode)
    if (!hasGodMode(user) && !canManageGroup(user, groupId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get AI-powered group health analysis
    const healthAnalysis = await AIGroupService.analyzeGroupHealth(groupId);

    return NextResponse.json({
      success: true,
      analysis: healthAnalysis,
      aiPowered: true,
      godMode: hasGodMode(user)
    });

  } catch (error) {
    console.error('Error analyzing group health:', error);
    return NextResponse.json(
      { error: 'Failed to analyze group health' },
      { status: 500 }
    );
  }
}

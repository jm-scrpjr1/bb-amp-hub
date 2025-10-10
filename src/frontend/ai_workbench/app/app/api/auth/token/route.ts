import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create a JWT token for the React app
    const token = jwt.sign(
      {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
        status: session.user.status,
        permissions: session.user.permissions,
        teamId: session.user.teamId,
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      token,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
        status: session.user.status,
        permissions: session.user.permissions,
        teamId: session.user.teamId,
      }
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

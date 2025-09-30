import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'
import { canAccessAdminPanel, canManageUsers, isOwnerEmail } from '@/lib/permissions'

export default withAuth(
  async function middleware(req) {
    console.log('Middleware running for:', req.nextUrl.pathname)

    // Admin panel access control
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = req.nextauth.token

      if (!token?.email) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }

      // God mode: Owner email always has access
      const hasGodMode = isOwnerEmail(token.email)

      if (!hasGodMode) {
        // Get user with permissions
        const user = await UserService.getUserByEmail(token.email)

        // Check admin panel access
        if (req.nextUrl.pathname === '/admin' && !canAccessAdminPanel(user)) {
          return NextResponse.redirect(new URL('/', req.url))
        }

        // Check user management access
        if (req.nextUrl.pathname.startsWith('/admin/users') && !canManageUsers(user)) {
          return NextResponse.redirect(new URL('/admin', req.url))
        }

        // Check groups access
        if (req.nextUrl.pathname.startsWith('/groups') && !user) {
          return NextResponse.redirect(new URL('/', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Return true if the user is authorized to access the page
        // For now, we'll require authentication for all protected routes
        return !!token
      },
    },
  }
)

// Configure which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/signin (sign in page)
     * - auth/error (auth error page)
     * - / (homepage - make this public for now)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth/signin|auth/error|$).*)',
  ],
}

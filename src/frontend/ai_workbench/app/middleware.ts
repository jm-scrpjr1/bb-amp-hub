import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log('Middleware running for:', req.nextUrl.pathname)

    // You can add custom logic here, for example:
    // - Role-based access control
    // - Logging
    // - Custom redirects

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

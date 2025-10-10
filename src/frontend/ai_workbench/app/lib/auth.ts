import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { UserService } from '@/lib/user-service'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user info to session for use throughout the app
      if (session.user && token.sub) {
        session.user.id = token.sub

        // Get user with permissions from database
        if (session.user.email) {
          try {
            const dbUser = await UserService.getUserByEmail(session.user.email)
            if (dbUser) {
              session.user.role = dbUser.role
              session.user.status = dbUser.status
              session.user.permissions = dbUser.permissions || []
              session.user.teamId = dbUser.teamId
            } else {
              // Fallback for users not in database
              session.user.role = 'MEMBER'
              session.user.status = 'ACTIVE'
              session.user.permissions = []
              session.user.teamId = undefined
            }
          } catch (error) {
            console.error('Error fetching user from database:', error)
            // Fallback to default values
            session.user.role = 'MEMBER'
            session.user.status = 'ACTIVE'
            session.user.permissions = []
            session.user.teamId = undefined
          }
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Simple redirect - always go to success page after auth
      console.log('NextAuth redirect:', { url, baseUrl })
      return '/auth/success'
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }

      // Store user info in token
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      return token
    },
    async signIn({ user }) {
      try {
        // Only allow boldbusiness.com accounts
        if (user.email && !user.email.toLowerCase().endsWith('@boldbusiness.com')) {
          console.log('Access denied for non-boldbusiness.com email:', user.email)
          return false // Reject sign-in for non-boldbusiness.com accounts
        }

        // Create or update user in database for boldbusiness.com accounts
        if (user.email) {
          console.log('User signed in:', user.email)
          console.log('Creating/updating boldbusiness.com user in database:', user.email)
          await UserService.upsertUserFromAuth({
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
          })
        }
        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return true // Allow sign-in even if DB operations fail
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { UserService } from '@/lib/user-service'

const authOptions: NextAuthOptions = {
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
          const dbUser = await UserService.getUserByEmail(session.user.email)
          if (dbUser) {
            session.user.role = dbUser.role
            session.user.status = dbUser.status
            session.user.permissions = dbUser.permissions
            session.user.teamId = dbUser.teamId
          }
        }
      }
      return session
    },
    async jwt({ token, account, profile, user }) {
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
    async signIn({ user, account, profile }) {
      try {
        // Create or update user in database
        if (user.email) {
          await UserService.upsertUserFromAuth({
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
          })
        }
        return true
      } catch (error) {
        console.error('Error during sign in:', error)
        return false
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

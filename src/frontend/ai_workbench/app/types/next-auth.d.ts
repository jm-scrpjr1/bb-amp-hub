// NextAuth type extensions

import { UserRole, UserStatus } from '@/lib/permissions'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole
      status?: UserStatus
      permissions?: Array<{
        permission: string
        resource?: string
      }>
      teamId?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: UserRole
    status?: UserStatus
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: UserRole
    status?: UserStatus
    permissions?: Array<{
      permission: string
      resource?: string
    }>
    teamId?: string
  }
}

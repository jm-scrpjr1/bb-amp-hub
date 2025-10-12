'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthBridge() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      // Not authenticated, redirect to sign in
      router.push('/auth/signin')
      return
    }

    // Authenticated, get token and redirect to React app
    const getTokenAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/token')
        const data = await response.json()
        
        if (data.token) {
          // Store token for React app to use (in the format React app expects)
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('nextjs_auth_user', JSON.stringify(data.user))

          // Redirect to React app
          window.location.href = 'http://localhost:3003/'
        } else {
          console.error('Failed to get auth token')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error getting auth token:', error)
        router.push('/auth/signin')
      }
    }

    getTokenAndRedirect()
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to AI Workbench...</p>
      </div>
    </div>
  )
}

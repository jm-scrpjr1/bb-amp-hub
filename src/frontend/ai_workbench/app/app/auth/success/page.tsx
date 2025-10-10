'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthSuccess() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = 'http://localhost:3003/'

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      // Not authenticated, redirect to sign in
      router.push('/auth/signin')
      return
    }

    // Authenticated, create token and redirect to React app
    const createTokenAndRedirect = async () => {
      try {
        // Get token from our API
        const response = await fetch('/api/auth/token')
        const data = await response.json()
        
        if (data.token) {
          // Store token for React app to use
          localStorage.setItem('nextjs_auth_token', data.token)
          localStorage.setItem('nextjs_auth_user', JSON.stringify(data.user))
          
          console.log('Auth successful, redirecting to:', callbackUrl)
          
          // Redirect to React app
          window.location.href = callbackUrl
        } else {
          console.error('Failed to get auth token')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error getting auth token:', error)
        router.push('/auth/signin')
      }
    }

    createTokenAndRedirect()
  }, [session, status, router, callbackUrl])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">Authentication successful!</p>
        <p className="text-gray-300 text-sm mt-2">Redirecting to AI Workbench...</p>
      </div>
    </div>
  )
}

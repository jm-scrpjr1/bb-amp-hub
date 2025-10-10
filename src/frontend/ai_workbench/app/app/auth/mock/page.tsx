'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MockAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMockSignIn = async () => {
    setIsLoading(true)
    
    // Create mock user data
    const mockUser = {
      id: 'mock-user-123',
      email: 'jmadrino@boldbusiness.com',
      name: 'John Madrino',
      image: 'https://via.placeholder.com/150',
      role: 'ADMIN',
      status: 'ACTIVE',
      permissions: [],
      teamId: undefined,
    }

    // Create a simple JWT-like token (for demo purposes)
    const mockToken = btoa(JSON.stringify({
      ...mockUser,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      iat: Date.now()
    }))

    // Store in localStorage for React app
    localStorage.setItem('nextjs_auth_token', mockToken)
    localStorage.setItem('nextjs_auth_user', JSON.stringify(mockUser))
    
    // Redirect to React app
    setTimeout(() => {
      window.location.href = 'http://localhost:3003/'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-900 to-black flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mock Authentication</h1>
          <p className="text-gray-300">Quick sign-in for development</p>
        </div>

        <button
          onClick={handleMockSignIn}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Sign in as Admin</span>
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            This will sign you in as:<br />
            <strong className="text-white">jmadrino@boldbusiness.com</strong>
          </p>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/auth/signin" 
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Use real Google OAuth instead
          </a>
        </div>
      </div>
    </div>
  )
}

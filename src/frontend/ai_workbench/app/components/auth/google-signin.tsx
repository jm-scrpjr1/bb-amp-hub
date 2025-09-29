'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface GoogleSignInProps {
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
}

export default function GoogleSignIn({ variant = 'default', className = '' }: GoogleSignInProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google')
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (session) {
    // User is signed in
    if (variant === 'icon-only') {
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <img 
            src={session.user?.image || ''} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border-2 border-[#06E5EC]"
          />
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )
    }

    if (variant === 'compact') {
      return (
        <div className={`flex items-center space-x-3 ${className}`}>
          <img 
            src={session.user?.image || ''} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border-2 border-[#06E5EC]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )
    }

    // Default variant
    return (
      <div className={`flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border ${className}`}>
        <img 
          src={session.user?.image || ''} 
          alt="Profile" 
          className="w-12 h-12 rounded-full border-2 border-[#06E5EC]"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Welcome, {session.user?.name}</h3>
          <p className="text-sm text-gray-600">{session.user?.email}</p>
        </div>
        <motion.button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </motion.button>
      </div>
    )
  }

  // User is not signed in
  if (variant === 'icon-only') {
    return (
      <motion.button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all disabled:opacity-50 ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
      </motion.button>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span className="text-sm font-medium text-gray-700">
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </span>
      </motion.button>
    )
  }

  // Default variant
  return (
    <motion.button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-lg font-medium text-gray-700">Continue with Google</span>
        </>
      )}
    </motion.button>
  )
}

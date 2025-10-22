import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import googleAuthService from '../services/googleAuthService';
import backendAuthService from '../services/backendAuthService';
import environmentConfig from '../config/environment';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if mock authentication is enabled
      if (environmentConfig.enableMockAuth) {
        const mockUser = {
          id: 'mock-user-id',
          email: 'jmadrino@boldbusiness.com',
          name: 'Jose Madrino',
          picture: 'https://via.placeholder.com/40',
          role: 'owner'
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check for persisted user data first (fastest)
      const nextjsUser = localStorage.getItem('nextjs_auth_user');
      if (nextjsUser) {
        try {
          const userData = JSON.parse(nextjsUser);
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          localStorage.removeItem('nextjs_auth_user');
        }
      }

      // Check backend authentication if enabled
      if (environmentConfig.enableBackendAuth && backendAuthService.isAuthenticated()) {
        try {
          const userData = await backendAuthService.getUserProfile();
          if (userData) {
            // Persist user data to localStorage
            localStorage.setItem('nextjs_auth_user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Backend auth check failed:', error);
          backendAuthService.logout();
        }
      }

      // Check for NextJS auth token (legacy migration)
      const nextjsToken = localStorage.getItem('nextjs_auth_token');
      if (nextjsToken) {
        // Transfer NextJS auth to React app format
        localStorage.setItem('authToken', nextjsToken);
        localStorage.removeItem('nextjs_auth_token');
      }

      // Fallback to frontend token validation
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await authService.validateToken(token);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      if (environmentConfig.enableBackendAuth) {
        backendAuthService.logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await authService.signIn(email, password);
      if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      const userData = await googleAuthService.signIn();

      if (userData && userData.email) {
        localStorage.setItem('authToken', userData.token);
        // Persist user data to localStorage for page reloads
        localStorage.setItem('nextjs_auth_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        console.log('Google sign-in successful:', userData.name);
        return { success: true, user: userData };
      } else {
        throw new Error('No user data received from Google');
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      googleAuthService.signOut();
      localStorage.removeItem('authToken');
      localStorage.removeItem('nextjs_auth_user'); // Clear persisted user data
      if (environmentConfig.enableBackendAuth) {
        backendAuthService.logout();
      }
      setUser(null);
      setIsAuthenticated(false);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const syncUsersFromWorkspace = async () => {
    if (!environmentConfig.enableBackendAuth) {
      throw new Error('Backend authentication not enabled');
    }
    return await backendAuthService.syncUsersFromWorkspace();
  };

  const syncGroupsFromWorkspace = async () => {
    if (!environmentConfig.enableBackendAuth) {
      throw new Error('Backend authentication not enabled');
    }
    return await backendAuthService.syncGroupsFromWorkspace();
  };

  const refreshUser = async () => {
    try {
      if (environmentConfig.enableBackendAuth && backendAuthService.isAuthenticated()) {
        const userData = await backendAuthService.getUserProfile();
        if (userData) {
          setUser(userData);
          return userData;
        }
      }

      // Fallback to token validation
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await authService.validateToken(token);
        if (userData) {
          setUser(userData);
          return userData;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signInWithGoogle,
    signOut,
    checkAuthStatus,
    syncUsersFromWorkspace,
    syncGroupsFromWorkspace,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

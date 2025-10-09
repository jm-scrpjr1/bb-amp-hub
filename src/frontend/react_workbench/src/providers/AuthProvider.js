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
      // Check backend authentication first if enabled
      if (environmentConfig.enableBackendAuth && backendAuthService.isAuthenticated()) {
        try {
          const userData = await backendAuthService.getUserProfile();
          if (userData) {
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

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signInWithGoogle,
    signOut,
    checkAuthStatus,
    syncUsersFromWorkspace,
    syncGroupsFromWorkspace
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

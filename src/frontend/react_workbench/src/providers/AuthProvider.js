import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import googleAuthService from '../services/googleAuthService';

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
      setUser(null);
      setIsAuthenticated(false);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signInWithGoogle,
    signOut,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

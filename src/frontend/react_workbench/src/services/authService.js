import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  async signIn(email, password) {
    try {
      const response = await this.api.post('/auth/signin', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Sign in failed');
    }
  }

  async signInWithGoogle(googleToken) {
    try {
      const response = await this.api.post('/auth/google', {
        token: googleToken,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google sign in failed');
    }
  }

  async signUp(email, password, name) {
    try {
      const response = await this.api.post('/auth/signup', {
        email,
        password,
        name,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Sign up failed');
    }
  }

  async validateToken(token) {
    try {
      const response = await this.api.get('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  async refreshToken() {
    try {
      const response = await this.api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async signOut() {
    try {
      await this.api.post('/auth/signout');
    } catch (error) {
      // Continue with local signout even if server request fails
      console.error('Server signout failed:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  async resetPassword(email) {
    try {
      const response = await this.api.post('/auth/reset-password', {
        email,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  async updatePassword(token, newPassword) {
    try {
      const response = await this.api.post('/auth/update-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password update failed');
    }
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    const token = this.getAuthToken();
    return !!token;
  }
}

export const authService = new AuthService();

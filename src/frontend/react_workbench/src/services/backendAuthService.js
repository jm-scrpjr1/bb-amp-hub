import environmentConfig from '../config/environment.js';

class BackendAuthService {
  constructor() {
    this.apiUrl = environmentConfig.apiUrl;
    this.token = localStorage.getItem('auth_token');
  }

  async authenticateWithGoogle(googleCredential) {
    try {
      console.log('🔄 Authenticating with backend using Google credential...');
      console.log('API URL:', this.apiUrl);

      // Parse the Google JWT to get user info
      const userInfo = this.parseJWT(googleCredential);
      console.log('Parsed user info:', userInfo);

      // Send to backend for authentication and user creation/update
      const requestBody = {
        credential: googleCredential,
        userInfo: {
          email: userInfo.email,
          name: userInfo.name,
          image: userInfo.picture,
        }
      };

      console.log('Sending request to backend:', requestBody);

      const response = await fetch(`${this.apiUrl}/auth/google`, {
        method: 'POST',
        credentials: 'include', // Enable CORS credentials
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const authResult = await response.json();
      console.log('Backend auth result:', authResult);

      // Store the backend token
      this.token = authResult.token;
      localStorage.setItem('auth_token', this.token);

      console.log('✅ Backend authentication successful');
      // Return user with token so AuthProvider can store it properly
      return {
        ...authResult.user,
        token: authResult.token
      };
    } catch (error) {
      console.error('❌ Backend authentication failed:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      if (!this.token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.apiUrl}/user/profile`, {
        credentials: 'include', // Enable CORS credentials
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Authentication expired');
        }
        throw new Error(`Failed to get user profile: ${response.statusText}`);
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async syncUsersFromWorkspace() {
    try {
      if (!this.token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Syncing users from Google Workspace...');
      
      const response = await fetch(`${this.apiUrl}/admin/sync-users`, {
        method: 'POST',
        credentials: 'include', // Enable CORS credentials
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ User sync completed:', result);
      return result;
    } catch (error) {
      console.error('❌ User sync failed:', error);
      throw error;
    }
  }

  async syncGroupsFromWorkspace() {
    try {
      if (!this.token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Syncing groups from Google Workspace...');
      
      const response = await fetch(`${this.apiUrl}/admin/sync-groups`, {
        method: 'POST',
        credentials: 'include', // Enable CORS credentials
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Group sync completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Group sync failed:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      if (!this.token) {
        console.error('❌ No authentication token available');
        console.log('Checking localStorage:', localStorage.getItem('auth_token'));
        throw new Error('No authentication token');
      }

      console.log('🔍 Making authenticated request:', {
        endpoint,
        apiUrl: this.apiUrl,
        fullUrl: `${this.apiUrl}${endpoint}`,
        hasToken: !!this.token,
        tokenPreview: this.token?.substring(0, 20) + '...'
      });

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        credentials: 'include', // Enable CORS credentials
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = response.statusText;
        try {
          const errorBody = await response.json();
          errorDetails = errorBody.message || errorBody.error || JSON.stringify(errorBody);
          console.error('❌ Error response body:', errorBody);
        } catch (e) {
          // Response body is not JSON
          try {
            errorDetails = await response.text();
            console.error('❌ Error response text:', errorDetails);
          } catch (e2) {
            // Can't read response body
          }
        }

        if (response.status === 401) {
          this.logout();
          throw new Error('Authentication expired');
        }
        throw new Error(`Request failed: ${errorDetails}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      throw new Error('Invalid token format');
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    console.log('🔓 Logged out from backend');
  }

  getToken() {
    return this.token;
  }
}

export default new BackendAuthService();

import { createUserWithRole } from '../lib/permissions.js';
import environmentConfig from '../config/environment.js';
import backendAuthService from './backendAuthService.js';

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.clientId = environmentConfig.googleClientId;
    this.enableMockAuth = environmentConfig.enableMockAuth;
  }

  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      // Check if Google Identity Services is loaded
      if (window.google && window.google.accounts) {
        this.initializeGoogleAuth();
        resolve();
      } else {
        // Wait for the script to load
        const checkGoogleLoaded = () => {
          if (window.google && window.google.accounts) {
            this.initializeGoogleAuth();
            resolve();
          } else {
            setTimeout(checkGoogleLoaded, 100);
          }
        };
        checkGoogleLoaded();
      }
    });
  }

  initializeGoogleAuth() {
    try {
      console.log('Initializing Google Auth with Client ID:', this.clientId);

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      this.isInitialized = true;
      console.log('Google Auth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    }
  }

  handleCredentialResponse(response) {
    // This will be overridden by the actual callback
    console.log('Credential response received:', response);
  }

  async signIn() {
    console.log('Starting Google sign-in process...');
    console.log('Current domain:', window.location.hostname);
    console.log('Client ID:', this.clientId);

    // First, check if we have a Next.js auth token
    const nextjsToken = localStorage.getItem('nextjs_auth_token');
    const nextjsUser = localStorage.getItem('nextjs_auth_user');

    if (nextjsToken && nextjsUser) {
      console.log('Found Next.js auth token, using it');
      try {
        const user = JSON.parse(nextjsUser);
        // Store the token for API calls
        localStorage.setItem('authToken', nextjsToken);
        return Promise.resolve(user);
      } catch (error) {
        console.error('Error parsing Next.js user data:', error);
        // Clear invalid data and continue with normal flow
        localStorage.removeItem('nextjs_auth_token');
        localStorage.removeItem('nextjs_auth_user');
      }
    }

    await this.initialize();

    return new Promise((resolve, reject) => {
      // Check if mock auth is enabled in environment config
      if (environmentConfig.enableMockAuth) {
        console.log('Mock authentication enabled in environment config');
        resolve(this.getMockUser());
        return;
      }

      if (!window.google || !window.google.accounts) {
        // Fallback to mock authentication if Google services aren't available
        console.log('Google services not available, using mock authentication');
        resolve(this.getMockUser());
        return;
      }

      // Check if we should use mock auth (demo client ID)
      if (this.clientId === 'demo-client-id') {
        console.log('Demo client ID detected, using mock authentication');
        resolve(this.getMockUser());
        return;
      }

      console.log('Google services available, attempting real OAuth...');
      console.log('Client ID:', this.clientId);

      try {
        // Use Google Sign-In with ID token (more reliable than OAuth2 token flow)
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: async (response) => {
            console.log('Google Sign-In callback received:', response);
            try {
              // Parse the JWT credential
              const userData = this.parseJWT(response.credential);
              console.log('Parsed user data:', userData);

              // If backend authentication is enabled, try it first
              if (environmentConfig.enableBackendAuth) {
                console.log('🔄 Using backend authentication...');
                try {
                  const user = await backendAuthService.authenticateWithGoogle(response.credential);
                  console.log('✅ Backend authentication successful:', user);
                  resolve(user);
                  return;
                } catch (backendError) {
                  console.error('❌ Backend authentication failed, falling back to frontend auth:', backendError);
                  console.log('💡 To fix: Set REACT_APP_ENABLE_BACKEND_AUTH=false or deploy backend server');
                  // Continue to frontend authentication fallback
                }
              }

              // Fallback to frontend-only authentication
              console.log('🔄 Using frontend authentication...');
              const userWithRole = createUserWithRole({
                id: userData.sub,
                email: userData.email,
                name: userData.name,
                image: userData.picture
              });

              console.log('User with role assigned:', userWithRole);

              resolve({
                ...userWithRole,
                token: response.credential
              });
            } catch (error) {
              console.error('Authentication error:', error);
              console.log('Falling back to mock authentication');
              resolve(this.getMockUser());
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false
        });

        // Create a temporary button and trigger click
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          click_listener: () => {
            console.log('Google Sign-In button clicked programmatically');
          }
        });

        // Try to trigger the sign-in
        setTimeout(() => {
          const button = tempDiv.querySelector('div[role="button"]');
          if (button) {
            console.log('Clicking Google Sign-In button...');
            button.click();
          } else {
            console.log('Button not found, trying prompt...');
            window.google.accounts.id.prompt();
          }

          // Clean up
          setTimeout(() => {
            if (tempDiv.parentNode) {
              document.body.removeChild(tempDiv);
            }
          }, 1000);
        }, 100);

      } catch (error) {
        console.error('Google sign-in error:', error);
        console.log('Falling back to mock authentication');
        resolve(this.getMockUser());
      }
    });
  }

  async showOAuthPopup() {
    return new Promise((resolve, reject) => {
      try {
        // Use OAuth2 popup flow as fallback
        console.log('Using OAuth2 popup flow...');

        window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'email profile openid',
          callback: async (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            try {
              // Get user info using the access token
              const userInfo = await this.getUserInfo(response.access_token);
              console.log('OAuth user info:', userInfo);

              // If backend authentication is enabled, try it first
              if (environmentConfig.enableBackendAuth) {
                console.log('🔄 Using backend authentication with access token...');
                try {
                  const user = await backendAuthService.authenticateWithGoogle(response.access_token);
                  console.log('✅ Backend authentication successful:', user);
                  resolve(user);
                  return;
                } catch (backendError) {
                  console.error('❌ Backend authentication failed, falling back to frontend auth:', backendError);
                  // Continue to frontend authentication fallback
                }
              }

              // Fallback to frontend-only authentication
              console.log('🔄 Using frontend authentication...');
              const userWithRole = createUserWithRole({
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                image: userInfo.picture
              });

              console.log('User with role assigned:', userWithRole);

              resolve({
                ...userWithRole,
                token: response.access_token
              });
            } catch (error) {
              console.error('OAuth authentication error:', error);
              reject(error);
            }
          },
        }).requestAccessToken();
      } catch (error) {
        console.error('Popup sign-in error:', error);
        reject(error);
      }
    });
  }

  async showDirectPopup() {
    return new Promise((resolve, reject) => {
      try {
        // Create a simple OAuth URL and open popup
        const redirectUri = `${window.location.origin}/auth/signin`;
        const scope = 'email profile openid';
        const responseType = 'code';
        const state = Math.random().toString(36).substring(7);

        const authUrl = `https://accounts.google.com/oauth/authorize?` +
          `client_id=${encodeURIComponent(this.clientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(scope)}&` +
          `response_type=${encodeURIComponent(responseType)}&` +
          `state=${encodeURIComponent(state)}`;

        console.log('Opening OAuth popup with URL:', authUrl);

        const popup = window.open(
          authUrl,
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          reject(new Error('Popup blocked'));
          return;
        }

        // Listen for popup completion
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Popup closed by user'));
          }
        }, 1000);

        // For now, just resolve with mock user since we don't have callback handling
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!popup.closed) {
            popup.close();
          }
          console.log('OAuth popup timeout, using mock authentication');
          resolve(this.getMockUser());
        }, 5000);

      } catch (error) {
        console.error('Direct popup error:', error);
        reject(error);
      }
    });
  }

  async getUserInfo(accessToken) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    return response.json();
  }

  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      throw error;
    }
  }

  getMockUser() {
    // Fallback mock user for development/demo - using proper role assignment
    const mockUserData = {
      id: 'demo-user-' + Date.now(),
      email: 'jmadrino@boldbusiness.com',
      name: 'John Madrino',
      image: '/images/AI AGENT 5.png'
    };

    const userWithRole = createUserWithRole(mockUserData);

    return {
      ...userWithRole,
      token: 'demo-jwt-token-' + Date.now()
    };
  }

  signOut() {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      console.log('Google sign-out completed');
    } catch (error) {
      console.error('Google sign-out error:', error);
    }
  }
}

export default new GoogleAuthService();

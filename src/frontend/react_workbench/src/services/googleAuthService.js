import { createUserWithRole } from '../lib/permissions.js';

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-client-id';
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
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts) {
        // Fallback to mock authentication if Google services aren't available
        console.log('Google services not available, using mock authentication');
        resolve(this.getMockUser());
        return;
      }

      console.log('Google services available, attempting OAuth...');

      try {
        // Set up the callback for this specific sign-in attempt
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response) => {
            console.log('Google OAuth callback received:', response);
            try {
              const userData = this.parseJWT(response.credential);
              console.log('Parsed user data:', userData);

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
              console.error('Failed to parse JWT:', error);
              reject(error);
            }
          },
          auto_select: false,
        });

        // Trigger the sign-in prompt
        console.log('Triggering Google sign-in prompt...');
        window.google.accounts.id.prompt((notification) => {
          console.log('Google prompt notification:', notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Prompt not displayed, trying popup...');
            // Fallback to popup if prompt is not displayed
            this.showPopup().then(resolve).catch(reject);
          }
        });
      } catch (error) {
        console.error('Google sign-in error:', error);
        reject(error);
      }
    });
  }

  async showPopup() {
    return new Promise((resolve, reject) => {
      try {
        window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'email profile',
          callback: async (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            try {
              // Get user info using the access token
              const userInfo = await this.getUserInfo(response.access_token);
              const userWithRole = createUserWithRole({
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                image: userInfo.picture
              });

              resolve({
                ...userWithRole,
                token: response.access_token
              });
            } catch (error) {
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
      name: 'Jose Madrino',
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

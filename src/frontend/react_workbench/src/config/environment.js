// Environment configuration for different deployment environments
//
// Backend Authentication:
// - Set REACT_APP_ENABLE_BACKEND_AUTH=true in AWS to enable backend auth
// - Ensure REACT_APP_API_URL points to your backend server (not frontend URL)
// - Without backend auth, the app uses frontend-only authentication

const config = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    enableMockAuth: false, // Disable mock auth - use real Google OAuth
    enableBackendAuth: true, // Re-enable backend auth
    environment: 'development'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com',
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-client-id',
    enableMockAuth: process.env.REACT_APP_GOOGLE_CLIENT_ID === 'demo-client-id',
    // Disable backend auth until backend server is deployed
    enableBackendAuth: process.env.REACT_APP_ENABLE_BACKEND_AUTH === 'true',
    environment: 'production'
  }
};

// Determine current environment
const getCurrentEnvironment = () => {
  // Check if we're on AWS Amplify
  if (window.location.hostname.includes('amplifyapp.com')) {
    return 'production';
  }
  
  // Check if we're on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  
  // Default to production for other domains
  return 'production';
};

const currentEnv = getCurrentEnvironment();
const environmentConfig = config[currentEnv];

// Only log in development to avoid console spam in production
if (currentEnv === 'development') {
  console.log('Environment detected:', currentEnv);
  console.log('Environment config:', environmentConfig);
}

export default environmentConfig;
export { getCurrentEnvironment };

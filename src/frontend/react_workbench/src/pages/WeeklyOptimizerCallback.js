import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import environmentConfig from '../config/environment';

const WeeklyOptimizerCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting your Google Calendar...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state'); // userId
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or user ID');
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      // Send code to backend
      const response = await fetch(
        `${environmentConfig.apiUrl}/weekly-optimizer/google-callback?code=${code}&state=${state}`
      );

      if (!response.ok) {
        throw new Error('Failed to complete OAuth flow');
      }

      const data = await response.json();

      setStatus('success');
      setMessage('✅ Google Calendar connected successfully!');

      // Close popup after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (err) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setMessage(`Failed to connect: ${err.message}`);
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connecting...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default WeeklyOptimizerCallback;


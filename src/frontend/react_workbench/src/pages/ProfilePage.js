import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setImagePreview(base64Image);

        // Update user profile with new image
        const apiUrl = process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api';
        const response = await fetch(`${apiUrl}/user/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            image: base64Image
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile image');
        }

        const updatedUser = await response.json();

        // Refresh user data in auth context
        await refreshUser();

        toast.success('Profile image updated successfully!');
        setImagePreview(null);
      };

      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to sign in
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="h-24 w-24 bg-blue-800 rounded-full flex items-center justify-center border-4 border-white/20 overflow-hidden">
                {(imagePreview || user?.image) ? (
                  <img
                    src={imagePreview || user.image}
                    alt={user?.name || 'User'}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleImageClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload profile picture"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user?.name || 'User'}</h1>
              <p className="text-blue-100 text-lg">{user?.email}</p>
              <div className="flex items-center mt-3 space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-sm">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900 capitalize">{user?.role || 'Member'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">Google Account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Activity & Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">AI Assistant Interactions</p>
                  <p className="text-sm text-gray-600">Total conversations with ARIA</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">12</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Projects Created</p>
                  <p className="text-sm text-gray-600">Total projects in workspace</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Last Active</p>
                  <p className="text-sm text-gray-600">Most recent login</p>
                </div>
                <span className="text-sm font-medium text-green-600">Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Account Settings</p>
                  <p className="text-sm text-gray-600">Manage preferences</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Back to Workspace</p>
                  <p className="text-sm text-gray-600">Return to dashboard</p>
                </div>
              </div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Help & Support</p>
                  <p className="text-sm text-gray-600">Get assistance</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const AdminPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Administrative controls and analytics - Coming soon!</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;

"use client";

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects } from '@/components/effects';

export default function GroupsPageTest() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <MainLayout>
      <ScrollEffects>
        <div className="min-h-screen bg-gray-50">
          <div className="p-8">
            <h1 className="text-3xl font-bold">Groups Page Test</h1>
            <p className="mt-4">This is a minimal test page to check syntax.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Test Button
            </button>
          </div>
        </div>
      </ScrollEffects>
    </MainLayout>
  );
}

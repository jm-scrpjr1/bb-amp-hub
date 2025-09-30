
"use client";

import { useState, useEffect } from 'react';
import PageTemplate from '@/components/common/page-template';
import BoldIdeaModal from '@/components/ui/bold-idea-modal';
import { Lightbulb, Sparkles, Target, Zap } from '@/components/icons';

export default function SubmitBoldIdeaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal when page loads
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally redirect back to home or previous page
    // router.back();
  };

  return (
    <>
      <PageTemplate
        title="Submit Bold Idea"
        description="Share your innovative ideas and suggestions with the team"
        icon={Lightbulb}
      >
        {/* Page content with call-to-action */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl">
                  <Lightbulb className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                💡 Share Your Bold Ideas
              </h2>

              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Have an innovative idea that could amplify our workspace? We want to hear it!
                Your suggestions help us build better tools and create more efficient workflows.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Identify Problems</h3>
                  <p className="text-sm text-gray-600">Share challenges you face in your daily work</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Propose Solutions</h3>
                  <p className="text-sm text-gray-600">Suggest innovative ways to improve our platform</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Drive Impact</h3>
                  <p className="text-sm text-gray-600">Help create amplified results for everyone</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✨ Submit Your Bold Idea
              </button>
            </div>
          </div>
        </div>
      </PageTemplate>

      {/* Bold Idea Modal */}
      <BoldIdeaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

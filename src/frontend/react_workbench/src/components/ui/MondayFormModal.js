import React, { useState, useEffect, memo } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import GenieModal from './GenieModal';

const MondayFormModal = memo(function MondayFormModal({ isOpen, onClose, triggerElement }) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-open in new tab when modal opens (since iframe is blocked by Monday.com)
  useEffect(() => {
    if (isOpen && user) {
      // Open Monday.com form in new tab
      window.open('https://forms.monday.com/forms/8493996ce9c50eea77637b46940cc86b?r=use1', '_blank');
      // Close the modal immediately
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [isOpen, user, onClose]);

  if (!mounted) return null;

  // Show a brief message before redirecting
  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6 rounded-t-2xl">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Submit Your Bold Idea
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Opening Form...
          </h3>
          <p className="text-gray-600 text-sm">
            The Bold Idea submission form is opening in a new tab.
          </p>
        </div>

        <div className="text-xs text-gray-500">
          If the form didn't open, please{' '}
          <a
            href="https://forms.monday.com/forms/8493996ce9c50eea77637b46940cc86b?r=use1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 underline"
          >
            click here
          </a>
        </div>
      </div>
    </GenieModal>
  );
});

export default MondayFormModal;


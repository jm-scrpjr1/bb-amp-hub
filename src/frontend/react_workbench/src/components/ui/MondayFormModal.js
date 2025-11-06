import React, { useState, useEffect, memo } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import GenieModal from './GenieModal';

const MondayFormModal = memo(function MondayFormModal({ isOpen, onClose, triggerElement }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!mounted) return null;

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
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
              <p className="text-purple-100 text-sm">
                Share innovations that amplify our workspace
              </p>
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

      {/* Monday.com Form iframe via backend proxy */}
      <div className="relative bg-white" style={{ height: '700px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading form...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}/monday-form-proxy`}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 'none' }}
          title="Submit Bold Idea Form"
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
          allow="fullscreen"
        />
      </div>
    </GenieModal>
  );
});

export default MondayFormModal;


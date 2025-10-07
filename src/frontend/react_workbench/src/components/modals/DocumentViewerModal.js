import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, Download, Eye, Globe, Building, Users, FileText } from 'lucide-react';

const DocumentViewerModal = ({ isOpen, onClose, document, onToggleFavorite, isFavorite }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen || !document) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Pre-employment Requirements': Users,
      'Important Tools': FileText,
      'Policies': Building,
      'Time Keeping': Globe,
      'Training': Users,
      'HR': Users,
      'IT': FileText,
      'Supervisor Tool kit': Globe,
      'General': Building,
      'Employee Perks / Benefits': Users
    };
    return iconMap[category] || FileText;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Pre-employment Requirements': 'blue',
      'Important Tools': 'cyan',
      'Policies': 'purple',
      'Time Keeping': 'green',
      'Training': 'yellow',
      'HR': 'pink',
      'IT': 'indigo',
      'Supervisor Tool kit': 'orange',
      'General': 'gray',
      'Employee Perks / Benefits': 'emerald'
    };
    return colorMap[category] || 'gray';
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
      gray: { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-200' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200' }
    };
    return colorMap[color] || colorMap.gray;
  };

  const IconComponent = getCategoryIcon(document.category);
  const colorClasses = getColorClasses(getCategoryColor(document.category));

  // Check if the document can be embedded
  const canEmbed = document.link && (
    document.link.includes('docs.google.com') && !document.link.includes('forms.gle')
  );

  const isGoogleForm = document.link && document.link.includes('forms.gle');

  const getEmbedUrl = (url) => {
    if (url.includes('docs.google.com')) {
      // Convert Google Docs URL to embed format
      return url.replace('/edit', '/preview');
    }
    return url;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${colorClasses.bg} rounded-xl`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{document.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{document.country === 'All Countries' ? 'Global' : document.country}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>{document.owner || 'No owner'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{document.stakeholder}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Favorite Button */}
              <motion.button
                onClick={() => onToggleFavorite(document.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'text-yellow-500 hover:bg-yellow-100' 
                    : 'text-gray-400 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.button>

              {/* External Link Button */}
              <motion.a
                href={document.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 ${colorClasses.text} hover:bg-gray-200 rounded-lg transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </motion.a>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative">
            {canEmbed ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Loading document...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={getEmbedUrl(document.link)}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={document.name}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center max-w-md">
                  {isGoogleForm ? (
                    <>
                      <FileText className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Google Form</h3>
                      <p className="text-gray-600 mb-6">
                        This is a Google Form that needs to be opened in a new tab to fill out or view properly.
                      </p>
                    </>
                  ) : (
                    <>
                      <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
                      <p className="text-gray-600 mb-6">
                        This document cannot be previewed in the modal. Click the button below to open it in a new tab.
                      </p>
                    </>
                  )}
                  <motion.a
                    href={document.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-2 px-6 py-3 ${colorClasses.bg} text-white rounded-lg hover:opacity-90 transition-opacity`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>{isGoogleForm ? 'Open Form' : 'Open Document'}</span>
                  </motion.a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Category: <span className="font-medium">{document.category}</span>
              </div>
              <div className="text-xs text-gray-500">
                Press ESC to close
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentViewerModal;

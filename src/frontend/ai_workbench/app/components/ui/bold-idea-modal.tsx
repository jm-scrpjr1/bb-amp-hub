"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { X, Lightbulb, Sparkles, Target, Zap } from '@/components/icons';
import { useSession } from 'next-auth/react';
import GenieModal from './genie-modal';

interface BoldIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
}

const BoldIdeaModal = memo(function BoldIdeaModal({ isOpen, onClose, triggerElement }: BoldIdeaModalProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impact, setImpact] = useState('');
  const [implementation, setImplementation] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ideaData = {
      title,
      description,
      category,
      impact,
      implementation,
      submittedBy: session?.user?.name || 'Anonymous',
      submittedAt: new Date().toISOString(),
    };

    console.log('Bold Idea submitted:', ideaData);

    // Simulate submission delay for better UX
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Show success for 2 seconds then close
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setImpact('');
        setImplementation('');
        onClose();
      }, 2000);
    }, 1500);
  }, [title, description, category, impact, implementation, session, onClose]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImpact('');
    setImplementation('');
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
              {/* Enhanced Header */}
              <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6 rounded-t-2xl overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute top-8 right-8 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-4 left-1/3 w-6 h-6 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                      <Lightbulb className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        💡 Submit Your Bold Idea
                      </h2>
                      <p className="text-purple-100 text-sm">
                        Share innovations that amplify our workspace • Select your tools, start your work, get amplified results
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

              {/* Success State */}
              {showSuccess ? (
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <span className="text-3xl">🎉</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Bold Idea Submitted!</h3>
                    <p className="text-gray-600">
                      Your innovative idea has been received and will be reviewed by our innovation team.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-700 font-semibold">
                      ✨ Thank you for contributing to our amplified workspace! ✨
                    </p>
                  </div>
                </div>
              ) : (
                /* Form Content */
                <form onSubmit={handleSubmit} className="p-8 bg-gradient-to-b from-purple-50/50 to-white">
                <div className="space-y-6">
                  {/* Idea Title */}
                  <div>
                    <label htmlFor="idea-title" className="block text-sm font-semibold text-gray-800 mb-3">
                      💡 Idea Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="idea-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give your bold idea a catchy name..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-purple-300"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="idea-category" className="block text-sm font-semibold text-gray-800 mb-3">
                      🎯 Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="idea-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-purple-300"
                      required
                    >
                      <option value="">Select a category...</option>
                      <option value="productivity">🚀 Productivity Enhancement</option>
                      <option value="ai-tools">🤖 AI Tools & Features</option>
                      <option value="user-experience">✨ User Experience</option>
                      <option value="workflow">⚡ Workflow Optimization</option>
                      <option value="collaboration">👥 Team Collaboration</option>
                      <option value="automation">🔄 Process Automation</option>
                      <option value="innovation">💎 Innovation & Research</option>
                      <option value="other">🌟 Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="idea-description" className="block text-sm font-semibold text-gray-800 mb-3">
                      📝 Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="idea-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm hover:border-purple-300"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Expected Impact */}
                  <div>
                    <label htmlFor="idea-impact" className="block text-sm font-semibold text-gray-800 mb-3">
                      📈 Expected Impact
                    </label>
                    <textarea
                      id="idea-impact"
                      value={impact}
                      onChange={(e) => setImpact(e.target.value)}
                      placeholder="How would this idea improve our work? What benefits would it bring?"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm hover:border-purple-300"
                    />
                  </div>

                  {/* Implementation Thoughts */}
                  <div>
                    <label htmlFor="idea-implementation" className="block text-sm font-semibold text-gray-800 mb-3">
                      🛠️ Implementation Ideas
                    </label>
                    <textarea
                      id="idea-implementation"
                      value={implementation}
                      onChange={(e) => setImplementation(e.target.value)}
                      placeholder="Any thoughts on how this could be implemented? Resources needed?"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm hover:border-purple-300"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-150 font-medium border border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-colors duration-150 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Submitting...</span>
                        <span className="animate-pulse">⚡</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Bold Idea</span>
                        <span className="animate-pulse">✨</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              )}
    </GenieModal>
  );
});

export default BoldIdeaModal;

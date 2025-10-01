"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Clock, User, ChevronRight } from '@/components/icons';
import GenieModal from './genie-modal';
import Image from 'next/image';
import { mockBoldUpdates } from '@/lib/mock-data';

interface BoldUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
}

const BoldUpdatesModal = memo(function BoldUpdatesModal({ 
  isOpen, 
  onClose, 
  triggerElement
}: BoldUpdatesModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = ['All', 'Product', 'Company', 'Technology', 'Marketing'];
  
  const filteredUpdates = selectedCategory === 'All' 
    ? mockBoldUpdates 
    : mockBoldUpdates.filter(update => update.category === selectedCategory);

  const handleUpdateClick = useCallback((updateId: number) => {
    console.log('Opening update:', updateId);
    // Add navigation logic here
  }, []);

  if (!mounted) return null;

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-blue-300/50"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(29, 78, 216, 0.2), 0 0 50px rgba(29, 78, 216, 0.2)'
      }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-600/20 blur-sm -z-10" />
      
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-cyan-500/90" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <TrendingUp className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h2
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Bold Updates
              </motion.h2>
              <motion.p
                className="text-blue-100 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Stay updated with the latest from Bold Business
              </motion.p>
            </div>
          </div>
          
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Updates Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUpdates.map((update, index) => (
            <motion.div
              key={update.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleUpdateClick(update.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
              whileHover={{ y: -4 }}
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={update.image}
                  alt={update.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    {update.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
                  {update.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {update.description || "Stay updated with the latest developments and insights from Bold Business."}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{update.date}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUpdates.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No updates found</h3>
            <p className="text-gray-400">Try selecting a different category.</p>
          </motion.div>
        )}
      </div>
    </GenieModal>
  );
});

export default BoldUpdatesModal;

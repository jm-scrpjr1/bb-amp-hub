import React, { useState } from 'react';
import { ScrollEffects } from '../effects';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const mockBoldUpdates = [
  {
    id: 1,
    title: "New AI-Powered Analytics Dashboard",
    category: "Product",
    image: "/images/AI AGENT 1.png",
    description: "Introducing our latest analytics dashboard with AI-powered insights."
  },
  {
    id: 2,
    title: "Enhanced Security Features",
    category: "Security",
    image: "/images/AI AGENT 2.png",
    description: "New security enhancements to protect your data and privacy."
  },
  {
    id: 3,
    title: "Mobile App Update",
    category: "Mobile",
    image: "/images/AI AGENT 3.png",
    description: "Latest mobile app update with improved performance and features."
  }
];

const BoldUpdates = () => {
  const [isBoldUpdatesModalOpen, setIsBoldUpdatesModalOpen] = useState(false);

  const handleUpdateClick = (updateId) => {
    console.log(`Bold update ${updateId} clicked`);
  };

  const handleViewAllClick = () => {
    setIsBoldUpdatesModalOpen(true);
  };

  return (
    <div className="mb-8">
      <ScrollEffects effect="fadeUp" delay={0.2}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 tracking-wide">
              Bold Updates
            </h2>
          </div>
          <ScrollEffects effect="slideLeft" delay={0.6}>
            <button
              onClick={handleViewAllClick}
              className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg group"
            >
              View All
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </ScrollEffects>
        </div>
      </ScrollEffects>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockBoldUpdates.map((update, index) => (
          <ScrollEffects
            key={update.id}
            effect="fadeUp"
            delay={0.8 + (index * 0.2)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleUpdateClick(update.id)}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={update.image}
                  alt={update.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    {update.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-3">
                  {update.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {update.description}
                </p>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-gray-500 font-medium">Read more</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          </ScrollEffects>
        ))}
      </div>
    </div>
  );
};

export default BoldUpdates;

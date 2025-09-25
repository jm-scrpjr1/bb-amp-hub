
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
// Temporary: Using custom icons until lucide-react is installed
// import { ChevronRight, TrendingUp } from 'lucide-react';
import { ChevronRight, TrendingUp } from '@/components/icons';
import { mockBoldUpdates } from '@/lib/mock-data';

export default function BoldUpdates() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleUpdateClick = (updateId: number) => {
    console.log(`Bold update ${updateId} clicked`);
    // Add navigation logic here
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Bold Updates</h2>
        </div>
        <button 
          onClick={() => console.log('View All Bold Updates clicked')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium group"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockBoldUpdates.map((update, index) => (
          <div 
            key={update.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 ${
              isVisible ? 'opacity-100 animate-slide-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => handleUpdateClick(update.id)}
          >
            <div className="relative h-40 overflow-hidden">
              <Image
                src={update.image}
                alt={update.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  {update.category}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-sm font-medium text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                {update.title}
              </h3>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">Read more</span>
                <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

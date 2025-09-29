
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
// Temporary: Using custom icons until lucide-react is installed
// import { ChevronRight, TrendingUp } from 'lucide-react';
import { ChevronRight, TrendingUp } from '@/components/icons';
import { mockBoldUpdates } from '@/lib/mock-data';
import { ScrollEffects, AnimatedText } from '@/components/effects';

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
      <ScrollEffects effect="fadeUp" delay={0.2}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <AnimatedText
              text="Bold Updates"
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent tracking-wide"
              animation="fadeUp"
              by="word"
              delay={0.4}
            />
          </div>
          <ScrollEffects effect="slideLeft" delay={0.6}>
            <button
              onClick={() => console.log('View All Bold Updates clicked')}
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
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
              onClick={() => handleUpdateClick(update.id)}
            >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={update.image}
                alt={update.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
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
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-gray-500 font-medium">Read more</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
          </ScrollEffects>
        ))}
      </div>
    </div>
  );
}

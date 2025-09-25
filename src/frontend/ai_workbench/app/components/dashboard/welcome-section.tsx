
"use client";

import { useState, useEffect } from 'react';
// Temporary: Using custom icons until lucide-react is installed
// import { Bot, Sparkles } from 'lucide-react';
import { Bot, Sparkles } from '@/components/icons';
import { mockUser } from '@/lib/mock-data';

export default function WelcomeSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 mb-8 text-white relative overflow-hidden transition-all duration-1000 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Sparkles className="h-5 w-5 mr-2 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">Get Started</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {mockUser.name}!
          </h1>
          <p className="text-blue-100 text-lg">
            Let's make your work smarter with AI assistance
          </p>
        </div>
        
        {/* Robot Character */}
        <div className="flex-shrink-0 ml-8">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="https://cdn.abacus.ai/images/50ccdffd-40b2-4846-81a3-aa091da3ecf8.png"
                alt="AI Assistant Robot"
                className="w-28 h-28 object-cover rounded-full"
              />
            </div>
            
            {/* Speech bubble */}
            <div className="absolute -top-8 -right-4 bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
              Hello!
              <div className="absolute bottom-0 left-4 transform translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

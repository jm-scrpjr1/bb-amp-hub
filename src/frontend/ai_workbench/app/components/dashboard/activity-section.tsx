
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Temporary: Using custom icons until lucide-react is installed
// import { Activity as ActivityIcon, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import { Activity as ActivityIcon, Clock, MessageCircle, CheckCircle } from '@/components/icons';
import { mockActivity } from '@/lib/mock-data';

const activityIcons = {
  project_update: CheckCircle,
  new_message: MessageCircle,
  task_completed: CheckCircle
};

export default function ActivitySection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ActivityIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Activity</h2>
        </div>
        <button 
          onClick={() => console.log('View All Activity clicked')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Activity
        </button>
      </div>

      <div className="space-y-4">
        {mockActivity.map((item, index) => {
          const IconComponent = activityIcons[item.type as keyof typeof activityIcons];
          
          return (
            <div 
              key={item.id}
              className={`flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 ${
                isVisible ? 'opacity-100 animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={item.avatar} alt={item.user} />
                <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                  {item.user.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${
                      item.type === 'project_update' ? 'text-blue-600' :
                      item.type === 'new_message' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{item.user}</span> {item.action}
                      {item.project && <span className="font-medium"> "{item.project}"</span>}
                      {item.details && <span className="text-gray-600"> - {item.details}</span>}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

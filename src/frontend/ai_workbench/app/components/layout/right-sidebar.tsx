
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { mockTrainings, mockMessages } from '@/lib/mock-data';
// Temporary: Using custom icons until lucide-react is installed
// import { Clock, MessageCircle } from 'lucide-react';
import { Clock, MessageCircle } from '@/components/icons';

export default function RightSidebar() {
  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 h-full overflow-y-auto">
      {/* Trainings Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Trainings</h2>
          <button 
            onClick={() => console.log('View More Trainings clicked')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View More
          </button>
        </div>
        
        <div className="space-y-4">
          {mockTrainings.map((training) => (
            <div key={training.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {training.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{training.duration}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs text-gray-700">{training.progress}%</span>
                    </div>
                    <Progress value={training.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button 
            onClick={() => console.log('View More Messages clicked')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View More  
          </button>
        </div>
        
        <div className="space-y-3">
          {mockMessages.map((message) => (
            <div 
              key={message.id} 
              className={`bg-white rounded-lg p-3 shadow-sm border-l-4 ${
                message.unread ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar} alt={message.sender} />
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                    {message.sender.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {message.sender}
                    </p>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {message.message}
                  </p>
                  {message.unread && (
                    <div className="mt-2">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Group Chats Section */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Group Chats</h3>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Development Team</p>
                <p className="text-xs text-gray-500">5 members online</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

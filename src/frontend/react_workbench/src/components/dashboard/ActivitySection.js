import React, { useState, useEffect } from 'react';
import { Activity, Clock, MessageCircle, CheckCircle } from 'lucide-react';

const mockActivity = [
  {
    id: 1,
    user: 'John Doe',
    action: 'updated project',
    project: 'AI Dashboard',
    details: 'Added new analytics features',
    time: '2 hours ago',
    type: 'project_update',
    avatar: '/images/AI AGENT 1.png'
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'sent a message in',
    project: 'Marketing Team',
    details: 'Discussed campaign strategy',
    time: '4 hours ago',
    type: 'new_message',
    avatar: '/images/AI AGENT 2.png'
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'completed task',
    project: 'Website Redesign',
    details: 'Finished homepage mockups',
    time: '6 hours ago',
    type: 'task_completed',
    avatar: '/images/AI AGENT 3.png'
  },
  {
    id: 4,
    user: 'Sarah Wilson',
    action: 'updated project',
    project: 'Mobile App',
    details: 'Fixed login issues',
    time: '1 day ago',
    type: 'project_update',
    avatar: '/images/AI AGENT 4.png'
  }
];

const activityIcons = {
  project_update: CheckCircle,
  new_message: MessageCircle,
  task_completed: CheckCircle
};

const ActivitySection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
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
          const IconComponent = activityIcons[item.type];
          
          return (
            <div 
              key={item.id}
              className={`flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 ${
                isVisible ? 'opacity-100 animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-8 w-8 flex-shrink-0">
                <img
                  src={item.avatar}
                  alt={item.user}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              
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
};

export default ActivitySection;

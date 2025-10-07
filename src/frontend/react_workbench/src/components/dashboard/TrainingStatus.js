import React from 'react';
import { motion } from 'framer-motion';

const TrainingStatus = () => {
  const trainingSessions = [
    {
      id: 1,
      name: 'Training Session Name',
      details: 'Getting Started Details',
      status: 'In Progress'
    },
    {
      id: 2,
      name: 'Training Session Name',
      details: 'Getting Started Details',
      status: 'In Progress'
    }
  ];

  const completionData = [
    { label: '50% Completed', color: 'text-green-600', bgColor: 'bg-green-500' },
    { label: 'Project Name', color: 'text-orange-600', bgColor: 'bg-orange-500' },
    { label: 'Project Name', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
    { label: 'Project Name', color: 'text-gray-600', bgColor: 'bg-gray-400' }
  ];

  // SVG Donut Chart Component
  const DonutChart = () => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = 50; // 50% completion
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">50%</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Training Status</h2>

      {/* Donut Chart Section */}
      <div className="flex items-center justify-between mb-6">
        <DonutChart />
        <div className="flex-1 ml-6 space-y-2">
          {completionData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
              <span className={item.color}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Training Sessions */}
      <div className="space-y-3">
        {trainingSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{session.name}</h4>
              <p className="text-xs text-gray-500">{session.details}</p>
            </div>
            <span className="text-xs text-gray-500">{session.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrainingStatus;

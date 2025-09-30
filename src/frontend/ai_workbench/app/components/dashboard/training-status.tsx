"use client";

import React from 'react';
import { ScrollEffects } from '@/components/effects';

interface TrainingSession {
  id: string;
  name: string;
  details: string;
  status: 'In Progress' | 'Completed';
}

const mockTrainingSessions: TrainingSession[] = [
  {
    id: '1',
    name: 'Training Session Name',
    details: 'Training Session Details',
    status: 'In Progress'
  },
  {
    id: '2',
    name: 'Training Session Name',
    details: 'Training Session Details',
    status: 'In Progress'
  }
];

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 120;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-64 h-64">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

export default function TrainingStatus() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <ScrollEffects effect="fadeUp" delay={0.2}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Training Status</h2>
      </ScrollEffects>

      {/* Progress Chart and Legend */}
      <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between mb-8 space-y-6 lg:space-y-0">
        {/* Circular Progress */}
        <ScrollEffects effect="fadeUp" delay={0.3}>
          <div className="flex-shrink-0">
            <CircularProgress percentage={50} />
          </div>
        </ScrollEffects>

        {/* Legend */}
        <ScrollEffects effect="fadeUp" delay={0.4}>
          <div className="flex-1 lg:ml-8 space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <span className="text-sm font-medium text-gray-900">50% Completed</span>
                <div className="text-xs text-gray-500">Project Name</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <span className="text-sm font-medium text-gray-900">Project Name</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div>
                <span className="text-sm font-medium text-gray-900">Project Name</span>
              </div>
            </div>
          </div>
        </ScrollEffects>
      </div>

      {/* Training Sessions */}
      <div className="space-y-4">
        {mockTrainingSessions.map((session, index) => (
          <ScrollEffects key={session.id} effect="fadeUp" delay={0.5 + index * 0.1}>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{session.name}</div>
                <div className="text-xs text-gray-500">{session.details}</div>
              </div>
              <div className="text-xs text-gray-500">{session.status}</div>
            </div>
          </ScrollEffects>
        ))}
      </div>
    </div>
  );
}

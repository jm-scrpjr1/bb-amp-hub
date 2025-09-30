"use client";

import React from 'react';
import { ScrollEffects } from '@/components/effects';

interface Project {
  id: string;
  name: string;
  status: string;
  completion: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Name of Project',
    status: 'Working',
    completion: 60
  },
  {
    id: '2',
    name: 'Name of Project',
    status: 'Working',
    completion: 60
  },
  {
    id: '3',
    name: 'Name of Project',
    status: 'Working',
    completion: 60
  }
];

export default function ProjectsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <ScrollEffects effect="fadeUp" delay={0.2}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        </div>
      </ScrollEffects>

      <ScrollEffects effect="fadeUp" delay={0.3}>
        <div className="flex items-center mb-6">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-gray-700 font-medium">30 done this month</span>
        </div>
      </ScrollEffects>

      {/* Table Header */}
      <ScrollEffects effect="fadeUp" delay={0.4}>
        <div className="grid grid-cols-3 gap-4 pb-3 mb-4 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">NAME</div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">STATUS</div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">COMPLETION</div>
        </div>
      </ScrollEffects>

      {/* Project Rows */}
      <div className="space-y-4">
        {mockProjects.map((project, index) => (
          <ScrollEffects key={project.id} effect="fadeUp" delay={0.5 + index * 0.1}>
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-b-0">
              {/* Project Name */}
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-600 rounded mr-3 flex-shrink-0"></div>
                <span className="text-gray-900 font-medium">{project.name}</span>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <span className="text-gray-700">{project.status}</span>
              </div>

              {/* Completion */}
              <div className="flex items-center">
                <span className="text-gray-900 font-semibold">{project.completion}%</span>
              </div>
            </div>
          </ScrollEffects>
        ))}
      </div>
    </div>
  );
}

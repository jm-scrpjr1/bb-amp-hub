import React from 'react';
import { motion } from 'framer-motion';

const mockProjects = [
  {
    id: 1,
    name: 'Name of Project',
    status: 'Working',
    completion: '60%',
    color: 'purple'
  },
  {
    id: 2,
    name: 'Name of Project',
    status: 'Working',
    completion: '60%',
    color: 'purple'
  },
  {
    id: 3,
    name: 'Name of Project',
    status: 'Working',
    completion: '60%',
    color: 'purple'
  }
];

const ProjectsSection = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        <div className="text-sm text-gray-600">
          <span className="inline-flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            30 done this month
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wide">
        <div>NAME</div>
        <div>STATUS</div>
        <div>COMPLETION</div>
      </div>

      {/* Project Rows */}
      <div className="space-y-4 mt-4">
        {mockProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-b-0 items-center"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span className="font-medium text-gray-900">{project.name}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">{project.status}</span>
            </div>
            <div>
              <span className="text-gray-900 font-medium">{project.completion}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;


"use client";

import { useState } from 'react';
// Temporary: Using custom icons until lucide-react is installed
// import { Clock, FileText, Lightbulb } from 'lucide-react';
import { Clock, FileText, Lightbulb } from '@/components/icons';
import { mockQuickActions } from '@/lib/mock-data';
import TicketConfirmationModal from '@/components/ui/ticket-confirmation-modal';
// import ScrollReveal from '@/components/effects/scroll-reveal';
// import HolographicText from '@/components/effects/holographic-text';
// import { motion } from 'framer-motion';

const iconMap = {
  Clock,
  Ticket: FileText,
  Lightbulb
};

export default function QuickActions() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const handleActionClick = (actionId: number) => {
    console.log(`Quick action ${actionId} clicked`);

    // Handle Submit Ticket action
    if (actionId === 2) {
      setIsTicketModalOpen(true);
      return;
    }

    // Add your other action handling logic here
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mockQuickActions.map((action, index) => {
          const Icon = iconMap[action.icon as keyof typeof iconMap];

          return (
            <div
              key={action.id}
              className={`${action.color} border rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 h-full`}
              onClick={() => handleActionClick(action.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  action.icon === 'Clock' ? 'bg-blue-100' :
                  action.icon === 'Ticket' ? 'bg-green-100' : 'bg-purple-100'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${
                    action.icon === 'Clock' ? 'text-blue-600' :
                    action.icon === 'Ticket' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Confirmation Modal */}
      <TicketConfirmationModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </>
  );
}

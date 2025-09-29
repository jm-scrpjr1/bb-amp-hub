
"use client";

import { useState } from 'react';
// Temporary: Using custom icons until lucide-react is installed
// import { Clock, FileText, Lightbulb } from 'lucide-react';
import { Clock, FileText, Lightbulb } from '@/components/icons';
import { mockQuickActions } from '@/lib/mock-data';
import TicketConfirmationModal from '@/components/ui/ticket-confirmation-modal';
import BoldIdeaModal from '@/components/ui/bold-idea-modal';
import { ScrollEffects } from '@/components/effects';
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
  const [isBoldIdeaModalOpen, setIsBoldIdeaModalOpen] = useState(false);

  const handleActionClick = (actionId: number) => {
    console.log(`Quick action ${actionId} clicked`);

    // Handle Submit Ticket action
    if (actionId === 2) {
      setIsTicketModalOpen(true);
      return;
    }

    // Handle Submit Bold Idea action
    if (actionId === 3) {
      setIsBoldIdeaModalOpen(true);
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
            <ScrollEffects
              key={action.id}
              effect="fadeUp"
              delay={index * 0.2}
            >
              <div
                className={`${action.color} border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2 h-full`}
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex items-start space-x-6">
                <div className={`p-4 rounded-xl ${
                  action.icon === 'Clock' ? 'bg-blue-100' :
                  action.icon === 'Ticket' ? 'bg-green-100' : 'bg-purple-100'
                } group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className={`h-8 w-8 ${
                    action.icon === 'Clock' ? 'text-blue-600' :
                    action.icon === 'Ticket' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {action.subtitle}
                  </p>
                </div>
              </div>
            </div>
            </ScrollEffects>
          );
        })}
      </div>

      {/* Ticket Confirmation Modal */}
      <TicketConfirmationModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      {/* Bold Idea Modal */}
      <BoldIdeaModal
        isOpen={isBoldIdeaModalOpen}
        onClose={() => setIsBoldIdeaModalOpen(false)}
      />
    </>
  );
}

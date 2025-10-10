
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Temporary: Using custom icons until lucide-react is installed
// import { Clock, FileText, Lightbulb } from 'lucide-react';
import { Clock, FileText, Lightbulb, User } from '@/components/icons';
import { mockQuickActions } from '@/lib/mock-data';
import TicketConfirmationModal from '@/components/ui/ticket-confirmation-modal';
import BoldIdeaModal from '@/components/ui/bold-idea-modal';
import TrackTimeModal from '@/components/ui/track-time-modal';
import { ScrollEffects } from '@/components/effects';
// import ScrollReveal from '@/components/effects/scroll-reveal';
// import HolographicText from '@/components/effects/holographic-text';
// import { motion } from 'framer-motion';

const iconMap = {
  Clock,
  Ticket: FileText,
  Lightbulb,
  User
};

export default function QuickActions() {
  const router = useRouter();
  const [isTrackTimeModalOpen, setIsTrackTimeModalOpen] = useState(false);
  const [isITTicketModalOpen, setIsITTicketModalOpen] = useState(false);
  const [isHRTicketModalOpen, setIsHRTicketModalOpen] = useState(false);
  const [isBoldIdeaModalOpen, setIsBoldIdeaModalOpen] = useState(false);

  const handleActionClick = (actionId: number) => {
    console.log(`Quick action ${actionId} clicked`);

    // Handle Track Time action
    if (actionId === 1) {
      setIsTrackTimeModalOpen(true);
      return;
    }

    // Handle Submit IT Ticket action
    if (actionId === 2) {
      setIsITTicketModalOpen(true);
      return;
    }

    // Handle Submit HR Ticket action
    if (actionId === 3) {
      setIsHRTicketModalOpen(true);
      return;
    }

    // Handle Submit Bold Idea action
    if (actionId === 4) {
      setIsBoldIdeaModalOpen(true);
      return;
    }

    // Add your other action handling logic here
  };

  return (
    <>
      <div className="flex gap-4 mb-8 max-w-4xl">
        {mockQuickActions.map((action, index) => {
          const Icon = iconMap[action.icon as keyof typeof iconMap];

          return (
            <ScrollEffects
              key={action.id}
              effect="fadeUp"
              delay={index * 0.2}
            >
              <div
                className={`${action.color} border rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2 h-full flex-1 max-w-xs`}
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex items-start space-x-3">
                <div className={`p-3 rounded-xl ${
                  action.icon === 'Clock' ? 'bg-green-100' :
                  action.icon === 'Ticket' ? 'bg-blue-100' :
                  action.icon === 'User' ? 'bg-red-100' :
                  action.icon === 'Lightbulb' ? 'bg-yellow-100' : 'bg-gray-100'
                } group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className={`h-6 w-6 ${
                    action.icon === 'Clock' ? 'text-green-600' :
                    action.icon === 'Ticket' ? 'text-blue-600' :
                    action.icon === 'User' ? 'text-red-600' :
                    action.icon === 'Lightbulb' ? 'text-yellow-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.subtitle}
                  </p>
                </div>
              </div>
            </div>
            </ScrollEffects>
          );
        })}
      </div>

      {/* Track Time Modal */}
      <TrackTimeModal
        isOpen={isTrackTimeModalOpen}
        onClose={() => setIsTrackTimeModalOpen(false)}
      />

      {/* IT Ticket Confirmation Modal */}
      <TicketConfirmationModal
        isOpen={isITTicketModalOpen}
        onClose={() => setIsITTicketModalOpen(false)}
      />

      {/* HR Ticket Confirmation Modal */}
      <TicketConfirmationModal
        isOpen={isHRTicketModalOpen}
        onClose={() => setIsHRTicketModalOpen(false)}
      />

      {/* Bold Idea Modal */}
      <BoldIdeaModal
        isOpen={isBoldIdeaModalOpen}
        onClose={() => setIsBoldIdeaModalOpen(false)}
      />

    </>
  );
}

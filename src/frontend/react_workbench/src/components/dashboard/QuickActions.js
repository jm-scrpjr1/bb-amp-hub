import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Lightbulb, User } from 'lucide-react';
import { ScrollEffects } from '../effects';

const iconMap = {
  Clock,
  Ticket: FileText,
  Lightbulb,
  User
};

// Mock quick actions data
const mockQuickActions = [
  {
    id: 1,
    title: 'Track My Time',
    subtitle: 'Log hours across multiple platforms',
    icon: 'Clock',
    color: 'bg-white'
  },
  {
    id: 2,
    title: 'Submit IT Ticket',
    subtitle: 'Get technical support quickly',
    icon: 'Ticket',
    color: 'bg-white'
  },
  {
    id: 3,
    title: 'Submit HR Ticket',
    subtitle: 'HR support and assistance',
    icon: 'User',
    color: 'bg-white'
  },
  {
    id: 4,
    title: 'Submit Bold Idea',
    subtitle: 'Share innovative suggestions',
    icon: 'Lightbulb',
    color: 'bg-white'
  }
];

const QuickActions = () => {
  const navigate = useNavigate();
  const [isTrackTimeModalOpen, setIsTrackTimeModalOpen] = useState(false);
  const [isITTicketModalOpen, setIsITTicketModalOpen] = useState(false);
  const [isHRTicketModalOpen, setIsHRTicketModalOpen] = useState(false);
  const [isBoldIdeaModalOpen, setIsBoldIdeaModalOpen] = useState(false);

  const handleActionClick = (actionId, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`Quick action ${actionId} clicked`);

    // Handle Track Time action
    if (actionId === 1) {
      // Dispatch event to open track time modal
      const event = new CustomEvent('openTrackTimeModal');
      window.dispatchEvent(event);
      return;
    }

    // Handle Submit IT Ticket action
    if (actionId === 2) {
      // Dispatch event to open IT ticket modal
      const event = new CustomEvent('openTicketModal', { detail: { type: 'IT' } });
      window.dispatchEvent(event);
      return;
    }

    // Handle Submit HR Ticket action
    if (actionId === 3) {
      // Dispatch event to open HR ticket modal
      const event = new CustomEvent('openTicketModal', { detail: { type: 'HR' } });
      window.dispatchEvent(event);
      return;
    }

    // Handle Submit Bold Idea action
    if (actionId === 4) {
      // Dispatch event to open bold idea modal
      const event = new CustomEvent('openBoldIdeaModal');
      window.dispatchEvent(event);
      return;
    }
  };

  return (
    <div className="flex gap-4 mb-8 max-w-4xl">
      {mockQuickActions.map((action, index) => {
        const Icon = iconMap[action.icon];

        return (
          <ScrollEffects
            key={action.id}
            effect="fadeUp"
            delay={index * 0.2}
          >
            <div
              className={`${action.color} border rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2 h-full flex-1 max-w-xs`}
              onClick={(event) => handleActionClick(action.id, event)}
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
  );
};

export default QuickActions;

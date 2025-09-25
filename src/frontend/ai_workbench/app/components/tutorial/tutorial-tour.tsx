
"use client";

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI Workbench!',
    content: 'This is your AI-powered workspace where you can manage projects, track progress, and collaborate with your team.',
    target: '.welcome-section',
    position: 'bottom'
  },
  {
    id: 'sidebar',
    title: 'Navigation Menu',
    content: 'Use this sidebar to navigate between different sections like AI Agents, Automations, and more.',
    target: '.sidebar',
    position: 'right'
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    content: 'These cards provide quick access to common tasks like time tracking and submitting tickets.',
    target: '.quick-actions',
    position: 'top'
  },
  {
    id: 'bold-updates',
    title: 'Bold Updates',
    content: 'Stay updated with the latest news, product launches, and important announcements.',
    target: '.bold-updates',
    position: 'top'
  },
  {
    id: 'right-sidebar',
    title: 'Trainings & Messages',
    content: 'Monitor your training progress and stay connected with team messages.',
    target: '.right-sidebar',
    position: 'left'
  },
  {
    id: 'activity',
    title: 'Activity Feed',
    content: 'Keep track of recent activities, updates, and team interactions.',
    target: '.activity-section',
    position: 'top'
  }
];

interface TutorialTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialTour({ isOpen, onClose }: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTour = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Tour Card */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {currentTutorialStep?.title}
            </h3>
          </div>
          <button
            onClick={closeTour}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">
            {currentTutorialStep?.content}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
            {currentStep !== tutorialSteps.length - 1 && (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

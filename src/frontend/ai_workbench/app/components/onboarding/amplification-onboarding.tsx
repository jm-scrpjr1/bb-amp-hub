"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Target, Zap, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AmplificationOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AmplificationOnboarding({ isOpen, onClose }: AmplificationOnboardingProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your AI-Amplified Workspace",
      subtitle: "Imagine a world where your talent achieves amplified results",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            {session?.user?.name ? `Hey ${session.user.name.split(' ')[0]}!` : 'Hey there!'} 
            Welcome to a workspace where your talent walks into their desktop, selects and uses AI tools, 
            gets help from a productivity engineer... and achieves amplified results.
          </p>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
            <p className="text-blue-700 font-semibold text-xl">
              Select your tools. Start your work. Ask for help. Get amplified results.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "1. Select Your Tools",
      subtitle: "Choose from our AI-powered toolkit",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Browse our comprehensive AI toolkit designed for every aspect of your work. 
            From assessments to automations, we've got the tools you need.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-blue-600 font-semibold mb-2">🧠 AI Assessments</div>
              <p className="text-sm text-gray-600">Evaluate your AI readiness</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-purple-600 font-semibold mb-2">🤖 AI Agents</div>
              <p className="text-sm text-gray-600">Deploy intelligent assistants</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-green-600 font-semibold mb-2">⚡ Automations</div>
              <p className="text-sm text-gray-600">Streamline your workflows</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-orange-600 font-semibold mb-2">📚 Resources</div>
              <p className="text-sm text-gray-600">Access learning materials</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Start Your Work",
      subtitle: "Begin your projects with confidence",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Jump into your projects with the confidence that comes from having the right tools at your fingertips. 
            Our intuitive interface makes it easy to get started.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3">Quick Start Options:</h4>
            <div className="space-y-2 text-left">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Take an AI Assessment to understand your readiness</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Submit a Bold Idea to get started with innovation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Explore AI Agents to automate your tasks</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Ask for Help & Get Amplified Results",
      subtitle: "Your productivity engineer is always ready",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Meet ARIA, your productivity engineer. She's always available to help you navigate, 
            solve problems, and achieve results that exceed your expectations.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">🤖</span>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800">ARIA - Your Productivity Engineer</h4>
                <p className="text-sm text-gray-600">Always ready to help you get amplified results</p>
              </div>
            </div>
            <p className="text-center text-purple-700 font-semibold">
              Look for the floating chat icon to get instant help anytime! 💬
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

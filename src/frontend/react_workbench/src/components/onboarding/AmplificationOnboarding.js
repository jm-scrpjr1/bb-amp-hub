import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Target, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

const AmplificationOnboarding = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to AI Workbench!",
      subtitle: "Your AI-amplified productivity platform",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Welcome to your AI-amplified workspace! We're here to help you achieve more 
            with the power of artificial intelligence at your fingertips.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🚀 Ready to get amplified?</h4>
            <p className="text-blue-700">
              Let's take a quick tour to show you how AI can transform your productivity!
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
      title: "2. Deploy & Customize",
      subtitle: "Make AI work for your specific needs",
      content: (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Each tool can be customized to fit your workflow perfectly. Set up automations, 
            configure AI agents, and create prompts that work exactly how you need them to.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            <h4 className="font-semibold text-green-900 mb-2">⚙️ Customization Made Easy</h4>
            <p className="text-green-700">
              No coding required! Our intuitive interface lets you configure everything with simple clicks.
            </p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
            </div>
            <h4 className="font-semibold text-purple-900 mb-2">🤖 ARIA - Your AI Assistant</h4>
            <p className="text-purple-700 mb-4">
              Just ask! "Help me set up automation" or "Show me the best prompts for my task"
            </p>
            <div className="text-sm text-purple-600 bg-white rounded-lg p-3 border border-purple-200">
              💬 Try saying: "I need help with time tracking" or "Show me AI agents for marketing"
            </div>
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
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
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
                Previous
              </button>
            )}
            <button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmplificationOnboarding;

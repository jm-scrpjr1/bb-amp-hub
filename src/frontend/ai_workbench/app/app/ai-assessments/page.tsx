
"use client";

import React, { useState } from 'react';
import { Brain, Target, Zap, TrendingUp, Users, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AIAssessmentSimple from '@/components/assessment/ai-assessment-simple';

export default function AIAssessmentsPage() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [completedAssessment, setCompletedAssessment] = useState(false);

  const handleStartAssessment = () => {
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (result: any) => {
    setCompletedAssessment(true);
    console.log('Assessment completed:', result);
  };

  const handleAssessmentCancel = () => {
    setShowAssessment(false);
  };

  if (showAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
        <div className="container mx-auto px-4">
          <AIAssessmentSimple
            onComplete={handleAssessmentComplete}
            onCancel={handleAssessmentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button - Enhanced */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all hover:scale-105 shadow-sm hover:shadow-md group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="font-medium text-gray-700 group-hover:text-blue-700">Back to Main Page</span>
            </Link>
          </div>

          <div className="text-center max-w-4xl mx-auto opacity-0 animate-fade-in">
            {/* AI-Powered Icon with Glow Effect */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-2xl">
                  <Brain className="w-16 h-16 text-white animate-pulse" />
                  {/* AI Circuit Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M10,0 L10,10 M0,10 L20,10" stroke="white" strokeWidth="0.5" fill="none"/>
                          <circle cx="10" cy="10" r="1" fill="white"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#circuit)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              AI Readiness Assessment
            </h1>

            <div className="relative">
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                🚀 <span className="font-semibold text-gray-800">Unlock your AI potential</span> with our intelligent assessment system.
                Powered by advanced algorithms, we'll analyze your knowledge, technical readiness, and strategic
                thinking to create your <span className="text-blue-600 font-semibold">personalized AI roadmap</span>.
              </p>

              {/* AI Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute -top-2 -right-8 w-6 h-6 bg-cyan-400 rounded-full opacity-30 animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-4 left-1/4 w-4 h-4 bg-purple-400 rounded-full opacity-25 animate-bounce" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative">
              <button
                onClick={handleStartAssessment}
                className="relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white text-xl font-bold rounded-2xl overflow-hidden group shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                <div className="relative flex items-center">
                  <Target className="w-7 h-7 mr-3 animate-pulse" />
                  <span>🤖 Start Your AI Assessment</span>
                  <div className="ml-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </button>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-xl opacity-30 -z-10 animate-pulse"></div>
            </div>

            <div className="flex justify-center items-center space-x-8 mt-6 text-sm">
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                ⏱️ 5-7 minutes
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                🔒 AI-Secured
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                🤖 Instant AI Analysis
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-200/30 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200/30 rounded-full blur-xl" />
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            🧠 What Our AI Will Discover About You
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our advanced AI assessment engine analyzes your responses using machine learning algorithms to provide
            <span className="text-blue-600 font-semibold"> deep insights</span> into your readiness across multiple dimensions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Brain,
              title: "AI Knowledge Level",
              description: "Evaluate your understanding of AI concepts, technologies, and applications",
              color: "blue"
            },
            {
              icon: Zap,
              title: "Technical Readiness",
              description: "Assess your ability to implement and work with AI tools and platforms",
              color: "purple"
            },
            {
              icon: TrendingUp,
              title: "Strategic Thinking",
              description: "Measure how well you can align AI initiatives with business objectives",
              color: "green"
            },
            {
              icon: Users,
              title: "Implementation Skills",
              description: "Gauge your capability to lead and execute AI transformation projects",
              color: "orange"
            },
            {
              icon: Award,
              title: "Innovation Mindset",
              description: "Determine your openness to experimentation and continuous learning",
              color: "cyan"
            },
            {
              icon: Target,
              title: "Personalized Roadmap",
              description: "Receive tailored recommendations and next steps for your AI journey",
              color: "pink"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={`p-3 bg-${feature.color}-100 rounded-xl w-fit mb-4`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 rounded-3xl p-12 text-center text-white overflow-hidden">
          {/* AI Neural Network Background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <pattern id="neural" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="white" opacity="0.5"/>
                  <line x1="20" y1="20" x2="40" y2="20" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                  <line x1="20" y1="20" x2="20" y2="40" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#neural)"/>
            </svg>
          </div>

          <div>
            <h2 className="text-4xl font-bold mb-4">
              🚀 Ready to Unlock Your AI Potential?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join <span className="font-bold text-yellow-300">thousands of professionals</span> who have discovered their AI readiness
              and <span className="font-bold text-cyan-200">accelerated their careers</span> with our AI-powered insights
            </p>
          </div>

          <button
            onClick={handleStartAssessment}
            className="relative inline-flex items-center px-10 py-5 bg-white text-blue-600 text-xl font-bold rounded-2xl overflow-hidden group shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

            <div className="relative flex items-center">
              <Brain className="w-7 h-7 mr-3 text-blue-600" />
              <span className="text-blue-600">🤖 Begin AI Assessment Now</span>
              <div className="ml-3 w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

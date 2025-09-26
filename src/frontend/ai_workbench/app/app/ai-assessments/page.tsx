
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
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
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main Page
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <Brain className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Readiness Assessment
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover your AI potential and get a personalized roadmap for your AI journey.
              Our comprehensive assessment evaluates your knowledge, technical readiness, and strategic thinking.
            </p>

            <motion.button
              onClick={handleStartAssessment}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Target className="w-6 h-6 mr-3" />
              Start Your Assessment
            </motion.button>

            <p className="text-sm text-gray-500 mt-4">
              ⏱️ Takes about 5-7 minutes • 🔒 Completely confidential • 📊 Instant results
            </p>
          </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What You'll Discover
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered assessment provides deep insights into your readiness across multiple dimensions
          </p>
        </motion.div>

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
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Unlock Your AI Potential?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have discovered their AI readiness and accelerated their careers
          </p>

          <motion.button
            onClick={handleStartAssessment}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-6 h-6 mr-3" />
            Begin Assessment Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

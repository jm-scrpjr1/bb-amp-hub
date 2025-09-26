"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Brain, Target, Zap, CheckCircle, AlertCircle, X, Home } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category: 'knowledge' | 'technical' | 'strategic' | 'implementation' | 'innovation';
  type: 'multiple-choice' | 'scale';
  options?: string[];
  scaleRange?: { min: number; max: number; labels: string[] };
}

interface AssessmentResponse {
  questionId: string;
  question: string;
  answer: string;
  category: string;
}

interface AssessmentResult {
  overallScore: number;
  level: string;
  categoryScores: {
    knowledge: number;
    technical: number;
    strategic: number;
    implementation: number;
    innovation: number;
  };
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  nextSteps: string[];
  personalizedMessage: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'How would you describe your current understanding of artificial intelligence?',
    category: 'knowledge',
    type: 'multiple-choice',
    options: [
      'I\'m completely new to AI',
      'I have basic knowledge from articles/videos',
      'I understand core concepts and applications',
      'I have hands-on experience with AI tools',
      'I\'m an AI expert who can implement solutions'
    ]
  },
  {
    id: '2',
    question: 'Which AI technologies are you most familiar with?',
    category: 'technical',
    type: 'multiple-choice',
    options: [
      'None - I\'m just getting started',
      'ChatGPT and basic AI chatbots',
      'Machine learning and data analysis tools',
      'Multiple AI platforms and APIs',
      'Custom AI model development and deployment'
    ]
  },
  {
    id: '3',
    question: 'How do you see AI fitting into your organization\'s strategy?',
    category: 'strategic',
    type: 'multiple-choice',
    options: [
      'Not sure how AI could help us',
      'Could automate some basic tasks',
      'Strategic advantage in key areas',
      'Core to our competitive differentiation',
      'AI-first organization transformation'
    ]
  },
  {
    id: '4',
    question: 'What\'s your experience implementing new technologies?',
    category: 'implementation',
    type: 'multiple-choice',
    options: [
      'I prefer others to handle implementation',
      'I can follow guides with support',
      'I can implement with some guidance',
      'I lead implementation projects',
      'I design and execute complex rollouts'
    ]
  },
  {
    id: '5',
    question: 'How comfortable are you with experimenting and learning new tools?',
    category: 'innovation',
    type: 'scale',
    scaleRange: { 
      min: 1, 
      max: 5, 
      labels: ['Very Uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very Comfortable'] 
    }
  }
];

interface AIAssessmentProps {
  onComplete?: (result: AssessmentResult) => void;
  onCancel?: () => void;
}

export default function AIAssessmentSimple({ onComplete, onCancel }: AIAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = useCallback((answer: string) => {
    const question = ASSESSMENT_QUESTIONS[currentQuestion];
    const response: AssessmentResponse = {
      questionId: question.id,
      question: question.question,
      answer,
      category: question.category
    };

    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === question.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = response;
        return updated;
      }
      return [...prev, response];
    });
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  // Local scoring algorithm
  const calculateScore = useCallback(() => {
    const categoryWeights = {
      knowledge: 0.25,
      technical: 0.25,
      strategic: 0.20,
      implementation: 0.15,
      innovation: 0.15
    };

    const categoryScores: { [key: string]: number[] } = {
      knowledge: [],
      technical: [],
      strategic: [],
      implementation: [],
      innovation: []
    };

    // Calculate scores for each response
    responses.forEach(response => {
      const question = ASSESSMENT_QUESTIONS.find(q => q.id === response.questionId);
      if (!question) return;

      let score = 0;
      
      if (question.type === 'multiple-choice' && question.options) {
        const optionIndex = question.options.indexOf(response.answer);
        score = (optionIndex / (question.options.length - 1)) * 100;
      } else if (question.type === 'scale' && question.scaleRange) {
        const scaleValue = parseInt(response.answer);
        score = ((scaleValue - 1) / (question.scaleRange.max - 1)) * 100;
      }

      categoryScores[question.category].push(score);
    });

    // Calculate average scores for each category
    const avgCategoryScores: { [key: string]: number } = {};
    let overallScore = 0;

    Object.keys(categoryScores).forEach(category => {
      const scores = categoryScores[category];
      if (scores.length > 0) {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        avgCategoryScores[category] = Math.round(avg);
        overallScore += avg * categoryWeights[category as keyof typeof categoryWeights];
      } else {
        avgCategoryScores[category] = 0;
      }
    });

    overallScore = Math.round(overallScore);

    // Determine level based on overall score
    let level = 'Beginner';
    if (overallScore >= 96) level = 'Expert';
    else if (overallScore >= 81) level = 'Advanced';
    else if (overallScore >= 61) level = 'Proficient';
    else if (overallScore >= 41) level = 'Developing';

    return {
      overallScore,
      level,
      categoryScores: {
        knowledge: avgCategoryScores.knowledge || 0,
        technical: avgCategoryScores.technical || 0,
        strategic: avgCategoryScores.strategic || 0,
        implementation: avgCategoryScores.implementation || 0,
        innovation: avgCategoryScores.innovation || 0
      },
      strengths: ['Strong analytical thinking', 'Open to learning'],
      improvementAreas: ['Continue building AI knowledge'],
      recommendations: ['Start with AI fundamentals', 'Practice with AI tools'],
      nextSteps: ['Take an AI course', 'Try ChatGPT for daily tasks'],
      personalizedMessage: `You're at the ${level} level with a score of ${overallScore}. Great potential ahead!`
    };
  }, [responses]);

  const submitAssessment = useCallback(() => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const assessment = calculateScore();
      setResult(assessment);
      setShowResult(true);
      onComplete?.(assessment);
      setIsSubmitting(false);
    }, 1500);
  }, [calculateScore, onComplete]);

  const currentQuestionData = ASSESSMENT_QUESTIONS[currentQuestion];
  const currentResponse = responses.find(r => r.questionId === currentQuestionData?.id);
  const isLastQuestion = currentQuestion === ASSESSMENT_QUESTIONS.length - 1;
  const canProceed = currentResponse?.answer;

  if (showResult && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white relative">
            {/* Back to Main Button - Top Left */}
            <button
              onClick={onCancel}
              className="absolute top-6 left-6 flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all hover:scale-105 text-sm font-medium"
              title="Back to Main Page"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Main
            </button>

            <div className="text-center pt-4">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Your AI Readiness Score</h2>
              <div className="text-6xl font-bold mb-2">{result.overallScore}</div>
              <div className="text-xl opacity-90">{result.level} Level</div>
            </div>
          </div>
          <div className="p-8">
            <p className="text-center text-lg text-gray-700 mb-6">{result.personalizedMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowResult(false);
                  setResult(null);
                  setCurrentQuestion(0);
                  setResponses([]);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Take Assessment Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-blue-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative">
          {/* Cancel Button - Top Right */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors group"
            title="Cancel Assessment"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex justify-between items-center mb-4 pr-12">
            <h2 className="text-2xl font-bold">AI Readiness Assessment</h2>
            <span className="text-sm opacity-90">
              {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </span>
          </div>
          <div className="w-full bg-blue-400/30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            {currentQuestionData.question}
          </h3>

          {currentQuestionData.type === 'multiple-choice' && (
            <div className="space-y-3">
              {currentQuestionData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    currentResponse?.answer === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestionData.type === 'scale' && currentQuestionData.scaleRange && (
            <div className="flex justify-between items-center">
              {currentQuestionData.scaleRange.labels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer((index + 1).toString())}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    currentResponse?.answer === (index + 1).toString()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">{index + 1}</div>
                  <div className="text-xs text-center">{label}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={submitAssessment}
              disabled={!canProceed || isSubmitting}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  Complete Assessment
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={!canProceed}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

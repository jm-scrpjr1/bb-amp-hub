"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Brain, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category: 'knowledge' | 'technical' | 'strategic' | 'implementation' | 'innovation';
  type: 'multiple-choice' | 'scale' | 'text';
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
  },
  {
    id: '6',
    question: 'Which best describes your experience with data analysis and interpretation?',
    category: 'technical',
    type: 'multiple-choice',
    options: [
      'I avoid working with data when possible',
      'I can read basic charts and reports',
      'I\'m comfortable with spreadsheets and simple analysis',
      'I use advanced analytics tools regularly',
      'I design complex data models and algorithms'
    ]
  },
  {
    id: '7',
    question: 'How do you approach learning about new AI developments?',
    category: 'innovation',
    type: 'multiple-choice',
    options: [
      'I wait for others to tell me what\'s important',
      'I occasionally read AI news when it\'s trending',
      'I follow AI developments through regular sources',
      'I actively seek out and test new AI tools',
      'I contribute to AI communities and research'
    ]
  },
  {
    id: '8',
    question: 'What\'s your biggest concern about implementing AI in your work?',
    category: 'strategic',
    type: 'multiple-choice',
    options: [
      'I don\'t see the value or need for AI',
      'Worried about job security and replacement',
      'Concerned about cost and complexity',
      'Ensuring data privacy and ethical use',
      'Keeping up with rapid technological changes'
    ]
  },
  {
    id: '9',
    question: 'How would you rate your ability to identify AI use cases in your field?',
    category: 'strategic',
    type: 'scale',
    scaleRange: {
      min: 1,
      max: 5,
      labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
    }
  },
  {
    id: '10',
    question: 'What\'s your experience with project management and change leadership?',
    category: 'implementation',
    type: 'multiple-choice',
    options: [
      'I prefer to be a team member, not a leader',
      'I can manage small projects with guidance',
      'I successfully lead projects within my expertise',
      'I manage complex, cross-functional initiatives',
      'I drive organizational transformation programs'
    ]
  }
];

interface AIReadinessAssessmentProps {
  onComplete?: (result: AssessmentResult) => void;
}

export default function AIReadinessAssessment({ onComplete }: AIReadinessAssessmentProps) {
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
        // Score based on option index (0-4 becomes 0-100)
        const optionIndex = question.options.indexOf(response.answer);
        score = (optionIndex / (question.options.length - 1)) * 100;
      } else if (question.type === 'scale' && question.scaleRange) {
        // Score based on scale value
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

    // Generate insights based on scores
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Analyze strengths (categories with scores >= 70)
    Object.entries(avgCategoryScores).forEach(([category, score]) => {
      if (score >= 70) {
        const categoryNames = {
          knowledge: 'AI Knowledge & Understanding',
          technical: 'Technical Readiness',
          strategic: 'Strategic Thinking',
          implementation: 'Implementation Capability',
          innovation: 'Innovation Mindset'
        };
        strengths.push(`Strong ${categoryNames[category as keyof typeof categoryNames]}`);
      }
    });

    // Analyze improvement areas (categories with scores < 60)
    Object.entries(avgCategoryScores).forEach(([category, score]) => {
      if (score < 60) {
        const categoryNames = {
          knowledge: 'AI Knowledge & Understanding',
          technical: 'Technical Readiness',
          strategic: 'Strategic Thinking',
          implementation: 'Implementation Capability',
          innovation: 'Innovation Mindset'
        };
        improvementAreas.push(`${categoryNames[category as keyof typeof categoryNames]} needs development`);
      }
    });

    // Generate level-specific recommendations
    if (level === 'Beginner') {
      recommendations.push('Start with AI fundamentals courses and online tutorials');
      recommendations.push('Experiment with user-friendly AI tools like ChatGPT');
      recommendations.push('Join AI communities and follow thought leaders');
      nextSteps.push('Complete an AI basics course');
      nextSteps.push('Try 3 different AI tools this month');
      nextSteps.push('Read "AI for People in a Hurry" or similar introductory book');
    } else if (level === 'Developing') {
      recommendations.push('Focus on hands-on experience with AI platforms');
      recommendations.push('Learn about AI ethics and responsible implementation');
      recommendations.push('Start identifying AI use cases in your work');
      nextSteps.push('Complete a practical AI project');
      nextSteps.push('Attend AI workshops or webinars');
      nextSteps.push('Network with AI professionals in your industry');
    } else if (level === 'Proficient') {
      recommendations.push('Lead AI pilot projects in your organization');
      recommendations.push('Develop expertise in specific AI domains');
      recommendations.push('Mentor others beginning their AI journey');
      nextSteps.push('Propose an AI initiative at work');
      nextSteps.push('Obtain AI certification in your field');
      nextSteps.push('Speak at industry events about AI applications');
    } else if (level === 'Advanced') {
      recommendations.push('Drive AI strategy and transformation initiatives');
      recommendations.push('Contribute to AI research and development');
      recommendations.push('Build AI centers of excellence');
      nextSteps.push('Lead organization-wide AI transformation');
      nextSteps.push('Publish thought leadership content');
      nextSteps.push('Advise other organizations on AI adoption');
    } else {
      recommendations.push('Shape the future of AI in your industry');
      recommendations.push('Contribute to AI governance and standards');
      recommendations.push('Mentor the next generation of AI leaders');
      nextSteps.push('Establish AI research partnerships');
      nextSteps.push('Influence AI policy and regulation');
      nextSteps.push('Create innovative AI solutions');
    }

    // Generate personalized message
    const personalizedMessage = `Based on your assessment, you're at the ${level} level with an overall AI readiness score of ${overallScore}. ${
      level === 'Expert' ? 'You\'re an AI thought leader ready to shape the future!' :
      level === 'Advanced' ? 'You have strong AI capabilities and can drive significant initiatives.' :
      level === 'Proficient' ? 'You have solid AI understanding and are ready to lead projects.' :
      level === 'Developing' ? 'You\'re building good AI foundations and ready for hands-on experience.' :
      'You\'re at the beginning of an exciting AI journey with tremendous potential ahead!'
    }`;

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
      strengths: strengths.length > 0 ? strengths : ['Willingness to learn and grow', 'Open to new technologies'],
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Continue building foundational knowledge'],
      recommendations,
      nextSteps,
      personalizedMessage
    };
  }, [responses]);

  const submitAssessment = useCallback(() => {
    setIsSubmitting(true);

    // Simulate processing time for better UX
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

  // Show results screen
  if (showResult && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-blue-200/50 overflow-hidden">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Your AI Readiness Score</h2>
            <div className="text-6xl font-bold mb-2">{result.overallScore}</div>
            <div className="text-xl opacity-90">{result.level} Level</div>
          </div>

          {/* Detailed Results */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Category Scores */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Category Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.categoryScores).map(([category, score]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{category}</span>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Areas for Improvement */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-green-600" />
                  Key Insights
                </h3>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">Growth Areas</h4>
                  <ul className="space-y-1">
                    {result.improvementAreas.map((area, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Personalized Message */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Your Personalized AI Journey</h3>
              <p className="text-blue-700 leading-relaxed">{result.personalizedMessage}</p>
            </div>

            {/* Recommendations & Next Steps */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm p-3 bg-purple-50 rounded-lg border border-purple-200">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <ChevronRight className="w-5 h-5 mr-2 text-cyan-600" />
                  Next Steps
                </h3>
                <ul className="space-y-2">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="text-sm p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <span className="font-semibold text-cyan-700">Step {index + 1}:</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Save Results
              </button>
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
      </motion.div>
    );
  }

  // Main assessment interface
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assessment Progress Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>

            {/* Progress Overview */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Questions Completed</span>
                <span>{responses.length} / {ASSESSMENT_QUESTIONS.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(responses.length / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Category Progress */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Categories</h4>
              {['knowledge', 'technical', 'strategic', 'implementation', 'innovation'].map(category => {
                const categoryResponses = responses.filter(r => r.category === category);
                const categoryQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === category);
                const progress = categoryQuestions.length > 0 ? (categoryResponses.length / categoryQuestions.length) * 100 : 0;

                const categoryNames = {
                  knowledge: 'AI Knowledge',
                  technical: 'Technical Skills',
                  strategic: 'Strategic Thinking',
                  implementation: 'Implementation',
                  innovation: 'Innovation'
                };

                return (
                  <div key={category} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 capitalize">{categoryNames[category as keyof typeof categoryNames]}</span>
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-gray-500 w-8">{Math.round(progress)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Answers Preview */}
            {responses.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Answers</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {responses.slice(-3).reverse().map((response, index) => (
                    <div key={response.questionId} className="text-xs p-2 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-700 mb-1">
                        Q{response.questionId}: {response.question.substring(0, 40)}...
                      </div>
                      <div className="text-gray-600">
                        {response.answer.length > 30 ? response.answer.substring(0, 30) + '...' : response.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Assessment */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-200/50 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
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

        {/* Question Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                {currentQuestionData.question}
              </h3>

              {/* Multiple Choice Options */}
              {currentQuestionData.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestionData.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        currentResponse?.answer === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          currentResponse?.answer === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {currentResponse?.answer === option && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        {option}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Scale Questions */}
              {currentQuestionData.type === 'scale' && currentQuestionData.scaleRange && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    {currentQuestionData.scaleRange.labels.map((label, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer((index + 1).toString())}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          currentResponse?.answer === (index + 1).toString()
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-2xl font-bold mb-1">{index + 1}</div>
                        <div className="text-xs text-center">{label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
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
      </div>
    </div>
  );
}

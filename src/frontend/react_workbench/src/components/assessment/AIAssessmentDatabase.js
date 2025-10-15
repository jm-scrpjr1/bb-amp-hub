import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, CheckCircle, BarChart3, TrendingUp, Target, Lightbulb, Loader2, Award, Star } from 'lucide-react';
import environmentConfig from '../../config/environment';

// API service for assessment using proper environment configuration
const assessmentAPI = {
  async getQuestions(limit = 15) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${environmentConfig.apiUrl}/assessment/questions?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.questions;
  },

  async startSession() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${environmentConfig.apiUrl}/assessment/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.session;
  },

  async saveAnswer(sessionId, questionId, userAnswer, timeSpentSeconds) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${environmentConfig.apiUrl}/assessment/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        questionId,
        userAnswer,
        timeSpentSeconds
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.result;
  },

  async completeAssessment(sessionId) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${environmentConfig.apiUrl}/assessment/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.results;
  }
};

const AIAssessmentDatabase = ({ onComplete, onCancel }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Initialize assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Start session and get questions
        const [sessionData, questionsData] = await Promise.all([
          assessmentAPI.startSession(),
          assessmentAPI.getQuestions(15)
        ]);
        
        setSession(sessionData);
        setQuestions(questionsData);
        setQuestionStartTime(Date.now());
      } catch (err) {
        console.error('Failed to initialize assessment:', err);
        setError('Failed to load assessment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAssessment();
  }, []);

  const handleAnswer = useCallback(async (answer) => {
    if (!session || !questions[currentQuestion]) return;

    const question = questions[currentQuestion];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    try {
      // Save answer to database
      await assessmentAPI.saveAnswer(session.sessionId, question.id, answer, timeSpent);
      
      // Update local responses
      setResponses(prev => ({
        ...prev,
        [question.id]: answer
      }));
    } catch (err) {
      console.error('Failed to save answer:', err);
      // Continue anyway - we'll handle this gracefully
    }
  }, [session, questions, currentQuestion, questionStartTime]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion]);

  const submitAssessment = useCallback(async () => {
    if (!session) return;

    setIsSubmitting(true);
    try {
      const results = await assessmentAPI.completeAssessment(session.sessionId);
      setResult(results);
      setShowResult(true);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [session]);

  const renderQuestion = () => {
    if (!questions[currentQuestion]) return null;
    
    const question = questions[currentQuestion];
    const currentAnswer = responses[question.id];

    if (question.questionType === 'multiple_choice') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {question.questionText}
          </h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  currentAnswer === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    currentAnswer === option
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {currentAnswer === option && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      );
    } else if (question.questionType === 'scale') {
      const scaleLabels = question.scaleLabels || [];
      const scaleMin = question.scaleMin || 1;
      const scaleMax = question.scaleMax || 7;
      
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {question.questionText}
          </h3>
          <div className="space-y-4">
            {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => {
              const value = scaleMin + i;
              const label = scaleLabels[i] || `${value}`;
              
              return (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(value.toString())}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    currentAnswer === value.toString()
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      currentAnswer === value.toString()
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {currentAnswer === value.toString() && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{value}</span>
                    <span className="text-sm text-gray-600 ml-2">- {label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderResults = () => {
    if (!result) return null;

    const getLevelColor = (level) => {
      switch (level) {
        case 'AI Champion': return 'text-green-600 bg-green-100';
        case 'AI Explorer': return 'text-blue-600 bg-blue-100';
        case 'AI Learner': return 'text-yellow-600 bg-yellow-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const getLevelIcon = (level) => {
      switch (level) {
        case 'AI Champion': return <Award className="w-8 h-8" />;
        case 'AI Explorer': return <Target className="w-8 h-8" />;
        case 'AI Learner': return <TrendingUp className="w-8 h-8" />;
        default: return <Lightbulb className="w-8 h-8" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        {/* Score Display */}
        <div className="relative">
          <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{result.percentageScore}%</div>
              <div className="text-sm opacity-90">Score</div>
            </div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="flex justify-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-full ${getLevelColor(result.recommendations.level)}`}>
            {getLevelIcon(result.recommendations.level)}
            <span className="ml-2 font-semibold text-lg">{result.recommendations.level}</span>
          </div>
        </div>

        {/* Personalized Message */}
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 text-lg leading-relaxed">
            {result.recommendations.personalizedMessage}
          </p>
        </div>

        {/* Category Scores */}
        {result.categoryScores && result.categoryScores.length > 0 && (
          <div className="bg-white rounded-lg p-6 border">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Category Breakdown
            </h4>
            <div className="space-y-3">
              {result.categoryScores.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category.categoryName}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-12">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {result.recommendations.nextSteps && result.recommendations.nextSteps.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 text-left">
            <h4 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
              <Target className="w-5 h-5 mr-2" />
              Recommended Next Steps
            </h4>
            <ul className="space-y-2">
              {result.recommendations.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <Star className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-blue-700 text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowResult(false);
              setCurrentQuestion(0);
              setResponses({});
              setResult(null);
              // Restart assessment
              window.location.reload();
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Take Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue to Training
          </motion.button>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Loading AI Assessment</h3>
            <p className="text-gray-600">Preparing your personalized questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <X className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Readiness Assessment</h2>
              {!showResult && questions.length > 0 && (
                <p className="text-purple-100 mt-1">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              )}
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {!showResult && questions.length > 0 && (
            <div className="mt-4">
              <div className="bg-purple-400 bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div key="results">
                {renderResults()}
              </motion.div>
            ) : (
              <motion.div key={currentQuestion}>
                {renderQuestion()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!showResult && questions.length > 0 && (
          <div className="border-t bg-gray-50 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  currentQuestion === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="text-sm text-gray-500">
                {questions[currentQuestion]?.categoryName && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                    {questions[currentQuestion].categoryName}
                  </span>
                )}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitAssessment}
                  disabled={isSubmitting || !responses[questions[currentQuestion]?.id]}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                    isSubmitting || !responses[questions[currentQuestion]?.id]
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Assessment
                    </>
                  )}
                </motion.button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={!responses[questions[currentQuestion]?.id]}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    !responses[questions[currentQuestion]?.id]
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIAssessmentDatabase;

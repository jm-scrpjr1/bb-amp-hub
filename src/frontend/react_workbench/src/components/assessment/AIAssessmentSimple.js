import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Brain, Target, Zap, CheckCircle, AlertCircle, X, Home } from 'lucide-react';

const ASSESSMENT_QUESTIONS = [
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

const AIAssessmentSimple = ({ onComplete, onCancel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = useCallback((answer) => {
    const currentQuestionData = ASSESSMENT_QUESTIONS[currentQuestion];
    const newResponse = {
      questionId: currentQuestionData.id,
      question: currentQuestionData.question,
      answer,
      category: currentQuestionData.category
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== currentQuestionData.id);
      return [...filtered, newResponse];
    });
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion]);

  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const calculateScore = useCallback(() => {
    const categoryScores = {};
    const categoryResponses = {};

    // Group responses by category
    responses.forEach(response => {
      if (!categoryResponses[response.category]) {
        categoryResponses[response.category] = [];
      }
      categoryResponses[response.category].push(response);
    });

    // Calculate scores for each category
    Object.keys(categoryResponses).forEach(category => {
      const categoryAnswers = categoryResponses[category];
      let totalScore = 0;

      categoryAnswers.forEach(response => {
        const question = ASSESSMENT_QUESTIONS.find(q => q.id === response.questionId);
        
        if (question.type === 'multiple-choice') {
          const answerIndex = question.options.indexOf(response.answer);
          totalScore += (answerIndex + 1) * 20; // Scale to 0-100
        } else if (question.type === 'scale') {
          totalScore += parseInt(response.answer) * 20; // Scale to 0-100
        }
      });

      categoryScores[category] = Math.round(totalScore / categoryAnswers.length);
    });

    // Calculate overall score
    const scores = Object.values(categoryScores);
    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    // Determine level
    let level;
    if (overallScore >= 80) level = 'Expert';
    else if (overallScore >= 60) level = 'Advanced';
    else if (overallScore >= 40) level = 'Intermediate';
    else if (overallScore >= 20) level = 'Beginner';
    else level = 'Novice';

    return {
      overallScore,
      level,
      categoryScores: {
        knowledge: categoryScores.knowledge || 0,
        technical: categoryScores.technical || 0,
        strategic: categoryScores.strategic || 0,
        implementation: categoryScores.implementation || 0,
        innovation: categoryScores.innovation || 0
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

  if (showResult && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white p-8">
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-sm opacity-90">Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}</div>
            </div>
            <div className="w-9"></div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestionData.question}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQuestionData.type === 'multiple-choice' ? (
              currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    currentResponse?.answer === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{currentQuestionData.scaleRange.labels[0]}</span>
                  <span>{currentQuestionData.scaleRange.labels[currentQuestionData.scaleRange.labels.length - 1]}</span>
                </div>
                <div className="flex justify-between">
                  {Array.from({ length: currentQuestionData.scaleRange.max }, (_, i) => i + 1).map(value => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value.toString())}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        currentResponse?.answer === value.toString()
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={previousQuestion}
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
  );
};

export default AIAssessmentSimple;

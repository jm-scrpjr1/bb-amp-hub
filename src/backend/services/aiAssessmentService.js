const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

class AIAssessmentService {
  // Get random questions for assessment
  static async getRandomQuestions(limit = 15) {
    try {
      // Get questions from each category with some randomization
      const categories = await prisma.$queryRaw`
        SELECT id, name FROM assessment_categories WHERE id IN (
          SELECT category_id FROM assessment_questions WHERE is_active = true
          GROUP BY category_id
        )
      `;

      const questionsPerCategory = Math.ceil(limit / categories.length);
      let allQuestions = [];

      for (const category of categories) {
        const questions = await prisma.$queryRaw`
          SELECT q.*, c.name as category_name, c.weight as category_weight
          FROM assessment_questions q
          JOIN assessment_categories c ON q.category_id = c.id
          WHERE q.category_id = ${category.id} AND q.is_active = true
          ORDER BY RANDOM()
          LIMIT ${questionsPerCategory}
        `;
        allQuestions = allQuestions.concat(questions);
      }

      // Shuffle all questions and limit to requested amount
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);

      return shuffledQuestions.map(q => ({
        id: q.id,
        categoryId: q.category_id,
        categoryName: q.category_name,
        categoryWeight: parseFloat(q.category_weight),
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options,
        scaleMin: q.scale_min,
        scaleMax: q.scale_max,
        scaleLabels: q.scale_labels,
        points: q.points,
        difficultyLevel: q.difficulty_level
      }));
    } catch (error) {
      console.error('Error getting random questions:', error);
      throw new Error('Failed to fetch assessment questions');
    }
  }

  // Start a new assessment session
  static async startAssessmentSession(userId) {
    try {
      const sessionToken = crypto.randomUUID();
      
      const session = await prisma.$queryRaw`
        INSERT INTO user_assessment_sessions (user_id, session_token, started_at)
        VALUES (${userId}, ${sessionToken}, NOW())
        RETURNING *
      `;

      return {
        sessionId: session[0].id,
        sessionToken: session[0].session_token,
        startedAt: session[0].started_at
      };
    } catch (error) {
      console.error('Error starting assessment session:', error);
      throw new Error('Failed to start assessment session');
    }
  }

  // Save user response to a question with proper scoring based on Bold Business system
  static async saveQuestionResponse(sessionId, questionId, userAnswer, timeSpentSeconds = 0) {
    try {
      // Get question details for scoring
      const question = await prisma.$queryRaw`
        SELECT q.*, c.weight as category_weight
        FROM assessment_questions q
        JOIN assessment_categories c ON q.category_id = c.id
        WHERE q.id = ${questionId}
      `;

      if (!question || question.length === 0) {
        throw new Error('Question not found');
      }

      const questionData = question[0];
      let pointsEarned = 0;
      let isContradiction = questionData.points === 0; // Contradiction questions have 0 points

      // Calculate points based on question type and Bold Business scoring system
      if (questionData.question_type === 'multiple_choice') {
        const options = questionData.options;
        const answerIndex = options.indexOf(userAnswer);

        if (answerIndex >= 0) {
          // Bold Business scoring: Best response = 5 pts, acceptable = 3 pts, weak = 1 pt, poor = 0
          if (answerIndex === options.length - 1) pointsEarned = 5; // Best response (last option)
          else if (answerIndex === options.length - 2) pointsEarned = 3; // Acceptable response
          else if (answerIndex === 0) pointsEarned = 0; // Poor response (first option)
          else pointsEarned = 1; // Weak response (middle options)
        }
      } else if (questionData.question_type === 'scale') {
        const scaleValue = parseInt(userAnswer);
        if (scaleValue >= questionData.scale_min && scaleValue <= questionData.scale_max) {
          if (isContradiction) {
            // Reverse scoring for contradiction questions (1-7 scale becomes 7-1)
            pointsEarned = questionData.scale_max + questionData.scale_min - scaleValue;
          } else {
            // Normal scoring: convert 1-7 scale to 1-5 points
            const normalizedScore = ((scaleValue - questionData.scale_min) / (questionData.scale_max - questionData.scale_min)) * 4 + 1;
            pointsEarned = Math.round(normalizedScore);
          }
        }
      }

      // Apply category weight (40% for Likert, 40% for Trade-off/Scenario, handled in final calculation)
      const weightedPoints = Math.round(pointsEarned * parseFloat(questionData.category_weight));

      // Save response
      await prisma.$queryRaw`
        INSERT INTO user_question_responses (session_id, question_id, user_answer, points_earned, time_spent_seconds)
        VALUES (${sessionId}, ${questionId}, ${userAnswer}, ${weightedPoints}, ${timeSpentSeconds})
        ON CONFLICT (session_id, question_id)
        DO UPDATE SET
          user_answer = ${userAnswer},
          points_earned = ${weightedPoints},
          time_spent_seconds = ${timeSpentSeconds},
          answered_at = NOW()
      `;

      return {
        questionId,
        pointsEarned: weightedPoints,
        maxPoints: Math.round(5 * parseFloat(questionData.category_weight)), // Max 5 points per question
        isContradiction
      };
    } catch (error) {
      console.error('Error saving question response:', error);
      throw new Error('Failed to save question response');
    }
  }

  // Complete assessment and calculate final score
  static async completeAssessment(sessionId) {
    try {
      // Calculate total score
      const scoreData = await prisma.$queryRaw`
        SELECT 
          SUM(r.points_earned) as total_score,
          SUM(q.points * c.weight) as max_possible_score,
          COUNT(*) as questions_answered
        FROM user_question_responses r
        JOIN assessment_questions q ON r.question_id = q.id
        JOIN assessment_categories c ON q.category_id = c.id
        WHERE r.session_id = ${sessionId}
      `;

      const totalScore = parseInt(scoreData[0].total_score) || 0;
      const maxPossibleScore = parseInt(scoreData[0].max_possible_score) || 1;
      const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

      // Determine AI readiness level
      let aiReadinessLevel;
      if (percentageScore >= 80) aiReadinessLevel = 'Expert';
      else if (percentageScore >= 65) aiReadinessLevel = 'Advanced';
      else if (percentageScore >= 50) aiReadinessLevel = 'Intermediate';
      else if (percentageScore >= 35) aiReadinessLevel = 'Beginner';
      else aiReadinessLevel = 'Novice';

      // Update session with final scores
      await prisma.$queryRaw`
        UPDATE user_assessment_sessions 
        SET 
          completed_at = NOW(),
          total_score = ${totalScore},
          max_possible_score = ${maxPossibleScore},
          percentage_score = ${percentageScore},
          ai_readiness_level = ${aiReadinessLevel},
          status = 'completed'
        WHERE id = ${sessionId}
      `;

      // Calculate category scores
      const categoryScores = await this.calculateCategoryScores(sessionId);

      // Generate recommendations
      const recommendations = this.generateRecommendations(percentageScore, categoryScores);

      // Save assessment results
      await this.saveAssessmentResults(sessionId, categoryScores, recommendations);

      // Save to history
      const session = await prisma.$queryRaw`
        SELECT user_id FROM user_assessment_sessions WHERE id = ${sessionId}
      `;
      
      if (session.length > 0) {
        await this.saveAssessmentHistory(session[0].user_id, sessionId, totalScore, percentageScore, aiReadinessLevel);
      }

      return {
        sessionId,
        totalScore,
        maxPossibleScore,
        percentageScore,
        aiReadinessLevel,
        categoryScores,
        recommendations,
        questionsAnswered: parseInt(scoreData[0].questions_answered)
      };
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw new Error('Failed to complete assessment');
    }
  }

  // Calculate scores by category
  static async calculateCategoryScores(sessionId) {
    try {
      const categoryScores = await prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.weight,
          SUM(r.points_earned) as category_score,
          SUM(q.points * c.weight) as category_max_score,
          COUNT(*) as questions_count
        FROM user_question_responses r
        JOIN assessment_questions q ON r.question_id = q.id
        JOIN assessment_categories c ON q.category_id = c.id
        WHERE r.session_id = ${sessionId}
        GROUP BY c.id, c.name, c.weight
        ORDER BY c.id
      `;

      return categoryScores.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        weight: parseFloat(cat.weight),
        score: parseInt(cat.category_score) || 0,
        maxScore: parseInt(cat.category_max_score) || 1,
        percentage: Math.round(((parseInt(cat.category_score) || 0) / (parseInt(cat.category_max_score) || 1)) * 100),
        questionsCount: parseInt(cat.questions_count)
      }));
    } catch (error) {
      console.error('Error calculating category scores:', error);
      return [];
    }
  }

  // Generate personalized recommendations based on Bold Business scoring bands
  static generateRecommendations(overallScore, categoryScores) {
    const recommendations = {
      strengths: [],
      improvementAreas: [],
      nextSteps: [],
      personalizedMessage: '',
      level: '',
      levelDescription: ''
    };

    // Bold Business AI Readiness Levels
    if (overallScore >= 80) {
      recommendations.level = 'AI Champion';
      recommendations.levelDescription = 'High readiness. Can lead AI adoption and mentor peers.';
      recommendations.nextSteps = [
        'Lead AI transformation initiatives in your organization',
        'Mentor colleagues in AI adoption and best practices',
        'Explore cutting-edge AI applications for competitive advantage',
        'Develop AI governance and ethics frameworks',
        'Build strategic partnerships with AI vendors'
      ];
    } else if (overallScore >= 65) {
      recommendations.level = 'AI Explorer';
      recommendations.levelDescription = 'Strong potential. Comfortable with AI, needs some role-specific upskilling.';
      recommendations.nextSteps = [
        'Take on AI pilot projects in your department',
        'Deepen technical skills in specific AI tools',
        'Build AI strategy for your team or function',
        'Network with AI professionals and communities',
        'Experiment with advanced AI features and integrations'
      ];
    } else if (overallScore >= 50) {
      recommendations.level = 'AI Learner';
      recommendations.levelDescription = 'Growth mindset present, but technical/AI gaps. Good candidate for structured training.';
      recommendations.nextSteps = [
        'Complete comprehensive AI fundamentals training',
        'Practice with AI tools daily in your work',
        'Join AI learning communities and forums',
        'Start small AI experiments and document learnings',
        'Seek mentorship from AI Champions in your organization'
      ];
    } else {
      recommendations.level = 'Needs Development';
      recommendations.levelDescription = 'Low readiness across multiple domains. May struggle with Bold\'s AI-Amplified model.';
      recommendations.nextSteps = [
        'Begin with basic digital literacy and tool adoption',
        'Explore AI use cases relevant to your industry',
        'Try user-friendly AI tools with guided tutorials',
        'Read AI success stories and case studies',
        'Attend AI awareness sessions and workshops'
      ];
    }

    // Identify strengths (categories with >70% score)
    const strengths = categoryScores.filter(cat => cat.percentage >= 70);
    recommendations.strengths = strengths.map(cat => {
      const strengthMap = {
        'Willingness to Learn': 'Eager to adopt new technologies',
        'Digital Curiosity': 'Naturally explores digital solutions',
        'Process Thinking': 'Identifies automation opportunities',
        'AI Literacy': 'Comfortable with AI tools and prompting',
        'Problem-Solving': 'Systematic approach to challenges',
        'Communication': 'Effective collaboration and explanation',
        'Growth Mindset': 'Embraces learning from failures'
      };
      return strengthMap[cat.categoryName] || `Strong ${cat.categoryName.toLowerCase()}`;
    });

    // Identify improvement areas (categories with <50% score)
    const weakAreas = categoryScores.filter(cat => cat.percentage < 50);
    recommendations.improvementAreas = weakAreas.map(cat => {
      const improvementMap = {
        'Willingness to Learn': 'Develop openness to new technologies',
        'Digital Curiosity': 'Build habit of exploring digital tools',
        'Process Thinking': 'Learn to identify automation opportunities',
        'AI Literacy': 'Gain hands-on experience with AI tools',
        'Problem-Solving': 'Practice systematic problem breakdown',
        'Communication': 'Improve technical communication skills',
        'Growth Mindset': 'Embrace experimentation and learning from failure'
      };
      return improvementMap[cat.categoryName] || `Develop ${cat.categoryName.toLowerCase()}`;
    });

    // Personalized message based on Bold Business framework
    recommendations.personalizedMessage = `You've achieved ${recommendations.level} status with a score of ${overallScore}%. ${recommendations.levelDescription} ${
      overallScore >= 80 ? 'You\'re ready to drive AI transformation and should focus on strategic leadership.' :
      overallScore >= 65 ? 'You have strong AI potential and should focus on deepening specific skills.' :
      overallScore >= 50 ? 'You show great learning potential and should focus on structured AI training.' :
      'You have room for growth and should start with foundational digital skills.'
    }`;

    return recommendations;
  }

  // Save detailed assessment results
  static async saveAssessmentResults(sessionId, categoryScores, recommendations) {
    try {
      const session = await prisma.$queryRaw`
        SELECT user_id FROM user_assessment_sessions WHERE id = ${sessionId}
      `;

      if (session.length === 0) return;

      const userId = session[0].user_id;

      for (const category of categoryScores) {
        await prisma.$queryRaw`
          INSERT INTO assessment_results (
            session_id, user_id, category_id, category_score, 
            category_max_score, category_percentage, strengths, 
            improvement_areas, recommendations
          )
          VALUES (
            ${sessionId}, ${userId}, ${category.categoryId}, ${category.score},
            ${category.maxScore}, ${category.percentage}, ${JSON.stringify(recommendations.strengths)},
            ${JSON.stringify(recommendations.improvementAreas)}, ${JSON.stringify(recommendations.nextSteps)}
          )
        `;
      }
    } catch (error) {
      console.error('Error saving assessment results:', error);
    }
  }

  // Save assessment to history for tracking improvement
  static async saveAssessmentHistory(userId, sessionId, totalScore, percentageScore, aiReadinessLevel) {
    try {
      // Get previous assessment for improvement calculation
      const previousAssessment = await prisma.$queryRaw`
        SELECT overall_percentage 
        FROM user_assessment_history 
        WHERE user_id = ${userId}
        ORDER BY assessment_date DESC 
        LIMIT 1
      `;

      const improvementFromPrevious = previousAssessment.length > 0 
        ? percentageScore - parseFloat(previousAssessment[0].overall_percentage)
        : 0;

      await prisma.$queryRaw`
        INSERT INTO user_assessment_history (
          user_id, session_id, assessment_date, overall_score, 
          overall_percentage, ai_readiness_level, improvement_from_previous
        )
        VALUES (
          ${userId}, ${sessionId}, CURRENT_DATE, ${totalScore},
          ${percentageScore}, ${aiReadinessLevel}, ${improvementFromPrevious}
        )
      `;
    } catch (error) {
      console.error('Error saving assessment history:', error);
    }
  }

  // Get user's assessment history
  static async getUserAssessmentHistory(userId, limit = 10) {
    try {
      const history = await prisma.$queryRaw`
        SELECT 
          h.*,
          s.completed_at,
          s.session_token
        FROM user_assessment_history h
        JOIN user_assessment_sessions s ON h.session_id = s.id
        WHERE h.user_id = ${userId}
        ORDER BY h.assessment_date DESC
        LIMIT ${limit}
      `;

      return history.map(h => ({
        sessionId: h.session_id,
        assessmentDate: h.assessment_date,
        overallScore: h.overall_score,
        overallPercentage: parseFloat(h.overall_percentage),
        aiReadinessLevel: h.ai_readiness_level,
        improvementFromPrevious: parseFloat(h.improvement_from_previous),
        completedAt: h.completed_at
      }));
    } catch (error) {
      console.error('Error getting user assessment history:', error);
      return [];
    }
  }

  // Get assessment session details
  static async getAssessmentSession(sessionId) {
    try {
      const session = await prisma.$queryRaw`
        SELECT * FROM user_assessment_sessions WHERE id = ${sessionId}
      `;

      if (session.length === 0) {
        throw new Error('Assessment session not found');
      }

      return {
        sessionId: session[0].id,
        userId: session[0].user_id,
        sessionToken: session[0].session_token,
        startedAt: session[0].started_at,
        completedAt: session[0].completed_at,
        totalScore: session[0].total_score,
        maxPossibleScore: session[0].max_possible_score,
        percentageScore: parseFloat(session[0].percentage_score),
        aiReadinessLevel: session[0].ai_readiness_level,
        status: session[0].status
      };
    } catch (error) {
      console.error('Error getting assessment session:', error);
      throw new Error('Failed to get assessment session');
    }
  }
}

module.exports = AIAssessmentService;

-- AI Assessment Questions Seed Data (Clean Version)
-- Based on Bold Business AI Assessment Question Bank

-- Clear existing data
DELETE FROM assessment_questions;
DELETE FROM assessment_categories;

-- Insert categories
INSERT INTO assessment_categories (id, name, description, weight) VALUES
(1, 'Willingness to Learn', 'Actively seeks opportunities to learn new technologies and experiment with tools', 1.0),
(2, 'Digital Curiosity', 'Regularly explores new apps/tools and enjoys discovering digital solutions', 1.0),
(3, 'Process Thinking', 'Identifies opportunities to automate and improve workflows', 1.2),
(4, 'AI Literacy', 'Comfortable using AI tools like ChatGPT/Gemini and designing effective prompts', 1.3),
(5, 'Problem-Solving', 'Breaks down complex problems and tries multiple approaches before giving up', 1.1),
(6, 'Communication', 'Effectively communicates ideas and handles conflicts respectfully', 0.9),
(7, 'Growth Mindset', 'Treats failures as learning opportunities and believes skills can be improved', 1.0)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  weight = EXCLUDED.weight;

-- 1. WILLINGNESS TO LEARN Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(1, 'I actively seek opportunities to learn new technologies, even outside my job scope.', 'scale', 1, 7, 
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]', 
5, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(1, 'I am willing to experiment with new tools before official training is provided.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(1, 'A new AI tool is introduced at your workplace. What do you do?', 'multiple_choice',
'["Test it immediately to understand its capabilities", "Wait for official training before using it", "Stick with the old method until forced to change"]',
5, 'medium');

-- 2. DIGITAL CURIOSITY Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(2, 'I regularly read about new apps and tools that boost productivity.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(2, 'I often tinker with software features to see what else they can do.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(2, 'A colleague shares a new productivity app they discovered. What do you do?', 'multiple_choice',
'["Research it and try it out myself", "Wait to see how others use it first", "Dismiss it as probably not useful"]',
5, 'easy');

-- 3. PROCESS THINKING Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(3, 'You spot repetitive work in your daily tasks. What do you do?', 'multiple_choice',
'["Look for ways to automate or streamline it", "Discuss with the team to see if others have solutions", "Stick to the established process to avoid issues"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(3, 'A task feels slow and inefficient. What is your approach?', 'multiple_choice',
'["Use AI or other tools to speed it up", "Ask others how they handle it", "Keep doing it the same way to maintain consistency"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(3, 'You are assigned a long, recurring task. What do you do?', 'multiple_choice',
'["Create templates or automation to make it faster", "Follow the same process each time", "Wait for specific orders on how to improve it"]',
5, 'easy');

-- 4. AI LITERACY Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(4, 'I regularly experiment with ChatGPT or Gemini for work tasks.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(4, 'I feel confident designing effective prompts for AI tools.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(4, 'An AI email draft has some errors. What do you do?', 'multiple_choice',
'["Fix the errors and retry with a better prompt", "Fact-check and correct before sending", "Send it anyway since it is mostly correct"]',
5, 'hard');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(4, 'ChatGPT generates information that seems outdated. What is your response?', 'multiple_choice',
'["Fact-check the information before using it", "Use it anyway since AI is usually reliable", "Abandon the tool and do it manually"]',
5, 'hard');

-- 5. PROBLEM-SOLVING Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(5, 'I break down big problems into smaller, manageable tasks.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(5, 'I try multiple approaches before giving up on a problem.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(5, 'You receive a new dataset that needs analysis but you are unfamiliar with the format. What do you do?', 'multiple_choice',
'["Try to figure it out yourself using available tools", "Use AI to help analyze and verify the results", "Immediately ask your boss for guidance"]',
5, 'medium');

-- 6. COMMUNICATION Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(6, 'When explaining a complex idea to colleagues, what is your approach?', 'multiple_choice',
'["Tailor the explanation to the audience knowledge level", "Use technical jargon to show expertise", "Keep it vague to avoid confusion"]',
5, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level) VALUES
(6, 'You disagree with a colleague approach to a project. What do you do?', 'multiple_choice',
'["Have a private, respectful conversation about your concerns", "Challenge them publicly in the next meeting", "Stay quiet to avoid conflict"]',
5, 'medium');

-- 7. GROWTH MINDSET Questions
INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(7, 'I treat failures as learning opportunities rather than setbacks.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(7, 'I believe I can improve any skill with practice and effort.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
5, 'medium');

-- CONTRADICTION QUESTIONS (for preventing gaming)
INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(1, 'I usually avoid experimenting with new tools unless forced to use them.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
0, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(2, 'I rarely explore new apps unless they are required for work.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
0, 'easy');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(4, 'AI tools usually complicate work instead of simplifying it.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
0, 'medium');

INSERT INTO assessment_questions (category_id, question_text, question_type, scale_min, scale_max, scale_labels, points, difficulty_level) VALUES
(5, 'I give up quickly on problems I do not understand immediately.', 'scale', 1, 7,
'["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]',
0, 'medium');

-- AI Assessment Database Schema
-- Create tables for AI Assessment questions, user responses, and scoring

-- Assessment Categories
CREATE TABLE IF NOT EXISTS assessment_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES assessment_categories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'scale', 'text')),
    options JSONB, -- For multiple choice options
    scale_min INTEGER, -- For scale questions
    scale_max INTEGER, -- For scale questions
    scale_labels JSONB, -- For scale question labels
    correct_answer TEXT, -- For scoring purposes
    points INTEGER DEFAULT 1,
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Assessment Sessions
CREATE TABLE IF NOT EXISTS user_assessment_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    percentage_score DECIMAL(5,2) DEFAULT 0.0,
    ai_readiness_level VARCHAR(50),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Question Responses
CREATE TABLE IF NOT EXISTS user_question_responses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES user_assessment_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES assessment_questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    points_earned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, question_id)
);

-- Assessment Results Summary
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES user_assessment_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES assessment_categories(id) ON DELETE CASCADE,
    category_score INTEGER DEFAULT 0,
    category_max_score INTEGER DEFAULT 0,
    category_percentage DECIMAL(5,2) DEFAULT 0.0,
    strengths JSONB,
    improvement_areas JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Assessment History (for tracking improvement over time)
CREATE TABLE IF NOT EXISTS user_assessment_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id INTEGER REFERENCES user_assessment_sessions(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    overall_score INTEGER NOT NULL,
    overall_percentage DECIMAL(5,2) NOT NULL,
    ai_readiness_level VARCHAR(50) NOT NULL,
    improvement_from_previous DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_assessment_sessions_user_id ON user_assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_sessions_status ON user_assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_question_responses_session_id ON user_question_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_user_question_responses_question_id ON user_question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_session_id ON assessment_results(session_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_history_user_id ON user_assessment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_history_date ON user_assessment_history(assessment_date);

-- Insert default categories
INSERT INTO assessment_categories (name, description, weight) VALUES
('AI Knowledge', 'Understanding of AI concepts, technologies, and applications', 1.0),
('Technical Skills', 'Ability to implement and work with AI tools and platforms', 1.2),
('Strategic Thinking', 'Capability to align AI initiatives with business objectives', 1.1),
('Implementation Experience', 'Experience in leading and executing technology projects', 1.0),
('Innovation Mindset', 'Openness to experimentation and continuous learning', 0.9)
ON CONFLICT (name) DO NOTHING;

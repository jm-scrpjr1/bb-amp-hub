-- Prompt Execution Logs Table
-- Stores input/output history for each prompt execution

CREATE TABLE IF NOT EXISTS prompt_execution_logs (
    id VARCHAR PRIMARY KEY,
    prompt_id VARCHAR NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
    user_id VARCHAR,
    user_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    execution_time_ms INTEGER,
    model_used VARCHAR(50) DEFAULT 'gpt-4o',
    tokens_used INTEGER,
    had_file_upload BOOLEAN DEFAULT false,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompt_execution_logs_prompt_id ON prompt_execution_logs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_execution_logs_user_id ON prompt_execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_execution_logs_created_at ON prompt_execution_logs(created_at);

-- Comment
COMMENT ON TABLE prompt_execution_logs IS 'Stores execution history for prompt library usage including inputs, outputs, and metadata';


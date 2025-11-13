-- =====================================================
-- AI Assessment Reset & New Question Set Migration
-- Date: 2025-11-13
-- Purpose: Clear old assessment data and insert new 35-question set
-- =====================================================

-- Step 1: Clear all existing assessment data
TRUNCATE TABLE user_question_responses CASCADE;
TRUNCATE TABLE assessment_results CASCADE;
TRUNCATE TABLE user_assessment_history CASCADE;
TRUNCATE TABLE user_assessment_sessions CASCADE;
TRUNCATE TABLE assessment_questions CASCADE;
TRUNCATE TABLE assessment_categories CASCADE;

-- Step 2: Insert new categories with weights
INSERT INTO assessment_categories (id, name, description, weight, display_order) VALUES
(1, 'Willingness to Learn', 'Measures openness to learning new AI tools and adapting to change', 0.15, 1),
(2, 'Digital Curiosity', 'Evaluates proactive exploration of new digital tools and technologies', 0.15, 2),
(3, 'Process Thinking', 'Assesses ability to analyze, optimize, and automate workflows', 0.20, 3),
(4, 'AI Literacy (Baseline)', 'Tests fundamental knowledge of AI tools, prompting, and best practices', 0.10, 4),
(5, 'Problem-Solving Ability', 'Measures analytical thinking and systematic problem resolution', 0.15, 5),
(6, 'Communication Skills', 'Evaluates ability to explain technical concepts and collaborate effectively', 0.15, 6),
(7, 'Growth Mindset', 'Assesses resilience, feedback receptiveness, and continuous improvement', 0.10, 7);

-- Step 3: Insert Willingness to Learn questions (Category 1)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(1, 'Your team implements a new AI tool you''ve never used before. What do you do?', 'multiple_choice', 
'["Stick to old tools and avoid the new AI.", "Learn basics on your own or with colleagues; try it on a small task.", "Wait for someone to explicitly train you before engaging.", "Argue it won''t help and suggest skipping it."]', 
5, 'medium', true),

(1, 'A client rolls out an AI-driven reporting process. Your first step is…', 'multiple_choice',
'["Skim the docs later when time allows.", "Block 30 minutes to read docs and test with a sample report.", "Ask your manager to summarize and tell you what to do.", "Ignore until it becomes mandatory."]',
5, 'medium', true),

(1, 'You notice an AI feature inside a tool you already use.', 'multiple_choice',
'["Disable it so the UI stays the same.", "Open a tutorial and test it on low-risk work.", "Ask someone else to try it and report back.", "Wait for an SOP before touching it."]',
5, 'medium', true),

(1, 'A teammate shares an AI primer course.', 'multiple_choice',
'["Save the link for someday.", "Enroll and set a completion date this week.", "Skim only the first lesson.", "Decline because courses slow you down."]',
5, 'medium', true),

(1, 'You are asked about your openness to AI-led change.', 'multiple_choice',
'["Prefer no change to workflows.", "Open to change and willing to learn quickly.", "Okay with change if fully documented.", "Resistant unless mandated."]',
5, 'easy', true);

-- Step 4: Insert Digital Curiosity questions (Category 2)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(2, 'When you hear about a new app that could improve productivity, what best describes you?', 'multiple_choice',
'["I immediately look it up and try it on a low-risk task.", "I wait until others have tried it and use it if it becomes common.", "I stick with the tools I already know.", "I feel anxious about new tools and avoid them unless required."]',
5, 'easy', true),

(2, 'A new productivity extension promises AI email drafting.', 'multiple_choice',
'["Install and A/B test on low-risk emails.", "Wait for team adoption first.", "Ignore because you have a template already.", "Avoid extensions entirely."]',
5, 'medium', true),

(2, 'Your main tool ships a major update with release notes.', 'multiple_choice',
'["Ignore release notes; keep doing things the old way.", "Skim and share a relevant tip with the team.", "Wait for others to summarize later.", "Disable updates until forced."]',
5, 'medium', true),

(2, 'You hear about a tool that summarizes calls automatically.', 'multiple_choice',
'["Pilot it in one internal meeting.", "Bookmark for later review.", "Ask someone else to read reviews.", "Assume it''s hype and move on."]',
5, 'medium', true),

(2, 'You come across an AI article relevant to your role.', 'multiple_choice',
'["Share a short take with your team channel.", "Save it privately.", "Skim headline only.", "Ignore."]',
5, 'easy', true);

-- Step 5: Insert Process Thinking questions (Category 3)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(3, 'You inherit a 12-step manual workflow.', 'multiple_choice',
'["Document it as-is and continue.", "Map steps, group by function, and flag automation candidates.", "Ask someone else how they''d do it.", "Skip mapping and start executing."]',
5, 'hard', true),

(3, 'Deadlines are tight on a repetitive task.', 'multiple_choice',
'["Work longer hours to keep up.", "Batch tasks and explore an AI template.", "Delegate without changing the process.", "Push deadlines out."]',
5, 'medium', true),

(3, 'Two teams duplicate data entry in two tools.', 'multiple_choice',
'["Accept duplication to avoid change risk.", "Propose an integration/connector and RACI with SLAs.", "Export/import manually weekly.", "Let each team manage separately."]',
5, 'hard', true),

(3, 'Error rate increases on a manual QA task.', 'multiple_choice',
'["Add a second human reviewer.", "Introduce an AI checker with human spot-audits.", "Accept minor errors to move faster.", "Pause the task indefinitely."]',
5, 'medium', true),

(3, 'A request spans multiple teams and tools.', 'multiple_choice',
'["Handle by email CCs.", "Create a shared workflow diagram and RACI.", "Ask manager to coordinate.", "Let each team manage their part separately."]',
5, 'hard', true);

-- Step 6: Insert AI Literacy questions (Category 4)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(4, 'Which statement best describes your experience with ChatGPT or Google Gemini?', 'multiple_choice',
'["I regularly use them (writing, research, brainstorming) and can guide with prompts.", "I''ve tried them a few times for simple queries.", "I''ve heard of them but haven''t really used them.", "I don''t trust or see a use for them in my work."]',
5, 'easy', true),

(4, 'Best practice for prompting?', 'multiple_choice',
'["Give one vague sentence.", "Provide role, goal, constraints, examples, and format.", "Ask the model to \"figure it out.\"", "Paste everything you have without structure."]',
5, 'medium', true),

(4, 'Handling sensitive client data with AI:', 'multiple_choice',
'["Paste raw data into any chatbot.", "Redact and use a company-approved, access-controlled environment.", "Use a personal account for convenience.", "Avoid AI even when a safe option exists."]',
5, 'hard', true),

(4, 'Selecting tools for a task:', 'multiple_choice',
'["Use one general model for everything.", "Choose tools/models based on task (text, vision, agents, automation).", "Pick the cheapest option only.", "Wait for IT to assign."]',
5, 'medium', true),

(4, 'What does good AI output verification look like?', 'multiple_choice',
'["Trust the first result.", "Cross-check sources and test edge cases before using.", "Ask a friend if it seems fine.", "Rerun the same prompt once."]',
5, 'medium', true);

-- Step 7: Insert Problem-Solving questions (Category 5)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(5, 'You must analyze an unfamiliar dataset by end of day.', 'multiple_choice',
'["Clarify goals, break into parts, and use AI to suggest methods or summaries.", "Break it down and do manual analysis only in Excel.", "Ask a supervisor to handle it since it''s new.", "Avoid AI tools and search the web for hours."]',
5, 'hard', true),

(5, 'A solution fails in testing.', 'multiple_choice',
'["Abandon the approach entirely.", "Collect logs, isolate variables, iterate with small changes.", "Ask another team to take over.", "Ship anyway if it works sometimes."]',
5, 'medium', true),

(5, 'You need to prioritize multiple tasks.', 'multiple_choice',
'["Do easiest first.", "Use impact/effort matrix and deadlines to order work.", "Pick what you like most.", "Ask someone else to decide."]',
5, 'medium', true),

(5, 'A recurring defect slips into production.', 'multiple_choice',
'["Create a checklist and an AI guardrail to catch it.", "Remind people to be careful.", "Assign blame.", "Delay releases indefinitely."]',
5, 'hard', true),

(5, 'Stakeholders disagree on requirements.', 'multiple_choice',
'["Proceed with your interpretation.", "Facilitate a brief alignment doc and review.", "Wait until they agree.", "Build two versions."]',
5, 'medium', true);

-- Step 8: Insert Communication Skills questions (Category 6)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(6, 'Explaining an AI workflow to a non-technical client looks like…', 'multiple_choice',
'["Use jargon; they''ll learn.", "Use plain language, diagrams, and a short example.", "Send a long whitepaper.", "Ask someone else to present."]',
5, 'medium', true),

(6, 'Handing off a process to a teammate requires…', 'multiple_choice',
'["Explain verbally once.", "A concise SOP with screenshots/templates.", "A long video without chapters.", "Let them figure it out."]',
5, 'medium', true),

(6, 'A client questions AI accuracy; you…', 'multiple_choice',
'["Get defensive.", "Acknowledge limits; describe controls and QC steps.", "Say it''s perfect now.", "Avoid answering."]',
5, 'hard', true),

(6, 'Proposing automation changes, you provide…', 'multiple_choice',
'["Only the idea.", "Before/after metrics and a rollout plan.", "A meme.", "Ask manager to sell it."]',
5, 'medium', true),

(6, 'Presenting to executives vs. engineers, you…', 'multiple_choice',
'["Reuse one deck for speed.", "Tailor outcomes/risks for execs and technical steps for engineers.", "Send a long whitepaper to both.", "Rely on jargon for speed."]',
5, 'hard', true);

-- Step 9: Insert Growth Mindset questions (Category 7)
INSERT INTO assessment_questions (category_id, question_text, question_type, options, points, difficulty_level, is_active) VALUES
(7, 'You receive constructive feedback on your AI prompts.', 'multiple_choice',
'["Defend your approach.", "Thank them and iterate on a new version.", "Ignore unless mandated.", "Ask them to write the prompts instead."]',
5, 'easy', true),

(7, 'A pilot fails to reach expected ROI.', 'multiple_choice',
'["Cancel AI initiatives.", "Run a retro; adjust scope and try again.", "Hide the results.", "Blame the tool."]',
5, 'medium', true),

(7, 'You''re assigned a stretch learning goal (e.g., Level 2 → 3).', 'multiple_choice',
'["Decline due to workload.", "Create a learning plan with milestones.", "Skim a video and call it done.", "Ask to postpone indefinitely."]',
5, 'medium', true),

(7, 'A colleague shares a better workflow you didn''t know.', 'multiple_choice',
'["Ignore to avoid rework.", "Adopt it and credit them in the SOP.", "Use it silently.", "Argue the old way is fine."]',
5, 'easy', true),

(7, 'You''re asked to mentor a junior on AI basics.', 'multiple_choice',
'["Decline; not your job.", "Share resources and review their first attempts.", "Point them to a link only.", "Tell them to ask someone else."]',
5, 'medium', true);

-- Reset sequences
SELECT setval('assessment_categories_id_seq', (SELECT MAX(id) FROM assessment_categories));
SELECT setval('assessment_questions_id_seq', (SELECT MAX(id) FROM assessment_questions));

-- Verification
SELECT 'Categories inserted:' as status, COUNT(*) as count FROM assessment_categories;
SELECT 'Questions inserted:' as status, COUNT(*) as count FROM assessment_questions;
SELECT 'Questions per category:' as status, category_id, COUNT(*) as count FROM assessment_questions GROUP BY category_id ORDER BY category_id;


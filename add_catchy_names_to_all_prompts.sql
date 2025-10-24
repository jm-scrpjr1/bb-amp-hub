-- Add catchy names to all 44 prompts that don't have them yet
-- Catchy names should be memorable, action-oriented, and fun!

-- ============================================================
-- FINANCE (2 prompts)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'Feedback Insight Analyzer'
WHERE prompt_type = 'Analyze Feedback' AND category = 'Finance';

UPDATE prompt_library 
SET catchy_name = 'Finance Flash Report'
WHERE prompt_type = 'Finance Update Summary' AND category = 'Finance';

-- ============================================================
-- GENERAL USE (22 prompts)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'Workload Balance Checker'
WHERE prompt_type = 'Analyze workload distribution' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Option Comparison Matrix'
WHERE prompt_type = 'Compare options' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = '1:1 Meeting Template Builder'
WHERE prompt_type = 'Create a 1:1 template' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Weekly Success Planner'
WHERE prompt_type = 'Create a weekly plan' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Decision Criteria Definer'
WHERE prompt_type = 'Decision criteria' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Team Health Diagnostician'
WHERE prompt_type = 'Diagnose team health issues' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Daily Priority Organizer'
WHERE prompt_type = 'Document daily priorities' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Burnout Risk Detector'
WHERE prompt_type = 'Identify burnout risk from hours' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Root Cause Investigator'
WHERE prompt_type = 'Identify root cause' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Feedback Framing Coach'
WHERE prompt_type = 'Improve feedback delivery' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Leadership Message Crafter'
WHERE prompt_type = 'Leadership Communication' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Difficult Conversation Prep'
WHERE prompt_type = 'Prepare for a difficult conversation' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Best Option Recommender'
WHERE prompt_type = 'Recommend best option' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Goal Reframing Wizard'
WHERE prompt_type = 'Reframe Goals' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Upskilling Program Finder'
WHERE prompt_type = 'Research effective upskilling programs' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Conflict Resolution Guide'
WHERE prompt_type = 'Resolve a cross-team conflict' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Risk Assessment Analyzer'
WHERE prompt_type = 'Risk assessment' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Strategic Planning Assistant'
WHERE prompt_type = 'Strategic Planning' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Burnout Prevention Planner'
WHERE prompt_type = 'Understand burnout risks and mitigation' AND category = 'General Use';

UPDATE prompt_library 
SET catchy_name = 'Project Update Writer'
WHERE prompt_type = 'Write a project update' AND category = 'General Use';

-- ============================================================
-- HR (2 prompts)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'HR Feedback Analyzer'
WHERE prompt_type = 'Analyze Feedback' AND category = 'HR';

UPDATE prompt_library 
SET catchy_name = 'Policy Document Generator'
WHERE prompt_type = 'Policy Document Prompt' AND category = 'HR';

-- ============================================================
-- IT (1 prompt)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'Architecture Diagram Builder'
WHERE prompt_type = 'Visualize system architecture' AND category = 'IT';

-- ============================================================
-- MARKETING (5 prompts)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'Marketing Feedback Analyzer'
WHERE prompt_type = 'Analyze Feedback' AND category = 'Marketing';

UPDATE prompt_library 
SET catchy_name = 'Brand Message Optimizer'
WHERE prompt_type = 'Brand Positioning' AND category = 'Marketing';

UPDATE prompt_library 
SET catchy_name = 'AI Image Prompt Generator'
WHERE prompt_type = 'Image Generation' AND category = 'Marketing';

UPDATE prompt_library 
SET catchy_name = 'SEO Content Strategist'
WHERE prompt_type = 'SEO Strategy' AND category = 'Marketing';

UPDATE prompt_library 
SET catchy_name = 'Social Media Post Creator'
WHERE prompt_type = 'Social Media Content' AND category = 'Marketing';

-- ============================================================
-- OPERATIONS (8 prompts)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'Operations Feedback Analyzer'
WHERE prompt_type = 'Analyze Feedback' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = '1:1 Template Creator'
WHERE prompt_type = 'Create a 1:1 template' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = 'Space Design Idea Generator'
WHERE prompt_type = 'Design Idea Generator' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = 'Upsell Opportunity Finder'
WHERE prompt_type = 'Identifying Upselling Opportunities' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = 'Interior Design Assistant'
WHERE prompt_type = 'Interior Design Mockup' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = 'Leadership Communicator'
WHERE prompt_type = 'Leadership Communication' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = 'Goal Transformer'
WHERE prompt_type = 'Reframe Goals' AND category = 'Operations';

UPDATE prompt_library 
SET catchy_name = 'Strategy Planning Pro'
WHERE prompt_type = 'Strategic Planning' AND category = 'Operations';

-- ============================================================
-- SALES (6 prompts)
-- ============================================================

UPDATE prompt_library 
SET catchy_name = 'Sales Feedback Analyzer'
WHERE prompt_type = 'Analyze Feedback' AND category = 'Sales';

UPDATE prompt_library 
SET catchy_name = 'Email Nurture Sequence Builder'
WHERE prompt_type = 'Email Campaign' AND category = 'Sales';

UPDATE prompt_library 
SET catchy_name = 'Finance Summary Generator'
WHERE prompt_type = 'Finance Update Summary' AND category = 'Sales';

UPDATE prompt_library 
SET catchy_name = 'Upsell Opportunity Scout'
WHERE prompt_type = 'Identifying Upselling Opportunities' AND category = 'Sales';

UPDATE prompt_library 
SET catchy_name = 'Visual Content Generator'
WHERE prompt_type = 'Image Generation' AND category = 'Sales';

UPDATE prompt_library 
SET catchy_name = 'Sales Email Quality Checker'
WHERE prompt_type = 'Sales Outreach Email Quality Evaluator' AND category = 'Sales';

-- ============================================================
-- VERIFY ALL PROMPTS NOW HAVE CATCHY NAMES
-- ============================================================

SELECT 
  category, 
  COUNT(*) as total_prompts,
  COUNT(CASE WHEN catchy_name IS NOT NULL AND catchy_name != '' THEN 1 END) as with_catchy_names,
  COUNT(*) - COUNT(CASE WHEN catchy_name IS NOT NULL AND catchy_name != '' THEN 1 END) as without_catchy_names
FROM prompt_library 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;

-- Show sample of newly added catchy names
SELECT category, catchy_name, prompt_type
FROM prompt_library 
WHERE is_active = true 
  AND catchy_name IN (
    'Feedback Insight Analyzer', 'Finance Flash Report', 'Workload Balance Checker',
    'Option Comparison Matrix', '1:1 Meeting Template Builder', 'Weekly Success Planner',
    'Decision Criteria Definer', 'Team Health Diagnostician', 'Daily Priority Organizer',
    'Burnout Risk Detector', 'Root Cause Investigator', 'Feedback Framing Coach',
    'Leadership Message Crafter', 'Difficult Conversation Prep', 'Best Option Recommender',
    'Goal Reframing Wizard', 'Upskilling Program Finder', 'Conflict Resolution Guide',
    'Risk Assessment Analyzer', 'Strategic Planning Assistant', 'Burnout Prevention Planner',
    'Project Update Writer', 'HR Feedback Analyzer', 'Policy Document Generator',
    'Architecture Diagram Builder', 'Marketing Feedback Analyzer', 'Brand Message Optimizer',
    'AI Image Prompt Generator', 'SEO Content Strategist', 'Social Media Post Creator',
    'Operations Feedback Analyzer', '1:1 Template Creator', 'Space Design Idea Generator',
    'Upsell Opportunity Finder', 'Interior Design Assistant', 'Leadership Communicator',
    'Goal Transformer', 'Strategy Planning Pro', 'Sales Feedback Analyzer',
    'Email Nurture Sequence Builder', 'Finance Summary Generator', 'Upsell Opportunity Scout',
    'Visual Content Generator', 'Sales Email Quality Checker'
  )
ORDER BY category, catchy_name;


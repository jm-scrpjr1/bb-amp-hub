-- Update descriptions for newly catchy-named prompts to use emoji + "Provide:" format
-- This makes them consistent with the other 26 prompts that already had catchy names

-- ============================================================
-- FINANCE (2 prompts)
-- ============================================================

UPDATE prompt_library 
SET description = '💬 Provide: (1) Customer feedback, survey results, or reviews (e.g., "NPS survey responses"), (2) Key metrics to analyze. The AI will identify patterns and provide actionable insights.'
WHERE catchy_name = 'Feedback Insight Analyzer' AND category = 'Finance';

UPDATE prompt_library 
SET description = '📊 Provide: (1) Financial data or reports (e.g., "Q4 revenue, expenses, profit margins"), (2) Target audience (executives/board/team). The AI will create an executive summary for stakeholders.'
WHERE catchy_name = 'Finance Flash Report' AND category = 'Finance';

-- ============================================================
-- GENERAL USE (22 prompts)
-- ============================================================

UPDATE prompt_library 
SET description = '⚖️ Provide: (1) Team workload distribution (e.g., "5 projects across 3 people"), (2) Team member roles/capacity. The AI will analyze balance and suggest adjustments.'
WHERE catchy_name = 'Workload Balance Checker' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🔀 Provide: (1) Options you''re considering (e.g., "Salesforce vs HubSpot vs Pipedrive"), (2) Key comparison criteria. The AI will compare them across key dimensions.'
WHERE catchy_name = 'Option Comparison Matrix' AND category = 'General Use';

UPDATE prompt_library 
SET description = '👥 Provide: (1) Meeting type (e.g., "manager-employee check-in"), (2) Meeting frequency, (3) Key topics to cover. The AI will create a structured template with discussion topics.'
WHERE catchy_name = '1:1 Meeting Template Builder' AND category = 'General Use';

UPDATE prompt_library 
SET description = '📅 Provide: (1) Your goals and commitments for the week (e.g., "finish Q1 report, 3 client calls, team training"), (2) Available time/constraints. The AI will create a structured weekly plan.'
WHERE catchy_name = 'Weekly Success Planner' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🎯 Provide: (1) Decision you need to make (e.g., "choosing a new project management tool"), (2) Stakeholders involved. The AI will help you define decision criteria.'
WHERE catchy_name = 'Decision Criteria Definer' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🩺 Provide: (1) Team symptoms (e.g., "low morale, missed deadlines, high turnover"), (2) Team size/structure, (3) Recent changes. The AI will diagnose potential root causes.'
WHERE catchy_name = 'Team Health Diagnostician' AND category = 'General Use';

UPDATE prompt_library 
SET description = '📝 Provide: (1) Your tasks for the day (e.g., "client meeting, code review, budget planning"), (2) Time available, (3) Deadlines. The AI will help you prioritize and document them.'
WHERE catchy_name = 'Daily Priority Organizer' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🚨 Provide: (1) Team work hours data or patterns (e.g., "3 team members working 60+ hours/week"), (2) Team size, (3) Project deadlines. The AI will identify burnout risks.'
WHERE catchy_name = 'Burnout Risk Detector' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🔍 Provide: (1) Problem you''re investigating (e.g., "customer churn increased 20% last quarter"), (2) Available data/context. The AI will help identify root causes.'
WHERE catchy_name = 'Root Cause Investigator' AND category = 'General Use';

UPDATE prompt_library 
SET description = '💬 Provide: (1) Specific feedback you need to deliver (e.g., "missed deadline on Q4 report"), (2) Recipient context, (3) Desired outcome. The AI will help you frame it constructively and professionally.'
WHERE catchy_name = 'Feedback Framing Coach' AND category = 'General Use';

UPDATE prompt_library 
SET description = '📢 Provide: (1) Leadership message you need to communicate (e.g., "announcing organizational changes"), (2) Audience (team/company/board), (3) Key points. The AI will help you craft clear, inspiring communication.'
WHERE catchy_name = 'Leadership Message Crafter' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🗣️ Provide: (1) Difficult conversation topic (e.g., "performance issues with team member"), (2) Relationship context, (3) Desired outcome. The AI will provide a structured approach and talking points.'
WHERE catchy_name = 'Difficult Conversation Prep' AND category = 'General Use';

UPDATE prompt_library 
SET description = '✅ Provide: (1) Options and your decision criteria (e.g., "3 vendors, need best ROI and support"), (2) Constraints (budget/timeline). The AI will recommend the best option with reasoning.'
WHERE catchy_name = 'Best Option Recommender' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🎯 Provide: (1) Your current goals (e.g., "increase sales by 20%"), (2) Challenges you''re facing, (3) Timeline. The AI will help you reframe them to be more achievable and motivating.'
WHERE catchy_name = 'Goal Reframing Wizard' AND category = 'General Use';

UPDATE prompt_library 
SET description = '📚 Provide: (1) Skills you want to develop (e.g., "Python for data analysis"), (2) Current skill level, (3) Learning preferences. The AI will research and recommend effective training programs.'
WHERE catchy_name = 'Upskilling Program Finder' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🤝 Provide: (1) Cross-team conflict situation (e.g., "marketing and sales disagreeing on lead quality"), (2) Teams involved, (3) Impact on business. The AI will suggest resolution strategies.'
WHERE catchy_name = 'Conflict Resolution Guide' AND category = 'General Use';

UPDATE prompt_library 
SET description = '⚠️ Provide: (1) Initiative or change you''re considering (e.g., "migrating to cloud infrastructure"), (2) Current state, (3) Stakeholders. The AI will assess potential risks.'
WHERE catchy_name = 'Risk Assessment Analyzer' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🗺️ Provide: (1) Strategic planning needs (e.g., "Q2 2025 OKRs for product team"), (2) Team/department, (3) Key objectives. The AI will guide you through strategic planning.'
WHERE catchy_name = 'Strategic Planning Assistant' AND category = 'General Use';

UPDATE prompt_library 
SET description = '🛡️ Provide: (1) Team''s current situation (e.g., "remote team, tight deadlines, limited resources"), (2) Team size/structure, (3) Recent incidents. The AI will identify burnout risks and mitigation strategies.'
WHERE catchy_name = 'Burnout Prevention Planner' AND category = 'General Use';

UPDATE prompt_library 
SET description = '📋 Provide: (1) Project details and progress (e.g., "website redesign, 60% complete, on track"), (2) Audience (stakeholders/team/clients), (3) Key milestones. The AI will draft a professional project update.'
WHERE catchy_name = 'Project Update Writer' AND category = 'General Use';

-- ============================================================
-- HR (2 prompts)
-- ============================================================

UPDATE prompt_library 
SET description = '💬 Provide: (1) Employee feedback, survey results, or reviews (e.g., "annual engagement survey"), (2) Key themes to explore. The AI will analyze patterns and provide actionable insights.'
WHERE catchy_name = 'HR Feedback Analyzer' AND category = 'HR';

UPDATE prompt_library 
SET description = '📜 Provide: (1) Region/country and policy topic (e.g., "California, remote work policy"), (2) Company size/industry, (3) Compliance requirements. The AI will generate a compliant policy document.'
WHERE catchy_name = 'Policy Document Generator' AND category = 'HR';

-- ============================================================
-- IT (1 prompt)
-- ============================================================

UPDATE prompt_library 
SET description = '🏗️ Provide: (1) System components and integrations (e.g., "React frontend, Node.js API, PostgreSQL, Redis cache"), (2) Data flow requirements, (3) User types. The AI will create an architecture diagram.'
WHERE catchy_name = 'Architecture Diagram Builder' AND category = 'IT';

-- ============================================================
-- MARKETING (5 prompts)
-- ============================================================

UPDATE prompt_library 
SET description = '💬 Provide: (1) Customer feedback, campaign results, or reviews (e.g., "email campaign responses"), (2) Campaign goals. The AI will analyze patterns and provide actionable insights.'
WHERE catchy_name = 'Marketing Feedback Analyzer' AND category = 'Marketing';

UPDATE prompt_library 
SET description = '🎨 Provide: (1) Brand messaging draft and target audience (e.g., "enterprise CIOs"), (2) Competitors, (3) Unique value proposition. The AI will suggest improvements to make it more compelling.'
WHERE catchy_name = 'Brand Message Optimizer' AND category = 'Marketing';

UPDATE prompt_library 
SET description = '🖼️ Provide: (1) Image you need (e.g., "professional team meeting in modern office"), (2) Style preferences, (3) Use case (social media/website/ads). The AI will generate image prompts for DALL-E or Midjourney.'
WHERE catchy_name = 'AI Image Prompt Generator' AND category = 'Marketing';

UPDATE prompt_library 
SET description = '🔍 Provide: (1) Topic/product category (e.g., "project management software"), (2) Target audience, (3) Current rankings. The AI will generate keyword lists and content outlines for SEO.'
WHERE catchy_name = 'SEO Content Strategist' AND category = 'Marketing';

UPDATE prompt_library
SET description = '📱 Provide: (1) Event/product and target industry (e.g., "product launch, SaaS industry"), (2) Key messages, (3) Call-to-action. The AI will create LinkedIn, Twitter, and Facebook posts.'
WHERE catchy_name = 'Social Media Post Creator' AND category = 'Marketing';

-- ============================================================
-- OPERATIONS (8 prompts)
-- ============================================================

UPDATE prompt_library
SET description = '💬 Provide: (1) Customer feedback, operational data, or reviews (e.g., "process improvement survey"), (2) Key areas to analyze. The AI will analyze patterns and provide actionable insights.'
WHERE catchy_name = 'Operations Feedback Analyzer' AND category = 'Operations';

UPDATE prompt_library
SET description = '👥 Provide: (1) Meeting type (e.g., "manager-employee check-in"), (2) Meeting frequency, (3) Key topics to cover. The AI will create a structured template with discussion topics.'
WHERE catchy_name = '1:1 Template Creator' AND category = 'Operations';

UPDATE prompt_library
SET description = '🎨 Provide: (1) Picture or description of your space (e.g., "open office, 20 desks, needs collaboration areas"), (2) Budget, (3) Design goals. The AI will provide design ideas.'
WHERE catchy_name = 'Space Design Idea Generator' AND category = 'Operations';

UPDATE prompt_library
SET description = '💰 Provide: (1) Customer account details and usage patterns (e.g., "using basic plan, high engagement"), (2) Product tiers available, (3) Customer goals. The AI will identify upselling opportunities.'
WHERE catchy_name = 'Upsell Opportunity Finder' AND category = 'Operations';

UPDATE prompt_library
SET description = '🏠 Provide: (1) Room type, style, budget, and constraints (e.g., "home office, modern, $2000, minimal wall damage"), (2) Existing furniture, (3) Design preferences. The AI will provide design suggestions.'
WHERE catchy_name = 'Interior Design Assistant' AND category = 'Operations';

UPDATE prompt_library
SET description = '📢 Provide: (1) Leadership message you need to communicate (e.g., "announcing process changes"), (2) Audience (team/department/company), (3) Key points. The AI will help you craft clear, inspiring communication.'
WHERE catchy_name = 'Leadership Communicator' AND category = 'Operations';

UPDATE prompt_library
SET description = '🎯 Provide: (1) Your current goals (e.g., "reduce customer churn by 15%"), (2) Challenges you''re facing, (3) Timeline. The AI will help you reframe them to be more achievable and motivating.'
WHERE catchy_name = 'Goal Transformer' AND category = 'Operations';

UPDATE prompt_library
SET description = '🗺️ Provide: (1) Strategic planning needs (e.g., "2025 operational efficiency goals"), (2) Department/team, (3) Key objectives. The AI will guide you through strategic planning.'
WHERE catchy_name = 'Strategy Planning Pro' AND category = 'Operations';

-- ============================================================
-- SALES (6 prompts)
-- ============================================================

UPDATE prompt_library
SET description = '💬 Provide: (1) Customer feedback, sales data, or reviews (e.g., "lost deal feedback"), (2) Key patterns to identify. The AI will analyze patterns and provide actionable insights.'
WHERE catchy_name = 'Sales Feedback Analyzer' AND category = 'Sales';

UPDATE prompt_library
SET description = '📧 Provide: (1) Lead magnet and target audience (e.g., "whitepaper on AI trends, CTOs"), (2) Key value propositions, (3) Desired action. The AI will draft a 3-part email nurture sequence.'
WHERE catchy_name = 'Email Nurture Sequence Builder' AND category = 'Sales';

UPDATE prompt_library
SET description = '📊 Provide: (1) Financial data or sales reports (e.g., "Q4 revenue, pipeline, win rates"), (2) Target audience (sales team/executives). The AI will create an executive summary for stakeholders.'
WHERE catchy_name = 'Finance Summary Generator' AND category = 'Sales';

UPDATE prompt_library
SET description = '💰 Provide: (1) Customer account details and usage patterns (e.g., "using starter plan, 50 users"), (2) Product tiers available, (3) Customer pain points. The AI will identify upselling opportunities.'
WHERE catchy_name = 'Upsell Opportunity Scout' AND category = 'Sales';

UPDATE prompt_library
SET description = '🖼️ Provide: (1) Image you need (e.g., "sales presentation slide background"), (2) Style preferences, (3) Use case (pitch deck/social/email). The AI will generate image prompts for DALL-E or Midjourney.'
WHERE catchy_name = 'Visual Content Generator' AND category = 'Sales';

UPDATE prompt_library
SET description = '📧 Provide: (1) Your sales outreach email draft (paste full text). The AI will evaluate personalization depth, problem hypothesis, relevance, value clarity, and ask size, then provide specific improvement suggestions with scores.'
WHERE catchy_name = 'Sales Email Quality Checker' AND category = 'Sales';

-- ============================================================
-- VERIFY ALL PROMPTS NOW HAVE EMOJI + "Provide:" FORMAT
-- ============================================================

SELECT
  category,
  COUNT(*) as total_prompts,
  COUNT(CASE WHEN description LIKE '%Provide:%' THEN 1 END) as with_emoji_format
FROM prompt_library
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Show sample of updated descriptions
SELECT category, catchy_name, LEFT(description, 80) as description_preview
FROM prompt_library
WHERE is_active = true
  AND catchy_name IN (
    'Feedback Insight Analyzer', 'Finance Flash Report', 'Workload Balance Checker',
    'Option Comparison Matrix', '1:1 Meeting Template Builder', 'Weekly Success Planner',
    'Sales Email Quality Checker', 'Visual Content Generator', 'Upsell Opportunity Scout'
  )
ORDER BY category, catchy_name
LIMIT 10;


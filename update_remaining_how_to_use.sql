-- Update "description" (how to use) for all 33 remaining prompts without catchy names
-- These prompts are identified by their prompt_type field

-- ============================================================
-- GENERAL USE (16 prompts)
-- ============================================================

UPDATE prompt_library
SET description = 'Enter the specific feedback you need to deliver and the context (e.g., "missed deadline on Q4 report"). The AI will help you frame it constructively and professionally.'
WHERE prompt_type = 'Improve feedback delivery' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Describe the difficult conversation topic (e.g., "performance issues with team member"). The AI will provide a structured approach and talking points.'
WHERE prompt_type = 'Prepare for a difficult conversation' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Explain the cross-team conflict situation (e.g., "marketing and sales disagreeing on lead quality"). The AI will suggest resolution strategies.'
WHERE prompt_type = 'Resolve a cross-team conflict' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Paste your team''s work hours data or describe patterns (e.g., "3 team members working 60+ hours/week"). The AI will identify burnout risks.'
WHERE prompt_type = 'Identify burnout risk from hours' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Share your team''s current workload distribution (e.g., "5 projects across 3 people"). The AI will analyze balance and suggest adjustments.'
WHERE prompt_type = 'Analyze workload distribution' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Describe team symptoms (e.g., "low morale, missed deadlines, high turnover"). The AI will diagnose potential root causes.'
WHERE prompt_type = 'Diagnose team health issues' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Specify the skills you want to develop (e.g., "Python for data analysis"). The AI will research and recommend effective training programs.'
WHERE prompt_type = 'Research effective upskilling programs' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Describe your team''s current situation (e.g., "remote team, tight deadlines, limited resources"). The AI will identify burnout risks and mitigation strategies.'
WHERE prompt_type = 'Understand burnout risks and mitigation' AND category = 'General Use';

UPDATE prompt_library
SET description = 'List your tasks for the day (e.g., "client meeting, code review, budget planning"). The AI will help you prioritize and document them.'
WHERE prompt_type = 'Document daily priorities' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Share your goals and commitments for the week (e.g., "finish Q1 report, 3 client calls, team training"). The AI will create a structured weekly plan.'
WHERE prompt_type = 'Create a weekly plan' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Describe the problem you''re investigating (e.g., "customer churn increased 20% last quarter"). The AI will help identify root causes.'
WHERE prompt_type = 'Identify root cause' AND category = 'General Use';

UPDATE prompt_library
SET description = 'List the options you''re considering (e.g., "Salesforce vs HubSpot vs Pipedrive"). The AI will compare them across key dimensions.'
WHERE prompt_type = 'Compare options' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Describe the decision you need to make (e.g., "choosing a new project management tool"). The AI will help you define decision criteria.'
WHERE prompt_type = 'Decision criteria' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Explain the initiative or change you''re considering (e.g., "migrating to cloud infrastructure"). The AI will assess potential risks.'
WHERE prompt_type = 'Risk assessment' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Provide the options and your decision criteria (e.g., "3 vendors, need best ROI and support"). The AI will recommend the best option with reasoning.'
WHERE prompt_type = 'Recommend best option' AND category = 'General Use';

UPDATE prompt_library
SET description = 'Share your project details and progress (e.g., "website redesign, 60% complete, on track"). The AI will draft a professional project update.'
WHERE prompt_type = 'Write a project update' AND category = 'General Use';

-- ============================================================
-- GENERAL USE, OPERATIONS (4 prompts)
-- ============================================================

UPDATE prompt_library
SET description = 'Enter your current goals (e.g., "increase sales by 20%"). The AI will help you reframe them to be more achievable and motivating.'
WHERE prompt_type = 'Reframe Goals';

UPDATE prompt_library
SET description = 'Specify the type of 1:1 meeting (e.g., "manager-employee check-in"). The AI will create a structured template with discussion topics.'
WHERE prompt_type = 'Create a 1:1 template';

UPDATE prompt_library
SET description = 'Describe your strategic planning needs (e.g., "Q2 2025 OKRs for product team"). The AI will guide you through strategic planning.'
WHERE prompt_type = 'Strategic Planning';

UPDATE prompt_library
SET description = 'Enter the leadership message you need to communicate (e.g., "announcing organizational changes"). The AI will help you craft clear, inspiring communication.'
WHERE prompt_type = 'Leadership Communication';

-- ============================================================
-- HR (1 prompt)
-- ============================================================

UPDATE prompt_library
SET description = 'Specify the region/country and policy topic (e.g., "California, remote work policy"). The AI will generate a compliant policy document.'
WHERE prompt_type = 'Policy Document Prompt' AND category = 'HR';

-- ============================================================
-- IT (1 prompt)
-- ============================================================

UPDATE prompt_library
SET description = 'Describe your system components and integrations (e.g., "React frontend, Node.js API, PostgreSQL, Redis cache"). The AI will create an architecture diagram.'
WHERE prompt_type = 'Visualize system architecture' AND category = 'IT';

-- ============================================================
-- MARKETING (3 prompts)
-- ============================================================

UPDATE prompt_library
SET description = 'Specify the event/product and target industry (e.g., "product launch, SaaS industry"). The AI will create LinkedIn, Twitter, and Facebook posts.'
WHERE prompt_type = 'Social Media Content' AND category = 'Marketing';

UPDATE prompt_library
SET description = 'Paste your brand messaging draft and target audience (e.g., "enterprise CIOs"). The AI will suggest improvements to make it more compelling.'
WHERE prompt_type = 'Brand Positioning' AND category = 'Marketing';

UPDATE prompt_library
SET description = 'Enter your topic/product category (e.g., "project management software"). The AI will generate keyword lists and content outlines for SEO.'
WHERE prompt_type = 'SEO Strategy' AND category = 'Marketing';

-- ============================================================
-- MARKETING, SALES (1 prompt)
-- ============================================================

UPDATE prompt_library
SET description = 'Describe the image you need (e.g., "professional team meeting in modern office"). The AI will generate image prompts for DALL-E or Midjourney.'
WHERE prompt_type = 'Image Generation';

-- ============================================================
-- OPERATIONS (2 prompts)
-- ============================================================

UPDATE prompt_library
SET description = 'Specify room type, style, budget, and constraints (e.g., "home office, modern, $2000, minimal wall damage"). The AI will provide design suggestions.'
WHERE prompt_type = 'Interior Design Mockup' AND category = 'Operations';

UPDATE prompt_library
SET description = 'Upload a picture or describe your space (e.g., "open office, 20 desks, needs collaboration areas"). The AI will provide design ideas.'
WHERE prompt_type = 'Design Idea Generator' AND category = 'Operations';

-- ============================================================
-- OPERATIONS, MARKETING, FINANCE, SALES, HR (1 prompt)
-- ============================================================

UPDATE prompt_library
SET description = 'Paste customer feedback, survey results, or reviews (e.g., "NPS survey responses"). The AI will analyze patterns and provide actionable insights.'
WHERE prompt_type = 'Analyze Feedback';

-- ============================================================
-- OPERATIONS, SALES (1 prompt)
-- ============================================================

UPDATE prompt_library
SET description = 'Enter customer account details and usage patterns (e.g., "using basic plan, high engagement"). The AI will identify upselling opportunities.'
WHERE prompt_type = 'Identifying Upselling Opportunities';

-- ============================================================
-- SALES (2 prompts)
-- ============================================================

UPDATE prompt_library
SET description = 'Specify the lead magnet and target audience (e.g., "whitepaper on AI trends, CTOs"). The AI will draft a 3-part email nurture sequence.'
WHERE prompt_type = 'Email Campaign' AND category = 'Sales';

UPDATE prompt_library
SET description = 'Paste your sales outreach email draft. The AI will evaluate personalization, relevance, and effectiveness, then provide specific improvement suggestions.'
WHERE prompt_type = 'Sales Outreach Email Quality Evaluator' AND category = 'Sales';

-- ============================================================
-- SALES, FINANCE (1 prompt)
-- ============================================================

UPDATE prompt_library
SET description = 'Provide financial data or reports (e.g., "Q4 revenue, expenses, profit margins"). The AI will create an executive summary for stakeholders.'
WHERE prompt_type = 'Finance Update Summary';

-- Verify the updates
SELECT category, prompt_type, LEFT(description, 80) as description_preview
FROM prompt_library
WHERE prompt_type IN (
  'Improve feedback delivery', 'Prepare for a difficult conversation', 'Resolve a cross-team conflict',
  'Identify burnout risk from hours', 'Analyze workload distribution', 'Diagnose team health issues',
  'Research effective upskilling programs', 'Understand burnout risks and mitigation', 'Document daily priorities',
  'Create a weekly plan', 'Identify root cause', 'Compare options', 'Decision criteria', 'Risk assessment',
  'Recommend best option', 'Write a project update', 'Reframe Goals', 'Create a 1:1 template',
  'Strategic Planning', 'Leadership Communication', 'Policy Document Prompt', 'Visualize system architecture',
  'Social Media Content', 'Brand Positioning', 'SEO Strategy', 'Image Generation', 'Interior Design Mockup',
  'Design Idea Generator', 'Analyze Feedback', 'Identifying Upselling Opportunities', 'Email Campaign',
  'Sales Outreach Email Quality Evaluator', 'Finance Update Summary'
)
ORDER BY category, prompt_type;


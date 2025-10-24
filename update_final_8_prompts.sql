-- Update the final 8 prompts to have user-friendly "how to use" descriptions

-- Work AI Assistant (General Use)
UPDATE prompt_library 
SET description = '💡 Ask me anything! Provide: (1) Your specific question/challenge (e.g., "how to improve team productivity"), (2) Context (role/industry/team), (3) Constraints (time/budget/resources), (4) Desired outcome.'
WHERE prompt_type = '5 Ways to Help Me at Work' AND category = 'General Use';

-- Edge Case Radar (IT & Operations)
UPDATE prompt_library 
SET description = '🔍 Provide: (1) Feature/system to test (e.g., "user login flow"), (2) Expected behavior, (3) Known constraints. The AI will brainstorm edge cases, failure scenarios, unusual inputs, and concurrency issues.'
WHERE prompt_type = 'Brainstorm edge cases for testing';

-- Enterprise Vendor Scout (IT & Operations)
UPDATE prompt_library 
SET description = '🔎 Provide: (1) System/tool type (e.g., "CRM software"), (2) Must-have features, (3) Budget range. The AI will research vendors and create a comparison table with features, pricing, integrations, and support quality.'
WHERE prompt_type = 'Generate vendor comparison chart';

-- Bug Signal Prioritizer (IT & Operations)
UPDATE prompt_library 
SET description = '🐛 Provide: (1) Bug report data (paste or attach file with severity, frequency, affected users), (2) Product context. The AI will prioritize bugs and create charts showing frequency vs. severity.'
WHERE prompt_type = 'Prioritize bugs based on impact';

-- Sales Outreach Email Quality Evaluator (Sales) - This one already has a good description, just needs formatting
UPDATE prompt_library 
SET description = '📧 Provide: (1) Your sales outreach email draft (paste full text). The AI will evaluate personalization depth, problem hypothesis, relevance, value clarity, and ask size, then provide specific improvement suggestions with scores.'
WHERE prompt_type = 'Sales Outreach Email Quality Evaluator' AND category = 'Sales';

-- Verify all prompts now have user-friendly descriptions
SELECT 
  category, 
  COUNT(*) as total_prompts,
  COUNT(CASE WHEN (description LIKE '%Provide:%' OR description LIKE '%e.g.,%') THEN 1 END) as with_how_to_use,
  COUNT(*) - COUNT(CASE WHEN (description LIKE '%Provide:%' OR description LIKE '%e.g.,%') THEN 1 END) as remaining
FROM prompt_library 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;

-- Show the 8 updated prompts
SELECT category, catchy_name, prompt_type, LEFT(description, 100) as description_preview
FROM prompt_library 
WHERE prompt_type IN (
  '5 Ways to Help Me at Work',
  'Brainstorm edge cases for testing',
  'Generate vendor comparison chart',
  'Prioritize bugs based on impact',
  'Sales Outreach Email Quality Evaluator'
)
ORDER BY category, prompt_type;


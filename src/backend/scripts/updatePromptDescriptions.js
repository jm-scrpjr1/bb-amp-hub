const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User-friendly descriptions with clear input guidance
const userFriendlyDescriptions = {
  // GENERAL USE
  'Strategic Decision Analyzer': '📋 Provide: (1) What you\'re considering (tool/process/initiative), (2) Your budget constraints, (3) Team size/structure. I\'ll analyze costs, efficiency impact, and risks with a detailed recommendation.',

  'Project Planner': '📝 Provide: (1) Meeting notes or discussion summary, (2) Project context/goals, (3) Team members involved. Attach files if available. I\'ll create a structured action plan with owners, priorities, and timelines.',

  'Clarity Enhancer': '✍️ Provide: (1) The text you want to improve, (2) Intended audience (team/client/executive), (3) Desired tone (formal/casual/urgent). I\'ll rewrite it to be clear, professional, and impactful.',

  'Smart Task Prioritizer': '✅ Provide: (1) Your task list (paste or attach file), (2) Time frame (today/week/month), (3) Your role/context, (4) Any urgent deadlines. I\'ll prioritize tasks and explain the reasoning.',

  'Weekly Workflow Planner': '📅 Provide: (1) Your role/responsibilities, (2) Upcoming deadlines or meetings, (3) Current projects, (4) Preferred work hours. Attach notes/files if available. I\'ll build a balanced weekly schedule.',

  'Calm Customer De-Escalator': '🤝 Provide: (1) Customer complaint/issue details, (2) What happened/timeline, (3) Your company\'s policies, (4) Desired outcome. I\'ll craft a professional de-escalation response.',

  'Performance Review Prepper': '⭐ Provide: (1) Your role/title, (2) Key achievements this period, (3) Challenges faced, (4) Goals for next period, (5) Metrics/data if available. I\'ll structure compelling talking points.',

  'Polished Email Composer': '📧 Provide: (1) Email purpose/goal, (2) Recipient (boss/client/team), (3) Key points to cover, (4) Desired tone, (5) Any deadlines/CTAs. I\'ll write a professional, effective email.',

  'Course Crafter': '🎓 Provide: (1) Training topic, (2) Target audience/role (e.g., Customer Success Manager, Sales Rep, Developer), (3) Skill level (beginner/intermediate/advanced), (4) Learning objectives, (5) Time available for training. Attach materials if you have them. I\'ll design a complete course structure tailored to your audience.',

  'Customer Health Thermometer': '📊 Provide: (1) Customer name/account, (2) Usage data/metrics, (3) Recent interactions/feedback, (4) Contract details, (5) Support tickets. Attach files if available. I\'ll assess health score and risks.',

  'Skill Gap Detector': '🎯 Provide: (1) Team members and current skills, (2) Project/business goals, (3) Required competencies, (4) Timeline for upskilling. Attach skill matrix if available. I\'ll identify gaps and recommend training priorities.',

  'Work AI Assistant': '💡 Ask me anything! For best results, provide: (1) Your specific question/challenge, (2) Context (role/industry/team), (3) Any constraints (time/budget/resources), (4) Desired outcome.',

  'Customer Idea Engine': '💡 Provide: (1) Your company/service description, (2) Customer touchpoints (QBRs, emails, events), (3) Recent customer feedback, (4) Your goals (retention/upsell/engagement). I\'ll generate creative customer experience ideas.',

  'Customer Success Plan Builder': '📋 Provide: (1) Customer name/industry, (2) Product/service they purchased, (3) Implementation timeline, (4) Success metrics, (5) Known challenges. I\'ll create a comprehensive CS plan.',

  'Customer Success Goals Writer': '🎯 Provide: (1) Customer account details, (2) Current state/baseline metrics, (3) Desired outcomes, (4) Timeline (quarterly/annual), (5) Resources available. I\'ll write SMART goals.',

  'Customer Success Metrics Builder': '📈 Provide: (1) Your CS team structure, (2) Product type, (3) Customer segments, (4) Business objectives, (5) Current tracking methods. I\'ll recommend key metrics and tracking approach.',

  'Customer Retention Strategy Builder': '🔄 Provide: (1) Current churn rate/data, (2) Common churn reasons, (3) Customer lifecycle stages, (4) Team resources, (5) Budget. Attach customer data if available. I\'ll build a retention strategy.',

  'Customer Education Survey Builder': '📝 Provide: (1) Training program details, (2) Audience (customers/partners), (3) What you want to learn, (4) Survey length preference, (5) Distribution method. I\'ll create an effective survey.',

  // IT
  'Internal API Doc Builder': '🔧 Provide: (1) API endpoints/routes, (2) Request/response examples, (3) Authentication method, (4) Error codes, (5) Code snippets. Attach schema files if available. I\'ll create clear documentation.',

  'Device Lifecycle Policy Writer': '💻 Provide: (1) Device types (laptops/desktops/phones), (2) Current device ages/costs, (3) Company size, (4) Budget constraints, (5) Environmental goals. Attach spreadsheet if available. I\'ll draft a comprehensive policy.',

  'Design Doc Checker': '🔍 Provide: (1) Your design document (paste or attach), (2) Project scope, (3) Technical stack, (4) Team size, (5) Timeline. I\'ll review for completeness, clarity, and potential issues.',

  'IT Onboarding Checklist Builder': '✅ Provide: (1) Company size, (2) Tech stack/tools used, (3) Security requirements, (4) Remote/hybrid/office setup, (5) Role types (dev/sales/ops). I\'ll create a comprehensive IT onboarding checklist.',

  'Internal Knowledge Article Writer': '📚 Provide: (1) Topic/process to document, (2) Target audience (technical/non-technical), (3) Step-by-step details, (4) Screenshots/examples if available, (5) Common issues/FAQs. I\'ll write a clear knowledge article.',

  // OPERATIONS
  'Design Idea Generator': '🏢 Upload: (1) Photo or blueprint of your space, (2) Space dimensions if known, (3) Budget range, (4) Desired style/vibe, (5) Functional requirements. I\'ll suggest design improvements.'
};

async function updateDescriptions() {
  try {
    console.log('🔄 Updating prompt descriptions to be more user-friendly...\n');
    
    let updatedCount = 0;
    
    for (const [catchyName, newDescription] of Object.entries(userFriendlyDescriptions)) {
      const result = await prisma.prompt_library.updateMany({
        where: {
          catchy_name: catchyName
        },
        data: {
          description: newDescription
        }
      });
      
      if (result.count > 0) {
        console.log(`✅ Updated "${catchyName}" (${result.count} records)`);
        updatedCount += result.count;
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} prompt descriptions!`);
    
  } catch (error) {
    console.error('❌ Error updating descriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDescriptions();


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User-friendly descriptions mapping
const userFriendlyDescriptions = {
  'Strategic Decision Analyzer': 'Get a comprehensive pros/cons analysis for any business decision. Just tell me what you\'re considering (new tool, process, initiative) and I\'ll help you evaluate costs, efficiency, and risks.',
  
  'Project Planner': 'Turn your meeting notes into an actionable project plan! Paste your notes or attach a file, and I\'ll identify action items, assign priorities, suggest owners, and create a collaborative plan.',
  
  'Clarity Enhancer': 'Make your writing crystal clear! Paste any text and I\'ll rewrite it to be more professional, concise, and easy to understand.',
  
  'Smart Task Prioritizer': 'Overwhelmed with tasks? Share your to-do list (paste or attach) and I\'ll help you prioritize what matters most and explain why.',
  
  'Weekly Workflow Planner': 'Build a balanced weekly work plan! Share your notes or files, and I\'ll create a schedule with deadlines, meetings, and focus time.',
  
  'Calm Customer De-Escalator': 'Dealing with an upset customer? Describe the situation and I\'ll help you craft a calm, professional response that de-escalates tension.',
  
  'Performance Review Prepper': 'Prepare for performance reviews with confidence! Tell me about your role and achievements, and I\'ll help structure your talking points.',
  
  'Polished Email Composer': 'Write professional emails that get results! Tell me what you need to communicate and I\'ll craft a polished message.',
  
  'Course Crafter': 'Create engaging training courses! Share your topic and materials, and I\'ll design a structured learning experience.',
  
  'Customer Health Thermometer': 'Assess customer satisfaction and identify risks. Share customer data or feedback, and I\'ll analyze their health score.',
  
  'Skill Gap Detector': 'Identify skill gaps in your team! Describe your team\'s current skills and goals, and I\'ll highlight what\'s missing.',
  
  'Work AI Assistant': 'Your all-purpose work helper! Ask me anything about productivity, communication, planning, or problem-solving.',
  
  'Internal API Doc Builder': 'Document your APIs clearly! Share your code, schema, or examples, and I\'ll create developer-friendly documentation.',
  
  'Device Lifecycle Policy Writer': 'Create IT hardware policies! Share your device data (spreadsheet or notes) and I\'ll draft a lifecycle management policy.',
  
  'Design Doc Checker': 'Get feedback on technical designs! Share your design document and I\'ll review it for clarity, completeness, and potential issues.',
  
  'Design Idea Generator': 'Transform your space! Upload a photo or blueprint of your office, and I\'ll suggest design improvements.'
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


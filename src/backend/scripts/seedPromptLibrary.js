const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function seedPromptLibrary() {
  console.log('🌱 Starting Prompt Library Seed...\n');

  const csvPath = path.join(__dirname, '../../frontend/react_workbench/public/documents/Prompts Library.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const prompts = [];
  
  // Read and parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const category = row['Category']?.trim();
        const designation = row['Designation']?.trim();
        const catchyName = row['Catchy Names']?.trim();
        const promptType = row['Prompt Type / Use']?.trim();
        const description = row['Description - Enter the Prompt ']?.trim();
        const refinedInstructions = row['Refined Instructions']?.trim();

        // Skip if no category or no refined instructions
        if (!category || !refinedInstructions || refinedInstructions.length < 50) {
          return;
        }

        // Handle dual categories (e.g., "Operations, General Use")
        const categories = category.split(',').map(c => c.trim());
        
        categories.forEach(cat => {
          prompts.push({
            id: uuidv4(),
            category: cat,
            designation: designation || null,
            catchy_name: catchyName || null,
            prompt_type: promptType || null,
            description: description || '',
            refined_instructions: refinedInstructions,
            is_active: true,
            usage_count: 0,
          });
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Parsed ${prompts.length} prompts from CSV\n`);

  // Clear existing prompts
  console.log('🗑️  Clearing existing prompts...');
  await prisma.user_prompt_favorites.deleteMany({});
  await prisma.prompt_library.deleteMany({});
  console.log('✅ Cleared existing data\n');

  // Insert prompts
  console.log('💾 Inserting prompts...');
  let inserted = 0;
  
  for (const prompt of prompts) {
    try {
      await prisma.prompt_library.create({
        data: prompt
      });
      inserted++;
      
      if (inserted % 10 === 0) {
        console.log(`   ✓ Inserted ${inserted}/${prompts.length} prompts...`);
      }
    } catch (error) {
      console.error(`   ❌ Error inserting prompt: ${prompt.catchy_name || prompt.prompt_type}`, error.message);
    }
  }

  console.log(`\n✅ Successfully inserted ${inserted} prompts!\n`);

  // Show category breakdown
  const categoryStats = await prisma.prompt_library.groupBy({
    by: ['category'],
    _count: {
      id: true
    },
    orderBy: {
      category: 'asc'
    }
  });

  console.log('📊 Category Breakdown:');
  categoryStats.forEach(stat => {
    console.log(`   ${stat.category}: ${stat._count.id} prompts`);
  });

  console.log('\n🎉 Prompt Library Seed Complete!\n');
}

seedPromptLibrary()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Load the question scoring map
const scoringMapPath = path.join(__dirname, 'question_scoring_map.json');
const scoringMap = JSON.parse(fs.readFileSync(scoringMapPath, 'utf8'));

async function runMigration() {
  try {
    console.log('🚀 Starting AI Assessment Reset Migration...\n');

    // Step 1: Clear all existing data
    console.log('🗑️  Clearing old assessment data...');
    await prisma.user_question_responses.deleteMany({});
    await prisma.assessment_results.deleteMany({});
    await prisma.user_assessment_history.deleteMany({});
    await prisma.user_assessment_sessions.deleteMany({});
    await prisma.assessment_questions.deleteMany({});
    await prisma.assessment_categories.deleteMany({});
    console.log('✅ Old data cleared\n');

    // Step 2: Insert new categories
    console.log('📊 Inserting new categories...');
    const categoryMap = {};
    for (let i = 0; i < scoringMap.categories.length; i++) {
      const cat = scoringMap.categories[i];
      const category = await prisma.assessment_categories.create({
        data: {
          name: cat.name,
          description: `Measures ${cat.name.toLowerCase()} capabilities`,
          weight: cat.weight
        }
      });
      categoryMap[cat.key] = category.id;
      console.log(`   ✓ ${cat.name} (weight: ${cat.weight})`);
    }
    console.log('✅ Categories inserted\n');

    // Step 3: Insert questions
    console.log('📝 Inserting questions...');
    let totalQuestions = 0;

    for (const cat of scoringMap.categories) {
      const categoryId = categoryMap[cat.key];
      console.log(`   ${cat.name}:`);

      for (const question of cat.questions) {
        // Prepare options array with just the text
        const optionsText = question.options.map(opt => opt.text);

        // Determine difficulty based on point distribution
        const maxPoints = Math.max(...question.options.map(opt => opt.points));
        const minPoints = Math.min(...question.options.map(opt => opt.points));
        const difficulty = (maxPoints - minPoints) >= 4 ? 'hard' : (maxPoints - minPoints) >= 3 ? 'medium' : 'easy';

        await prisma.assessment_questions.create({
          data: {
            category_id: categoryId,
            question_text: question.text,
            question_type: 'multiple_choice',
            options: optionsText,
            points: maxPoints, // Max points possible for this question
            difficulty_level: difficulty,
            is_active: true
          }
        });

        totalQuestions++;
        process.stdout.write('.');
      }
      console.log(` ${cat.questions.length} questions`);
    }

    console.log(`\n✅ Total questions inserted: ${totalQuestions}\n`);

    // Step 4: Verify the data
    console.log('🔍 Verifying migration...\n');
    const categories = await prisma.assessment_categories.findMany({ orderBy: { id: 'asc' } });
    const questions = await prisma.assessment_questions.findMany();

    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Questions: ${questions.length}\n`);

    // Count questions per category
    const questionsByCategory = await prisma.$queryRaw`
      SELECT c.name, c.weight, COUNT(q.id) as count
      FROM assessment_categories c
      LEFT JOIN assessment_questions q ON c.id = q.category_id
      GROUP BY c.id, c.name, c.weight
      ORDER BY c.id
    `;

    console.log('📊 Questions per category:');
    questionsByCategory.forEach(cat => {
      console.log(`   ${cat.name} (${(parseFloat(cat.weight) * 100).toFixed(0)}%): ${cat.count} questions`);
    });

    console.log('\n🎉 Assessment reset complete!\n');
    console.log('📌 Next steps:');
    console.log('   1. Update backend to use new scoring logic');
    console.log('   2. Add abort confirmation to frontend');
    console.log('   3. Add AI-Amplified effects to UI\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();


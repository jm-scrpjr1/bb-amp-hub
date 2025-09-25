import { prisma } from '../lib/db';

async function main() {
  console.log('🌱 Starting database seed...');

  // Add your seed data here
  // Example:
  // const user = await prisma.user.create({
  //   data: {
  //     name: 'Edward',
  //     email: 'edward@example.com',
  //   },
  // });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

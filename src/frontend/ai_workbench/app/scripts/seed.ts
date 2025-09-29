import { prisma } from '../lib/db';
import { UserRole, UserStatus, OWNER_EMAIL } from '../lib/permissions';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create or update the owner user
  const ownerUser = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: OWNER_EMAIL,
      name: 'John Lopez',
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      loginCount: 0,
    },
  });

  console.log('👑 Owner user created/updated:', ownerUser.email);

  // Create sample teams
  const engineeringTeam = await prisma.team.upsert({
    where: { id: 'team-engineering' },
    update: {},
    create: {
      id: 'team-engineering',
      name: 'Engineering',
      description: 'Software development and technical operations',
    },
  });

  const marketingTeam = await prisma.team.upsert({
    where: { id: 'team-marketing' },
    update: {},
    create: {
      id: 'team-marketing',
      name: 'Marketing',
      description: 'Marketing and business development',
    },
  });

  console.log('🏢 Sample teams created');

  // Create sample analytics record
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.systemAnalytics.upsert({
    where: { date: today },
    update: {
      totalUsers: 1,
      activeUsers: 1,
      newUsers: 1,
      totalLogins: 0,
    },
    create: {
      date: today,
      totalUsers: 1,
      activeUsers: 1,
      newUsers: 1,
      totalLogins: 0,
    },
  });

  console.log('📊 System analytics initialized');
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

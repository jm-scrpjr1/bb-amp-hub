const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLoginCount() {
  try {
    console.log('Testing login count update...\n');
    
    // Find a test user
    const testUser = await prisma.users.findFirst({
      where: { email: 'jmadrino@boldbusiness.com' },
      include: { roles: true }
    });
    
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log('📊 Before update:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Role: ${testUser.roles.name}`);
    console.log(`   Login Count: ${testUser.loginCount}`);
    console.log(`   Last Login: ${testUser.lastLoginAt}`);
    
    // Simulate a login by incrementing login count
    const updatedUser = await prisma.users.update({
      where: { email: testUser.email },
      data: {
        loginCount: {
          increment: 1
        },
        lastLoginAt: new Date()
      },
      include: { roles: true }
    });
    
    console.log('\n📊 After update:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Role: ${updatedUser.roles.name}`);
    console.log(`   Login Count: ${updatedUser.loginCount}`);
    console.log(`   Last Login: ${updatedUser.lastLoginAt}`);
    
    if (updatedUser.loginCount === testUser.loginCount + 1) {
      console.log('\n✅ Login count increment WORKS!');
    } else {
      console.log('\n❌ Login count increment FAILED!');
    }
    
  } catch (error) {
    console.error('❌ Error testing login count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginCount();


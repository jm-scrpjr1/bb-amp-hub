const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRoleRelation() {
  try {
    console.log('Testing role relation...\n');
    
    // Test 1: Find user with roles relation
    const user = await prisma.users.findFirst({
      where: { email: 'jmadrino@boldbusiness.com' },
      include: { roles: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found with roles relation:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   RoleId: ${user.roleId}`);
    console.log(`   Role Object:`, user.roles);
    console.log(`   Role Name: ${user.roles?.name}`);
    
    // Test 2: Group by roleId
    console.log('\n📊 Testing groupBy roleId...');
    const usersByRole = await prisma.users.groupBy({
      by: ['roleId'],
      _count: { roleId: true }
    });
    
    console.log('✅ GroupBy results:');
    usersByRole.forEach(item => {
      console.log(`   ${item.roleId}: ${item._count.roleId} users`);
    });
    
    // Test 3: Get role names
    console.log('\n📋 Getting role names...');
    const roles = await prisma.roles.findMany();
    console.log('✅ Roles in database:');
    roles.forEach(role => {
      console.log(`   ${role.id} -> ${role.name} (level ${role.level})`);
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoleRelation();


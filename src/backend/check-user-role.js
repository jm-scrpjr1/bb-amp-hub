const prisma = require('./lib/db');

async function checkUserRole() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'jmadrino@boldbusiness.com' },
      include: {
        groupMemberships: true,
        managedGroups: true
      }
    });

    if (!user) {
      console.log('❌ User not found: jmadrino@boldbusiness.com');
      return;
    }

    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Status:', user.status);
    console.log('  Permissions:', user.permissions);
    console.log('  Group Memberships:', user.groupMemberships?.length || 0);
    console.log('  Managed Groups:', user.managedGroups?.length || 0);
    console.log('\nFull user object:', JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();


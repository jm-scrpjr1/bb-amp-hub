const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Starting role migration...');

    // Execute the entire migration as a single transaction
    await prisma.$executeRawUnsafe(`
      -- CreateTable: roles table
      CREATE TABLE IF NOT EXISTS "roles" (
          "id" TEXT NOT NULL,
          "name" VARCHAR(50) NOT NULL,
          "description" TEXT,
          "level" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created roles table');

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "roles_level_key" ON "roles"("level");`);
    console.log('✓ Created indexes');

    // Insert roles (use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates)
    await prisma.$executeRawUnsafe(`
      INSERT INTO "roles" ("id", "name", "description", "level", "createdAt", "updatedAt") VALUES
          ('role_member', 'MEMBER', 'Standard member with basic access', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('role_team_manager', 'TEAM_MANAGER', 'Team manager with team-level permissions', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('role_super_admin', 'SUPER_ADMIN', 'Super administrator with elevated permissions', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('role_owner', 'OWNER', 'Owner with full system access', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Inserted roles');

    // Check if roleId column already exists
    const columnCheck = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'roleId';
    `);

    if (columnCheck.length === 0) {
      // Add roleId column
      await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "roleId" TEXT;`);
      console.log('✓ Added roleId column');

      // Migrate data
      await prisma.$executeRawUnsafe(`UPDATE "users" SET "roleId" = 'role_member' WHERE "role" = 'MEMBER';`);
      await prisma.$executeRawUnsafe(`UPDATE "users" SET "roleId" = 'role_team_manager' WHERE "role" IN ('MANAGER', 'TEAM_MANAGER');`);
      await prisma.$executeRawUnsafe(`UPDATE "users" SET "roleId" = 'role_super_admin' WHERE "role" IN ('ADMIN', 'SUPER_ADMIN');`);
      await prisma.$executeRawUnsafe(`UPDATE "users" SET "roleId" = 'role_owner' WHERE "role" = 'OWNER';`);
      await prisma.$executeRawUnsafe(`UPDATE "users" SET "roleId" = 'role_member' WHERE "roleId" IS NULL;`);
      console.log('✓ Migrated role data');

      // Make roleId NOT NULL
      await prisma.$executeRawUnsafe(`ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL;`);
      console.log('✓ Made roleId NOT NULL');

      // Add foreign key
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey"
        FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
      console.log('✓ Added foreign key constraint');

      // Drop old role column
      await prisma.$executeRawUnsafe(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role";`);
      console.log('✓ Dropped old role column');

      // Drop old enum
      await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "UserRole";`);
      console.log('✓ Dropped UserRole enum');
    } else {
      console.log('⚠ roleId column already exists, skipping migration');
    }
    
    console.log('\nMigration completed!');
    
    // Verify the migration
    const roles = await prisma.$queryRaw`SELECT * FROM roles ORDER BY level`;
    console.log('\nRoles in database:');
    console.table(roles);
    
    const userCount = await prisma.$queryRaw`
      SELECT r.name as role, COUNT(u.id) as user_count 
      FROM users u 
      JOIN roles r ON u."roleId" = r.id 
      GROUP BY r.name
    `;
    console.log('\nUser distribution by role:');
    console.table(userCount);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();


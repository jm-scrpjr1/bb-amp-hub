-- CreateTable: roles table
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "roles_level_key" ON "roles"("level");

-- Insert predefined roles
INSERT INTO "roles" ("id", "name", "description", "level", "createdAt", "updatedAt") VALUES
    ('role_member', 'MEMBER', 'Standard member with basic access', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('role_team_manager', 'TEAM_MANAGER', 'Team manager with team-level permissions', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('role_super_admin', 'SUPER_ADMIN', 'Super administrator with elevated permissions', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('role_owner', 'OWNER', 'Owner with full system access', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add temporary roleId column to users (nullable first)
ALTER TABLE "users" ADD COLUMN "roleId" TEXT;

-- Migrate existing role data to roleId
-- Map MEMBER -> role_member
UPDATE "users" SET "roleId" = 'role_member' WHERE "role" = 'MEMBER';

-- Map MANAGER and TEAM_MANAGER -> role_team_manager
UPDATE "users" SET "roleId" = 'role_team_manager' WHERE "role" IN ('MANAGER', 'TEAM_MANAGER');

-- Map ADMIN and SUPER_ADMIN -> role_super_admin
UPDATE "users" SET "roleId" = 'role_super_admin' WHERE "role" IN ('ADMIN', 'SUPER_ADMIN');

-- Map OWNER -> role_owner
UPDATE "users" SET "roleId" = 'role_owner' WHERE "role" = 'OWNER';

-- Set default for any NULL values (shouldn't happen, but safety first)
UPDATE "users" SET "roleId" = 'role_member' WHERE "roleId" IS NULL;

-- Make roleId NOT NULL
ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old role column
ALTER TABLE "users" DROP COLUMN "role";

-- Drop the old UserRole enum
DROP TYPE "UserRole";


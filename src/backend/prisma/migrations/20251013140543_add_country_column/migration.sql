/*
  Warnings:

  - The values [VIEW_USER_PROFILES,VIEW_ADMIN_CONTENT] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,TEAM_MANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `teamId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('GOD_MODE', 'CREATE_GROUP', 'DELETE_GROUP', 'EDIT_GROUP', 'MANAGE_GROUP_MEMBERS', 'VIEW_ALL_GROUPS', 'MANAGE_USERS', 'VIEW_ALL_USER_PROFILES', 'ASSIGN_ROLES', 'DELETE_USERS', 'VIEW_GROUP_MEMBERS', 'MANAGE_OWN_GROUP_MEMBERS', 'VIEW_PH_RESOURCES', 'VIEW_COL_RESOURCES', 'VIEW_MX_RESOURCES', 'VIEW_US_RESOURCES', 'VIEW_IN_RESOURCES', 'VIEW_HR_CONTENT', 'VIEW_IT_CONTENT', 'VIEW_FINANCE_CONTENT', 'VIEW_MARKETING_CONTENT', 'VIEW_SALES_CONTENT', 'VIEW_DEVELOPER_CONTENT', 'ADMIN_PANEL_ACCESS', 'SYSTEM_SETTINGS', 'ANALYTICS_ACCESS', 'AI_TRAINING_ACCESS', 'AI_ASSESSMENT_ACCESS', 'PROMPT_TUTOR_ACCESS', 'VIEW_OWN_PROFILE', 'EDIT_OWN_PROFILE', 'VIEW_OWN_GROUPS');
ALTER TABLE "user_permissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('OWNER', 'SUPER_ADMIN', 'MANAGER', 'MEMBER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."teams" DROP CONSTRAINT "teams_managerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_teamId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "teamId",
ADD COLUMN     "country" TEXT;

-- DropTable
DROP TABLE "public"."teams";

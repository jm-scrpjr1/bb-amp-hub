#!/usr/bin/env node

/**
 * Script to sync user countries from Google Workspace
 * This script fetches all users from Google Workspace and updates their country field
 * in the database based on their location information in Google Workspace.
 * 
 * Usage: node scripts/syncUserCountriesFromWorkspace.js
 */

const { GoogleWorkspaceService } = require('../services/googleWorkspaceService');
const { prisma } = require('../lib/db');

async function syncUserCountries() {
  console.log('🚀 Starting user country sync from Google Workspace...\n');

  try {
    // Initialize Google Workspace service
    const googleWorkspace = new GoogleWorkspaceService();
    const initialized = await googleWorkspace.initialize();

    if (!initialized) {
      console.error('❌ Failed to initialize Google Workspace service');
      process.exit(1);
    }

    // Get all users from Google Workspace
    console.log('📥 Fetching users from Google Workspace...');
    const response = await googleWorkspace.adminSDK.users.list({
      domain: googleWorkspace.domain,
      maxResults: 500,
      orderBy: 'email',
    });

    const workspaceUsers = response.data.users || [];
    console.log(`✅ Found ${workspaceUsers.length} users in Google Workspace\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each user
    for (const workspaceUser of workspaceUsers) {
      try {
        const email = workspaceUser.primaryEmail.toLowerCase();

        // Extract country from Google Workspace locations
        let country = 'US'; // Default fallback
        if (workspaceUser.locations && workspaceUser.locations.length > 0) {
          const primaryLocation = workspaceUser.locations[0];
          country = primaryLocation.countryCode || 'US';
        }

        // Check if user exists in database
        const existingUser = await prisma.users.findUnique({
          where: { email }
        });

        if (!existingUser) {
          console.log(`⏭️  Skipping ${email} - not found in database`);
          skipped++;
          continue;
        }

        // Update user with country from Google Workspace
        const updatedUser = await prisma.users.update({
          where: { email },
          data: {
            country,
            updatedAt: new Date(),
          }
        });

        console.log(`✅ Updated ${email} -> Country: ${country}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error processing user ${workspaceUser.primaryEmail}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log(`   ✅ Updated: ${updated} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users (not in database)`);
    console.log(`   ❌ Errors: ${errors} users`);
    console.log('='.repeat(60) + '\n');

    if (updated > 0) {
      console.log('🎉 User country sync completed successfully!');
    }

  } catch (error) {
    console.error('❌ Fatal error during sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncUserCountries().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});


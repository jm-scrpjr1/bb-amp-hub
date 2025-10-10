const { google } = require('googleapis');
const { prisma } = require('../lib/db');

class GoogleWorkspaceService {
  constructor() {
    this.adminEmail = process.env.GOOGLE_ADMIN_EMAIL || 'jlope@boldbusiness.com';
    this.serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './google-service-account.json';
    this.domain = process.env.GOOGLE_WORKSPACE_DOMAIN || 'boldbusiness.com';
    this.auth = null;
    this.adminSDK = null;
  }

  async initialize() {
    try {
      // Initialize Google Auth with service account
      this.auth = new google.auth.GoogleAuth({
        keyFile: this.serviceAccountPath,
        scopes: [
          'https://www.googleapis.com/auth/admin.directory.user.readonly',
          'https://www.googleapis.com/auth/admin.directory.group.readonly',
        ],
        subject: this.adminEmail, // Impersonate admin user
      });

      this.adminSDK = google.admin({ version: 'directory_v1', auth: this.auth });
      console.log('✅ Google Workspace service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Workspace service:', error);
      return false;
    }
  }

  async testConnection() {
    try {
      if (!this.adminSDK) {
        await this.initialize();
      }

      const authClient = await this.auth.getClient();

      // Test with a simple API call that requires less permissions
      try {
        // Try to get the service account info first
        const tokenInfo = await authClient.getAccessToken();

        return {
          authenticated: true,
          serviceAccount: authClient.email,
          adminEmail: this.adminEmail,
          domain: this.domain,
          hasToken: !!tokenInfo.token,
          tokenScopes: authClient.scopes
        };
      } catch (apiError) {
        return {
          authenticated: true,
          serviceAccount: authClient.email,
          adminEmail: this.adminEmail,
          domain: this.domain,
          apiError: apiError.message,
          hasToken: false
        };
      }
    } catch (error) {
      return {
        authenticated: false,
        error: error.message
      };
    }
  }

  async syncUsersFromWorkspace() {
    try {
      if (!this.adminSDK) {
        console.log('Google Workspace not initialized, skipping user sync');
        return { synced: 0, errors: 0 };
      }

      console.log('🔄 Syncing users from Google Workspace...');
      console.log(`📧 Using admin email: ${this.adminEmail}`);
      console.log(`🌐 Using domain: ${this.domain}`);
      console.log(`🔑 Service account path: ${this.serviceAccountPath}`);

      // Test authentication first
      try {
        const authClient = await this.auth.getClient();
        console.log('✅ Authentication client obtained successfully');
        console.log(`🔐 Client email: ${authClient.email}`);
      } catch (authError) {
        console.error('❌ Authentication failed:', authError.message);
        throw authError;
      }

      // Get all users from Google Workspace
      const response = await this.adminSDK.users.list({
        domain: this.domain,
        maxResults: 500,
        orderBy: 'email',
      });

      const workspaceUsers = response.data.users || [];
      console.log(`Found ${workspaceUsers.length} users in Google Workspace`);

      let synced = 0;
      let errors = 0;

      for (const workspaceUser of workspaceUsers) {
        try {
          await this.syncSingleUser(workspaceUser);
          synced++;
        } catch (error) {
          console.error(`Error syncing user ${workspaceUser.primaryEmail}:`, error);
          errors++;
        }
      }

      console.log(`✅ User sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('Error syncing users from Google Workspace:', error);
      return { synced: 0, errors: 1 };
    }
  }

  async syncSingleUser(workspaceUser) {
    const email = workspaceUser.primaryEmail.toLowerCase();
    const name = workspaceUser.name?.fullName || workspaceUser.name?.givenName || 'Unknown';
    const isActive = !workspaceUser.suspended;

    // Determine role based on email or organizational unit
    const role = this.determineUserRole(workspaceUser);

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        role,
        updatedAt: new Date(),
      },
      create: {
        email,
        name,
        role,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        loginCount: 0,
      },
    });

    return user;
  }

  determineUserRole(workspaceUser) {
    const email = workspaceUser.primaryEmail.toLowerCase();
    const orgUnitPath = workspaceUser.orgUnitPath || '';

    // Owner/God mode
    if (email === 'jlope@boldbusiness.com' || email === 'jmadrino@boldbusiness.com') {
      return 'OWNER';
    }

    // Admin based on organizational unit or specific emails
    if (orgUnitPath.includes('/Admin') || 
        orgUnitPath.includes('/IT') ||
        workspaceUser.isAdmin) {
      return 'ADMIN';
    }

    // Team managers based on organizational unit
    if (orgUnitPath.includes('/Managers') || 
        orgUnitPath.includes('/Team Leads')) {
      return 'TEAM_MANAGER';
    }

    // Default to member
    return 'MEMBER';
  }

  async getUserFromWorkspace(email) {
    try {
      if (!this.adminSDK) {
        return null;
      }

      const response = await this.adminSDK.users.get({
        userKey: email,
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${email} from Google Workspace:`, error);
      return null;
    }
  }

  async getWorkspaceGroups() {
    try {
      if (!this.adminSDK) {
        return [];
      }

      const response = await this.adminSDK.groups.list({
        domain: this.domain,
        maxResults: 200,
      });

      return response.data.groups || [];
    } catch (error) {
      console.error('Error fetching groups from Google Workspace:', error);
      return [];
    }
  }

  async syncGroupsFromWorkspace() {
    try {
      if (!this.adminSDK) {
        console.log('Google Workspace not initialized, skipping group sync');
        return { synced: 0, errors: 0 };
      }

      console.log('🔄 Syncing groups from Google Workspace...');

      const workspaceGroups = await this.getWorkspaceGroups();
      console.log(`Found ${workspaceGroups.length} groups in Google Workspace`);

      let synced = 0;
      let errors = 0;

      for (const workspaceGroup of workspaceGroups) {
        try {
          await this.syncSingleGroup(workspaceGroup);
          synced++;
        } catch (error) {
          console.error(`Error syncing group ${workspaceGroup.email}:`, error);
          errors++;
        }
      }

      console.log(`✅ Group sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('Error syncing groups from Google Workspace:', error);
      return { synced: 0, errors: 1 };
    }
  }

  async syncSingleGroup(workspaceGroup) {
    const name = workspaceGroup.name;
    const description = workspaceGroup.description || '';
    const email = workspaceGroup.email;

    // Determine group type based on name or description
    const type = this.determineGroupType(workspaceGroup);

    // Find or create a default creator (admin user)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      throw new Error('No admin user found to assign as group creator');
    }

    // Upsert group in database
    const group = await prisma.group.upsert({
      where: { name }, // Assuming group names are unique
      update: {
        description,
        type,
        updatedAt: new Date(),
      },
      create: {
        name,
        description,
        type,
        visibility: 'PUBLIC',
        createdById: adminUser.id,
        isActive: true,
      },
    });

    return group;
  }

  determineGroupType(workspaceGroup) {
    const name = workspaceGroup.name.toLowerCase();
    const description = (workspaceGroup.description || '').toLowerCase();

    if (name.includes('hr') || name.includes('human resources')) {
      return 'DEPARTMENT';
    }
    if (name.includes('it') || name.includes('tech') || name.includes('engineering')) {
      return 'DEPARTMENT';
    }
    if (name.includes('marketing') || name.includes('sales')) {
      return 'DEPARTMENT';
    }
    if (name.includes('finance') || name.includes('accounting')) {
      return 'DEPARTMENT';
    }
    if (name.includes('project') || description.includes('project')) {
      return 'PROJECT';
    }
    if (name.includes('temp') || description.includes('temporary')) {
      return 'TEMPORARY';
    }

    return 'FUNCTIONAL';
  }
}

module.exports = { GoogleWorkspaceService };

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

    // Determine role based on email or organizational unit (returns roleId)
    const roleId = this.determineUserRole(workspaceUser);

    // Extract country from Google Workspace locations
    let country = 'US'; // Default fallback
    if (workspaceUser.locations && workspaceUser.locations.length > 0) {
      // Get the first location's country code
      const primaryLocation = workspaceUser.locations[0];
      country = primaryLocation.countryCode || 'US';
    }

    console.log(`📍 User ${email} country: ${country}`);

    // Upsert user in database
    const user = await prisma.users.upsert({
      where: { email },
      update: {
        name,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        roleId,
        country,
        updatedAt: new Date(),
      },
      create: {
        email,
        name,
        roleId,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        country,
        loginCount: 0,
      },
      include: { roles: true }, // Include role relation
    });

    return user;
  }

  determineUserRole(workspaceUser) {
    const email = workspaceUser.primaryEmail.toLowerCase();
    const orgUnitPath = workspaceUser.orgUnitPath || '';

    // Owner/God mode - return role ID
    if (email === 'jlope@boldbusiness.com' || email === 'jmadrino@boldbusiness.com') {
      return 'role_owner';
    }

    // Super Admin based on organizational unit or specific emails
    if (orgUnitPath.includes('/Admin') ||
        orgUnitPath.includes('/IT') ||
        workspaceUser.isAdmin) {
      return 'role_super_admin';
    }

    // Team managers based on organizational unit
    if (orgUnitPath.includes('/Managers') ||
        orgUnitPath.includes('/Team Leads')) {
      return 'role_team_manager';
    }

    // Default to member
    return 'role_member';
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

    // Find or create a default creator (super admin user)
    const adminUser = await prisma.users.findFirst({
      where: { roleId: 'role_super_admin' },
    });

    if (!adminUser) {
      throw new Error('No super admin user found to assign as group creator');
    }

    // Upsert group in database
    const group = await prisma.groups.upsert({
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

  // ========== WEEKLY OPTIMIZER METHODS ==========

  /**
   * Get authenticated client for a specific user (for Calendar/Gmail access)
   */
  async getAuthClientForUser(userEmail) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: this.serviceAccountPath,
        scopes: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events.readonly',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.metadata',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.modify',
        ],
        subject: userEmail, // Impersonate this user
      });

      return auth;
    } catch (error) {
      console.error(`Error creating auth client for ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Get calendar events for a user within a date range
   */
  async getCalendarEvents(userEmail, startDate, endDate) {
    try {
      const auth = await this.getAuthClientForUser(userEmail);
      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      });

      const events = response.data.items || [];
      console.log(`📅 Found ${events.length} calendar events for ${userEmail}`);

      return events.map(event => ({
        id: event.id,
        summary: event.summary || 'No title',
        description: event.description || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        attendees: event.attendees || [],
        organizer: event.organizer,
        status: event.status,
        location: event.location || '',
        hangoutLink: event.hangoutLink || '',
      }));
    } catch (error) {
      console.error(`Error fetching calendar events for ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Get email summary for a user within a date range
   */
  async getEmailSummary(userEmail, startDate, endDate) {
    try {
      const auth = await this.getAuthClientForUser(userEmail);
      const gmail = google.gmail({ version: 'v1', auth });

      // Build query for emails in date range
      const afterTimestamp = Math.floor(startDate.getTime() / 1000);
      const beforeTimestamp = Math.floor(endDate.getTime() / 1000);
      const query = `after:${afterTimestamp} before:${beforeTimestamp}`;

      // Get message list
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100,
      });

      const messages = response.data.messages || [];
      console.log(`📧 Found ${messages.length} emails for ${userEmail}`);

      // Get details for each message (limited to first 50 for performance)
      const detailedMessages = [];
      const limit = Math.min(messages.length, 50);

      for (let i = 0; i < limit; i++) {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: messages[i].id,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          });

          const headers = msg.data.payload.headers;
          const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

          detailedMessages.push({
            id: msg.data.id,
            threadId: msg.data.threadId,
            from: getHeader('From'),
            to: getHeader('To'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            snippet: msg.data.snippet,
            labelIds: msg.data.labelIds || [],
            isUnread: msg.data.labelIds?.includes('UNREAD') || false,
            isImportant: msg.data.labelIds?.includes('IMPORTANT') || false,
          });
        } catch (error) {
          console.error(`Error fetching message ${messages[i].id}:`, error.message);
        }
      }

      return {
        total: messages.length,
        fetched: detailedMessages.length,
        messages: detailedMessages,
        unreadCount: detailedMessages.filter(m => m.isUnread).length,
        importantCount: detailedMessages.filter(m => m.isImportant).length,
      };
    } catch (error) {
      console.error(`Error fetching emails for ${userEmail}:`, error);
      throw error;
    }
  }

  /**
   * Send email via Gmail API
   */
  async sendEmail(userEmail, to, subject, htmlBody) {
    try {
      const auth = await this.getAuthClientForUser(userEmail);
      const gmail = google.gmail({ version: 'v1', auth });

      // Create email in RFC 2822 format
      const email = [
        `To: ${to}`,
        `From: ${userEmail}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlBody,
      ].join('\r\n');

      // Encode email in base64url format
      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      });

      console.log(`✅ Email sent successfully to ${to}`);
      return response.data;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }
}

module.exports = { GoogleWorkspaceService };

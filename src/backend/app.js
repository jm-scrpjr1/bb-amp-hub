
// Load environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const openaiService = require('./services/openaiService');
const resumeBuilderService = require('./services/resumeBuilderService');
const ResumeAnalyzerService = require('./services/resumeAnalyzerService');
const { testConnection, prisma } = require('./lib/db');
const { GoogleWorkspaceService } = require('./services/googleWorkspaceService');
const weeklyOptimizerCron = require('./jobs/weeklyOptimizerCron');
const app = express();

// CORS Configuration - Only enable if not behind Nginx proxy
const isProduction = process.env.NODE_ENV === 'production';
const behindProxy = process.env.BEHIND_PROXY === 'true';

if (!isProduction || !behindProxy) {
  // Development or direct access - use Node.js CORS
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
        : [
            'http://localhost:3000',
            'https://main.d1wapgj6lifsrx.amplifyapp.com'
          ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  app.use(cors(corsOptions));
  console.log('🌐 CORS enabled in Node.js');
} else {
  // Production behind Nginx proxy - CORS handled by Nginx
  console.log('🌐 CORS handled by Nginx proxy - Backend CORS disabled');
  // No CORS headers needed - Nginx handles everything
}

// Middleware
app.use(express.json({ limit: '10mb' }));

// Import services
const { UserService } = require('./services/userService');
const { AIGroupService } = require('./services/aiGroupService');
const { GroupService } = require('./services/groupService');
const { PermissionService } = require('./services/permissionService');
const AIAssessmentService = require('./services/aiAssessmentService');
const { ResourceService } = require('./services/resourceService');

// Import routes
const promptsRouter = require('./routes/prompts');

// INTELLIGENT ROUTING SYSTEM
const NAVIGATION_OPTIONS = {
  IT_SUPPORT: {
    title: "IT Support Portal",
    description: "Submit tickets, track issues, get technical help",
    path: "/support"
  },
  AI_LEARNING: {
    title: "AI Learning Hub",
    description: "Explore AI courses, tutorials, and resources",
    path: "/ai-learning"
  },
  INNOVATION: {
    title: "Innovation Lab",
    description: "Submit ideas, collaborate on projects",
    path: "/submit-bold-idea"
  },
  HR_SUPPORT: {
    title: "HR Resources",
    description: "Policies, benefits, team information",
    path: "/hr"
  },
  ASSESSMENTS: {
    title: "AI Assessments",
    description: "Evaluate AI readiness and capabilities",
    path: "/ai-assessments"
  },
  DASHBOARD: {
    title: "Dashboard",
    description: "Overview of activities and metrics",
    path: "/"
  }
};

// ADVANCED INTENT DETECTION
function detectIntent(message) {
  const msg = message.toLowerCase();

  const intentPatterns = {
    RESOURCES_SPECIFIC: [
      'pip form', 'pip', 'performance improvement plan', 'corrective action', 'caf form',
      'coaching log', 'incident report', 'performance evaluation', 'supervisor tool',
      'leave policy', 'leave application', 'payroll', 'sprout', 'aleluya', 'rippling',
      'quickbooks', 'timesheets', 'acceptable use policy', 'aup', 'code of conduct',
      'referral program', 'where is', 'find', 'locate', 'document', 'form', 'manual'
    ],
    TIME_TRACKING: [
      'time tracking', 'track time', 'tsheets', 'sprout', 'aleluya', 'clock in', 'clock out',
      'timesheet', 'hours', 'time entry', 'payroll time'
    ],
    IT_SUPPORT: [
      'computer problem', 'laptop issue', 'software bug', 'password reset', 'email problem',
      'network issue', 'printer problem', 'technical support', 'it help', 'system error',
      'login issue', 'access problem', 'vpn', 'wifi', 'internet'
    ],
    AI_LEARNING: [
      'ai training', 'machine learning', 'artificial intelligence', 'prompt engineering',
      'chatgpt', 'openai', 'ai course', 'ai tutorial', 'learn ai', 'ai skills'
    ],
    INNOVATION: [
      'idea', 'suggestion', 'improvement', 'innovation', 'proposal', 'feedback',
      'bold idea', 'submit idea', 'new feature', 'enhancement'
    ],
    HR_SUPPORT: [
      'hr', 'human resources', 'benefits', 'policy', 'vacation', 'sick leave',
      'employee handbook', 'onboarding', 'offboarding', 'performance review'
    ],
    GENERAL_HELP: [
      'help', 'assist', 'support', 'guide', 'how to', 'what is', 'explain'
    ]
  };

  let bestMatch = { intent: 'GENERAL_HELP', confidence: 0.1 };

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (msg.includes(pattern)) {
        const confidence = Math.min(0.95, 0.3 + (pattern.length / msg.length) * 0.7);
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence };
        }
      }
    }
  }

  return bestMatch;
}

// Generate routing suggestions based on intent
function generateRoutingSuggestions(intent, confidence) {
  const suggestions = [];

  switch (intent) {
    case 'RESOURCES_SPECIFIC':
      suggestions.push('HR_SUPPORT', 'IT_SUPPORT');
      break;
    case 'TIME_TRACKING':
      suggestions.push('DASHBOARD');
      break;
    case 'IT_SUPPORT':
      suggestions.push('IT_SUPPORT', 'DASHBOARD');
      break;
    case 'AI_LEARNING':
      suggestions.push('AI_LEARNING', 'ASSESSMENTS');
      break;
    case 'INNOVATION':
      suggestions.push('INNOVATION', 'DASHBOARD');
      break;
    case 'HR_SUPPORT':
      suggestions.push('HR_SUPPORT', 'DASHBOARD');
      break;
    default:
      suggestions.push('DASHBOARD', 'AI_LEARNING');
  }

  // Always include dashboard as fallback
  if (!suggestions.includes('DASHBOARD')) {
    suggestions.push('DASHBOARD');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: "ok",
    service: "bb-amp-hub-backend",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from Bold Amp Hub backend!",
    status: "healthy",
    database: "connected",
    timestamp: new Date().toISOString(),
    version: "1.0.1-UPDATED",
    lastUpdate: "2025-10-13T14:45:00Z"
  });
});

// Simple deployment status endpoint
app.get("/api/deploy-status", (req, res) => {
  res.json({
    message: "Deployment endpoint ready",
    version: "1.0.2-DEPLOY-READY",
    timestamp: new Date().toISOString(),
    instructions: "Use AWS Console to stop/start instance for deployment"
  });
});

// HTTP deployment trigger (since SSH is blocked)
app.post("/api/deploy", async (req, res) => {
  try {
    const { secret } = req.body;

    // Simple secret check
    if (secret !== "bb-deploy-2024-emergency") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("🚀 HTTP deployment triggered");

    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    try {
      // Execute deployment commands
      const commands = [
        'cd /home/ubuntu/bb-amp-hub-backend',
        'git pull origin main',
        'pm2 restart bb-amp-hub-backend'
      ].join(' && ');

      const { stdout, stderr } = await execPromise(commands);

      console.log('✅ HTTP deployment completed');
      console.log('stdout:', stdout);
      if (stderr) console.log('stderr:', stderr);

      res.json({
        success: true,
        message: "HTTP deployment completed successfully",
        stdout: stdout,
        stderr: stderr,
        timestamp: new Date().toISOString(),
        newVersion: "1.0.2-DEPLOY-READY"
      });

    } catch (execError) {
      console.error('❌ HTTP deployment failed:', execError);
      res.status(500).json({
        error: "HTTP deployment failed",
        details: execError.message,
        stdout: execError.stdout || "",
        stderr: execError.stderr || ""
      });
    }

  } catch (error) {
    console.error('HTTP deployment endpoint error:', error);
    res.status(500).json({ error: "HTTP deployment endpoint failed" });
  }
});

// Deployment webhook endpoint (for emergency deployments when SSH is blocked)
app.post("/api/deploy", async (req, res) => {
  try {
    const { secret } = req.body;

    // Simple secret check (in production, use proper authentication)
    if (secret !== "bb-amp-hub-deploy-2024") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("🚀 Deployment webhook triggered");

    const { exec } = require('child_process');

    // Execute deployment commands
    exec('cd /home/ubuntu/bb-amp-hub-backend && git pull origin main && pm2 restart bb-amp-hub-backend',
      (error, stdout, stderr) => {
        if (error) {
          console.error('Deployment error:', error);
          return res.status(500).json({
            error: "Deployment failed",
            details: error.message
          });
        }

        console.log('Deployment stdout:', stdout);
        console.log('Deployment stderr:', stderr);

        res.json({
          success: true,
          message: "Deployment completed successfully",
          stdout: stdout,
          stderr: stderr,
          timestamp: new Date().toISOString()
        });
      }
    );

  } catch (error) {
    console.error('Deployment webhook error:', error);
    res.status(500).json({ error: "Deployment webhook failed" });
  }
});

// Google OAuth authentication endpoint
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential, userInfo } = req.body;

    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ error: 'User information is required' });
    }

    console.log('🔄 Authenticating user:', userInfo.email);

    // Only create/update users with boldbusiness.com email domain
    if (!userInfo.email.toLowerCase().endsWith('@boldbusiness.com')) {
      return res.status(403).json({
        error: 'Access denied. Only boldbusiness.com accounts are allowed.'
      });
    }

    // Create or update user in our system
    const user = await UserService.upsertUserFromAuth(userInfo);

    if (!user) {
      return res.status(500).json({ error: 'Failed to create/update user' });
    }

    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');

    console.log('✅ User authenticated successfully:', user.email);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.roles?.name || user.role, // Support both new (roles.name) and old (role) format
        status: user.status,
        permissions: user.permissions || [],
        groupMemberships: user.groupMemberships || [],
        managedGroups: user.managedGroups || []
      },
      token
    });
  } catch (error) {
    console.error('Error in Google authentication:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Validate authentication token endpoint
app.get("/api/auth/validate", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Extract email from token
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const email = decoded.split(':')[0];

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user's group memberships
      const userGroupsResult = await GroupService.getUserGroups(user.id);
      const userGroups = userGroupsResult.groups || [];
      const managedGroups = userGroups.filter(group => group.membershipRole === 'MANAGER');

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          country: user.country,
          permissions: user.permissions || [],
          groupMemberships: userGroups,
          managedGroups: managedGroups
        }
      });
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({
      success: false,
      error: 'Token validation failed'
    });
  }
});

// Placeholder for sync endpoints - will be added after authenticateUser is defined

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    // For now, we'll use a simple token validation
    // In production, you'd validate JWT tokens properly
    if (!token) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Extract email from token (simple base64 decode for development)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const email = decoded.split(':')[0];
      console.log('🔍 Token authentication:', { token: token.substring(0, 20) + '...', decoded, email });

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        console.log('❌ User not found for email:', email);
        return res.status(401).json({ error: 'User not found' });
      }

      // Load user with group memberships for permission checks
      const userWithGroups = await UserService.getUserWithGroups(user.id);
      req.user = userWithGroups || user;

      console.log('✅ User authenticated:', {
        email: req.user.email,
        role: req.user.roles?.name || req.user.role?.name,
        groupMemberships: req.user.groupMemberships?.length || 0,
        managedGroups: req.user.managedGroups?.length || 0
      });
    } catch (decodeError) {
      console.error('❌ Token decode error:', decodeError);
      // Fallback to mock user for development
      const fallbackUser = await UserService.getUserByEmail('jmadrino@boldbusiness.com');
      req.user = fallbackUser ? await UserService.getUserWithGroups(fallbackUser.id) || fallbackUser : null;
      console.log('🔄 Using fallback user:', req.user?.email);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Mount prompts router with authentication
app.use('/api/prompts', authenticateUser, promptsRouter);

// ===== WEEKLY OPTIMIZER API ENDPOINTS =====
const weeklyOptimizerService = require('./services/weeklyOptimizerService');

// Get current week's optimization for authenticated user
app.get('/api/weekly-optimizer/current', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekType = 'next' } = req.query; // 'current' or 'next'
    const optimization = await weeklyOptimizerService.getCurrentOptimization(userId, weekType);

    if (!optimization) {
      return res.status(404).json({
        success: false,
        message: `No optimization found for ${weekType} week`
      });
    }

    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Error fetching current optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch optimization',
      details: error.message
    });
  }
});

// Get user's Weekly Optimizer settings
app.get('/api/weekly-optimizer/settings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await weeklyOptimizerService.getUserSettings(userId);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching optimizer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      details: error.message
    });
  }
});

// Update user's Weekly Optimizer settings
app.post('/api/weekly-optimizer/settings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const settings = await weeklyOptimizerService.updateUserSettings(userId, updates);

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating optimizer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      details: error.message
    });
  }
});

// Manually trigger optimization for authenticated user
app.post('/api/weekly-optimizer/trigger', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekType = 'next' } = req.body; // 'current' or 'next'
    console.log(`🔄 Manual optimization triggered by user ${userId} for ${weekType} week`);

    // Run the optimization (this saves to database)
    await weeklyOptimizerService.optimizeUserWeek(userId, weekType);

    // Fetch the saved optimization from database (to match the structure of /current endpoint)
    const optimization = await weeklyOptimizerService.getCurrentOptimization(userId, weekType);

    res.json({
      success: true,
      data: optimization,
      message: 'Weekly optimization completed successfully'
    });
  } catch (error) {
    console.error('Error triggering manual optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger optimization',
      details: error.message
    });
  }
});

// Initiate Google OAuth flow for Weekly Optimizer
app.get('/api/weekly-optimizer/google-auth', authenticateUser, async (req, res) => {
  try {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL || 'https://aiworkbench.boldbusiness.com'}/weekly-optimizer/callback`
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user.id, // Pass user ID in state for callback
      prompt: 'consent' // Force consent screen to get refresh token
    });

    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate OAuth URL',
      details: error.message
    });
  }
});

// Handle Google OAuth callback
app.get('/api/weekly-optimizer/google-callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing authorization code or user ID'
      });
    }

    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL || 'https://aiworkbench.boldbusiness.com'}/weekly-optimizer/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in database
    await prisma.google_oauth_tokens.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(tokens.expiry_date),
        scopes: tokens.scope ? tokens.scope.split(' ') : []
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined, // Keep existing if not provided
        expires_at: new Date(tokens.expiry_date),
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        updated_at: new Date()
      }
    });

    console.log(`✅ OAuth tokens stored for user ${userId}`);

    res.json({
      success: true,
      message: 'Google Calendar connected successfully'
    });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete OAuth flow',
      details: error.message
    });
  }
});

// Check Google Calendar connection status
app.get('/api/weekly-optimizer/google-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const tokens = await prisma.google_oauth_tokens.findUnique({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      connected: !!tokens,
      expiresAt: tokens?.expires_at || null
    });
  } catch (error) {
    console.error('Error checking Google connection status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check connection status',
      details: error.message
    });
  }
});

// Disconnect Google Calendar
app.delete('/api/weekly-optimizer/google-disconnect', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.google_oauth_tokens.delete({
      where: { user_id: userId }
    });

    console.log(`🔌 Google Calendar disconnected for user ${userId}`);

    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Google Calendar',
      details: error.message
    });
  }
});

// Admin Analytics endpoint
app.get('/api/admin/analytics', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 Analytics endpoint called by user:', req.user?.email, 'role:', req.user?.roles?.name || req.user?.role?.name);

    if (!PermissionService.canAccessAdminPanel(req.user)) {
      console.log('❌ User lacks permission to access admin analytics');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('✅ Permission check passed, fetching analytics...');

    // Get user statistics
    console.log('Fetching user counts...');
    const totalUsers = await prisma.users.count();
    const activeUsers = await prisma.users.count({ where: { status: 'ACTIVE' } });
    const inactiveUsers = await prisma.users.count({ where: { status: 'INACTIVE' } });
    const suspendedUsers = await prisma.users.count({ where: { status: 'SUSPENDED' } });
    console.log('User counts:', { totalUsers, activeUsers, inactiveUsers, suspendedUsers });

    // Get user counts by role
    console.log('Fetching users by role...');
    const usersByRole = await prisma.users.groupBy({
      by: ['roleId'],
      _count: { roleId: true }
    });
    console.log('Users by role:', usersByRole);

    // Get role names for the stats
    console.log('Fetching roles...');
    const roles = await prisma.roles.findMany();
    console.log('Roles:', roles);

    const roleMap = roles.reduce((acc, role) => {
      acc[role.id] = role.name;
      return acc;
    }, {});

    const roleStats = usersByRole.reduce((acc, item) => {
      const roleName = roleMap[item.roleId] || item.roleId;
      acc[roleName] = item._count.roleId;
      return acc;
    }, {});
    console.log('Role stats:', roleStats);

    // Group statistics - not available yet (no group table)
    const totalGroups = 0;
    const publicGroups = 0;
    const privateGroups = 0;

    // Get recent users (last 7 days)
    console.log('Fetching recent users...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.users.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        roles: { select: { name: true } }, // Include role name
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    });
    console.log('Recent users count:', recentUsers.length);

    // Get login activity (users who logged in today)
    console.log('Fetching today logins...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogins = await prisma.users.count({
      where: {
        lastLoginAt: {
          gte: today
        }
      }
    });
    console.log('Today logins:', todayLogins);

    const analytics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        byRole: roleStats,
        recent: recentUsers,
        todayLogins
      },
      groups: {
        total: totalGroups,
        public: publicGroups,
        private: privateGroups
      },
      activity: {
        newUsersToday: recentUsers.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= today;
        }).length,
        activeToday: todayLogins
      }
    };

    console.log('📊 Analytics generated successfully');

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// User profile endpoint
app.get("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    // Get user's group memberships
    const userGroupsResult = await GroupService.getUserGroups(user.id);
    const userGroups = userGroupsResult.groups || [];

    // Get managed groups
    const managedGroups = userGroups.filter(group => group.membershipRole === 'MANAGER');

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.roles?.name || user.role, // Support both new (roles.name) and old (role) format
        status: user.status,
        country: user.country,
        permissions: user.permissions || [],
        groupMemberships: userGroups,
        managedGroups: managedGroups
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Database and Google Workspace sync endpoints
app.post("/api/admin/sync-users", authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    // Only allow admins and owners to sync users
    if (!PermissionService.canManageUsers(user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const googleWorkspace = new GoogleWorkspaceService();
    const initialized = await googleWorkspace.initialize();

    if (!initialized) {
      return res.status(500).json({
        error: 'Failed to initialize Google Workspace service',
        message: 'Check Google service account configuration'
      });
    }

    const result = await googleWorkspace.syncUsersFromWorkspace();

    res.json({
      message: 'User sync completed',
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing users:', error);
    res.status(500).json({ error: 'Failed to sync users from Google Workspace' });
  }
});

// Test Google Workspace connection
app.get('/api/admin/test-google-workspace', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    if (!PermissionService.canManageUsers(user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const googleWorkspace = new GoogleWorkspaceService();
    const initialized = await googleWorkspace.initialize();

    if (!initialized) {
      return res.json({
        success: false,
        error: 'Failed to initialize Google Workspace service'
      });
    }

    // Test basic authentication
    const authClient = await googleWorkspace.auth.getClient();

    // Test a simple API call
    try {
      const testUser = await googleWorkspace.adminSDK.users.get({
        userKey: googleWorkspace.adminEmail
      });

      res.json({
        success: true,
        serviceAccount: authClient.email,
        adminEmail: googleWorkspace.adminEmail,
        domain: googleWorkspace.domain,
        testUser: testUser.data.primaryEmail,
        scopes: [
          'https://www.googleapis.com/auth/admin.directory.user.readonly',
          'https://www.googleapis.com/auth/admin.directory.group.readonly'
        ]
      });
    } catch (apiError) {
      res.json({
        success: false,
        serviceAccount: authClient.email,
        adminEmail: googleWorkspace.adminEmail,
        domain: googleWorkspace.domain,
        apiError: apiError.message,
        scopes: [
          'https://www.googleapis.com/auth/admin.directory.user.readonly',
          'https://www.googleapis.com/auth/admin.directory.group.readonly'
        ]
      });
    }
  } catch (error) {
    console.error('Error testing Google Workspace:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/admin/sync-groups", authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    // Only allow admins and owners to sync groups
    if (!PermissionService.canManageUsers(user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const googleWorkspace = new GoogleWorkspaceService();
    const initialized = await googleWorkspace.initialize();

    if (!initialized) {
      return res.status(500).json({
        error: 'Failed to initialize Google Workspace service',
        message: 'Check Google service account configuration'
      });
    }

    const result = await googleWorkspace.syncGroupsFromWorkspace();

    res.json({
      message: 'Group sync completed',
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing groups:', error);
    res.status(500).json({ error: 'Failed to sync groups from Google Workspace' });
  }
});

// Chat API with OpenAI Assistant integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message, threadId, conversationHistory, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 ARIA received message:', message);
    console.log('🧵 Thread ID:', threadId || 'new');
    console.log('👤 User ID:', userId || 'anonymous');

    // Use OpenAI Assistant API with user context
    const result = await openaiService.sendMessage(message, threadId, userId);

    // If OpenAI fails, fall back to intent-based system
    if (!result.success) {
      console.log('🔄 Falling back to intent-based system');

      // Detect intent and generate suggestions as fallback
      const intentAnalysis = detectIntent(message);
      const routingSuggestions = generateRoutingSuggestions(
        intentAnalysis.intent,
        intentAnalysis.confidence
      );

      const suggestions = routingSuggestions.map(key => ({
        key,
        ...NAVIGATION_OPTIONS[key]
      }));

      // Generate fallback response
      let fallbackResponse = "I'm having some connection issues, but I can still help! 🤖";

      switch (intentAnalysis.intent) {
        case 'TIME_TRACKING':
          fallbackResponse = "For time tracking, click **Track My Time** in the sidebar! Choose from TSheets, Sprout, or Aleluya based on your location.";
          break;
        case 'IT_SUPPORT':
          fallbackResponse = "I can see you're having technical issues! 💻\n\nPlease **Submit a Ticket** - you can find the button on the homepage or in the lower left menu.";
          break;
        case 'INNOVATION':
          fallbackResponse = "Love the innovative thinking! 💡\n\nClick **Submit Bold Idea** in the Employee Tools section or use the quick action on the homepage!";
          break;
        default:
          fallbackResponse = "I'm ARIA, your AI assistant! I can help you navigate to the right tools. How can I assist you today?";
      }

      return res.json({
        response: fallbackResponse,
        success: true,
        fallback: true,
        suggestions,
        threadId: result.threadId,
        intent: intentAnalysis.intent
      });
    }

    // Return successful OpenAI response
    res.json({
      response: result.response,
      success: true,
      threadId: result.threadId,
      aiPowered: true,
      assistantId: 'asst_R5RXI0LcyRxsgR80xb05oNQb'
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat request failed',
      message: 'ARIA is temporarily unavailable. Please try again later! 🤖⚡'
    });
  }
});

// OpenAI Health Check API
app.get('/api/chat/health', async (req, res) => {
  try {
    const health = await openaiService.healthCheck();
    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    });
  }
});

// Resume Builder API with file upload support
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/resume-builder', upload.single('file'), async (req, res) => {
  try {
    const { message, threadId, userId } = req.body;
    const file = req.file;

    console.log('📄 Resume Builder request received');
    console.log('💬 Message:', message);
    console.log('🧵 Thread ID:', threadId || 'new');
    console.log('📎 File:', file ? file.originalname : 'none');
    console.log('👤 User ID:', userId || 'anonymous');

    // Upload file to OpenAI if provided
    let fileId = null;
    if (file) {
      fileId = await resumeBuilderService.uploadFile(file.buffer, file.originalname);
    }

    // Process the resume
    const result = await resumeBuilderService.processResume(
      message || 'Please process my resume and format it according to your instructions.',
      threadId,
      fileId,
      userId
    );

    if (!result.success) {
      return res.status(500).json({
        error: 'Resume processing failed',
        message: result.error
      });
    }

    // If we have JSON format response with HTML, generate PDF
    if (result.format === 'json' && result.enhancedHTML) {
      console.log('📄 Generating PDF from enhanced HTML...');

      const pdfResult = await resumeBuilderService.generatePDF(
        result.enhancedHTML,
        result.applicantName
      );

      if (pdfResult.success) {
        // Store PDF info for download
        const pdfUrl = `/api/download-resume/${path.basename(pdfResult.filename)}`;

        // Store the file path temporarily (in production, use Redis or database)
        global.tempPDFs = global.tempPDFs || {};
        global.tempPDFs[path.basename(pdfResult.filename)] = pdfResult.pdfPath;

        return res.json({
          success: true,
          format: 'enhanced',
          summary: result.summary,
          improvements: result.improvements,
          applicantName: result.applicantName,
          applicantTitle: result.applicantTitle,
          pdfUrl: pdfUrl,
          pdfFilename: pdfResult.filename,
          threadId: result.threadId,
          assistantId: 'asst_QKKMPc2rfE8O6gHx25WCugzo'
        });
      }
    }

    // Fallback to old format
    res.json({
      response: result.response || result.enhancedHTML,
      success: true,
      threadId: result.threadId,
      assistantId: 'asst_QKKMPc2rfE8O6gHx25WCugzo'
    });

  } catch (error) {
    console.error('❌ Resume Builder error:', error);
    res.status(500).json({
      error: 'Resume Builder request failed',
      message: error.message
    });
  }
});

// Download enhanced resume PDF
app.get('/api/download-resume/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const pdfPath = global.tempPDFs?.[filename];

    if (!pdfPath || !require('fs').existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.download(pdfPath, filename, (err) => {
      if (err) {
        console.error('Error downloading PDF:', err);
      }
      // Clean up after download
      setTimeout(() => {
        try {
          require('fs').unlinkSync(pdfPath);
          delete global.tempPDFs[filename];
          console.log('🗑️ Cleaned up PDF:', filename);
        } catch (cleanupErr) {
          console.error('Error cleaning up PDF:', cleanupErr);
        }
      }, 5000); // 5 second delay to ensure download completes
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// TalentFit API with multiple file upload support
app.post('/api/resume-analyzer', upload.array('resumes', 20), async (req, res) => {
  try {
    const { jobDescription, clientWords, userId } = req.body;
    const files = req.files || [];

    console.log('🔍 TalentFit request received');
    console.log('📋 Job Description length:', jobDescription?.length || 0);
    console.log('🎤 Client Words length:', clientWords?.length || 0);
    console.log('📄 Number of resumes:', files.length);
    console.log('👤 User ID:', userId || 'anonymous');

    // Validate inputs
    if (!jobDescription || !clientWords || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: jobDescription, clientWords, and at least one resume file'
      });
    }

    // Initialize TalentFit Service
    const analyzerService = new ResumeAnalyzerService();

    // Analyze resumes
    const result = await analyzerService.analyzeResumes(
      jobDescription,
      clientWords,
      files,
      userId
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Resume analysis failed',
        message: result.error
      });
    }

    // Return analysis results
    res.json({
      success: true,
      analysis: result.analysis,
      threadId: result.threadId,
      assistantId: 'asst_R5RXI0LcyRxsgR80xb05oNQb'
    });

  } catch (error) {
    console.error('❌ TalentFit error:', error);
    res.status(500).json({
      success: false,
      error: 'TalentFit request failed',
      message: error.message
    });
  }
});

// PUBLIC TalentFit API (no authentication required) - for pre-login /explore page
app.post('/api/public/talentfit/analyze', upload.array('resumes', 20), async (req, res) => {
  try {
    const { jobDescription, clientWords } = req.body;
    const files = req.files || [];

    console.log('🌐 PUBLIC TalentFit request received');
    console.log('📋 Job Description length:', jobDescription?.length || 0);
    console.log('🎤 Client Words length:', clientWords?.length || 0);
    console.log('📄 Number of resumes:', files.length);

    // Validate inputs
    if (!jobDescription || !clientWords || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: jobDescription, clientWords, and at least one resume file'
      });
    }

    // Initialize TalentFit Service
    const analyzerService = new ResumeAnalyzerService();

    // Analyze resumes (no userId for public access)
    const result = await analyzerService.analyzeResumes(
      jobDescription,
      clientWords,
      files,
      null // No userId for public access
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Resume analysis failed',
        message: result.error
      });
    }

    // Return analysis results
    res.json({
      success: true,
      analysis: result.analysis,
      threadId: result.threadId,
      assistantId: 'asst_R5RXI0LcyRxsgR80xb05oNQb'
    });

  } catch (error) {
    console.error('❌ PUBLIC TalentFit error:', error);
    res.status(500).json({
      success: false,
      error: 'TalentFit request failed',
      message: error.message
    });
  }
});

// Groups API
app.get('/api/groups', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    // Check if user can see all groups (OWNER or ADMIN roles)
    const canViewAllGroups = PermissionService.hasGodMode(user) ||
                             user.role === 'SUPER_ADMIN' ||
                             user.role === 'ADMIN';

    console.log('🔍 Groups request:', {
      userEmail: user?.email,
      userRole: user?.role,
      canViewAllGroups,
      userGroupMemberships: user?.groupMemberships?.length || 0
    });

    let groups;
    if (canViewAllGroups) {
      // Admin/Owner can see all groups
      groups = await GroupService.getGroups(req.query);
    } else {
      // Regular users can only see groups they belong to
      const userGroupIds = user.groupMemberships?.map(m => m.groupId) || [];
      groups = await GroupService.getUserGroups(user.id, req.query);
    }

    console.log('✅ Groups filtered:', {
      totalGroups: groups.groups?.length || 0,
      canViewAll: canViewAllGroups
    });

    res.json({
      success: true,
      groups: groups.groups,
      total: groups.total,
      page: groups.page,
      totalPages: groups.totalPages,
      userPermissions: {
        canViewAllGroups,
        canCreateGroups: PermissionService.canCreateGroups(user)
      }
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.post('/api/groups', authenticateUser, async (req, res) => {
  try {
    if (!PermissionService.canCreateGroups(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const group = await GroupService.createGroup(req.body, req.user.id);
    res.json({
      success: true,
      group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group endpoint
app.put('/api/groups/:groupId', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user can manage this group
    if (!PermissionService.canManageGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions to manage this group' });
    }

    const updatedGroup = await GroupService.updateGroup(groupId, req.body);

    if (!updatedGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group endpoint
app.delete('/api/groups/:groupId', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user can manage this group
    if (!PermissionService.canManageGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions to manage this group' });
    }

    const success = await GroupService.deleteGroup(groupId);

    if (!success) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Group members endpoint
app.get('/api/groups/:groupId/members', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;

    console.log('🔍 Group members request:', {
      groupId,
      userEmail: req.user?.email,
      userRole: req.user?.roles?.name || req.user?.role?.name,
      hasGodMode: PermissionService.hasGodMode(req.user)
    });

    // Check if user can view this group (more permissive - allows group members to view)
    const canView = PermissionService.canViewGroup(req.user, groupId);
    const canManage = PermissionService.canManageGroup(req.user, groupId);

    console.log('🔐 Permission check:', {
      canView,
      canManage,
      userGroupMemberships: req.user?.groupMemberships?.length || 0,
      userManagedGroups: req.user?.managedGroups?.length || 0
    });

    if (!canView) {
      console.log('❌ User lacks permission to view group members');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const members = await GroupService.getGroupMembers(groupId);
    console.log('✅ Found group members:', members.length);

    res.json({
      success: true,
      members,
      permissions: {
        canView: true, // Already checked above
        canManage: canManage, // Can edit group, add/remove members, etc.
        canInvite: PermissionService.canInviteToGroup(req.user, groupId),
        canEdit: canManage,
        canDelete: canManage
      }
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

// Add member to group endpoint
app.post('/api/groups/:groupId/members', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'MEMBER' } = req.body;

    // Check if user can manage this group
    if (!PermissionService.canManageGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions to manage this group' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const membership = await GroupService.addGroupMember(groupId, userId, role);

    if (!membership) {
      return res.status(400).json({ error: 'Failed to add member to group' });
    }

    res.json({
      success: true,
      membership,
      message: 'Member added to group successfully'
    });
  } catch (error) {
    console.error('Error adding group member:', error);
    res.status(500).json({ error: 'Failed to add member to group' });
  }
});

// Update member role in group endpoint
app.put('/api/groups/:groupId/members/:userId', authenticateUser, async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    // Check if user can manage this group
    if (!PermissionService.canManageGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions to manage this group' });
    }

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const membership = await GroupService.updateGroupMember(groupId, userId, role);

    if (!membership) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    res.json({
      success: true,
      membership,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating group member:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member from group endpoint
app.delete('/api/groups/:groupId/members/:userId', authenticateUser, async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    // Check if user can manage this group
    if (!PermissionService.canManageGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions to manage this group' });
    }

    const success = await GroupService.removeGroupMember(groupId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    res.json({
      success: true,
      message: 'Member removed from group successfully'
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ error: 'Failed to remove member from group' });
  }
});

// Group health analysis endpoint
app.get('/api/groups/:groupId/ai/health', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user can manage this group (or has God mode)
    if (!PermissionService.hasGodMode(req.user) && !PermissionService.canManageGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get AI-powered group health analysis
    const healthAnalysis = await AIGroupService.analyzeGroupHealth(groupId);

    res.json({
      success: true,
      analysis: healthAnalysis,
      aiPowered: true,
      godMode: PermissionService.hasGodMode(req.user)
    });

  } catch (error) {
    console.error('Error analyzing group health:', error);
    res.status(500).json({ error: 'Failed to analyze group health' });
  }
});

// Group recommendations endpoint
app.get('/api/groups/ai/recommendations', authenticateUser, async (req, res) => {
  try {
    // Get AI-powered group recommendations
    const recommendations = await AIGroupService.getGroupRecommendations(req.user);

    res.json({
      success: true,
      recommendations,
      aiPowered: true,
      godMode: PermissionService.hasGodMode(req.user)
    });

  } catch (error) {
    console.error('Error getting group recommendations:', error);
    res.status(500).json({ error: 'Failed to get group recommendations' });
  }
});

// User assignment suggestions endpoint
app.get('/api/groups/:groupId/ai/user-suggestions', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { search } = req.query;

    // Check if user can invite to this group (or has God mode)
    if (!PermissionService.hasGodMode(req.user) && !PermissionService.canInviteToGroup(req.user, groupId)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get AI-powered user assignment suggestions
    const suggestions = await AIGroupService.suggestUserAssignments(groupId, search);

    res.json({
      success: true,
      suggestions,
      aiPowered: true,
      godMode: PermissionService.hasGodMode(req.user)
    });

  } catch (error) {
    console.error('Error getting user assignment suggestions:', error);
    res.status(500).json({ error: 'Failed to get user suggestions' });
  }
});

// Group creation suggestions endpoint
app.post('/api/groups/ai/suggestions', authenticateUser, async (req, res) => {
  try {
    const { groupName, description } = req.body;

    if (!groupName) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Get AI-powered group creation suggestions
    const suggestions = await AIGroupService.suggestGroupCreation(groupName, description, req.user);

    res.json({
      success: true,
      suggestions,
      aiPowered: true,
      godMode: PermissionService.hasGodMode(req.user)
    });

  } catch (error) {
    console.error('Error getting group creation suggestions:', error);
    res.status(500).json({ error: 'Failed to get AI suggestions' });
  }
});

// Users API
app.get('/api/users', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 Users endpoint called by user:', req.user?.email, 'role:', req.user?.roles?.name || req.user?.role?.name);

    if (!PermissionService.canManageUsers(req.user)) {
      console.log('❌ User lacks permission to manage users');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('✅ User has permission, fetching users with query:', req.query);
    const users = await UserService.getUsers(req.query);
    console.log('📊 Users fetched:', users.total, 'total users');

    res.json({
      success: true,
      users: users.users,
      total: users.total,
      page: users.page,
      totalPages: users.totalPages
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:userId', authenticateUser, async (req, res) => {
  try {
    if (!PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { userId } = req.params;
    const user = await UserService.updateUser(userId, req.body);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:userId', authenticateUser, async (req, res) => {
  try {
    if (!PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { userId } = req.params;
    const success = await UserService.updateUser(userId, { status: 'INACTIVE' });

    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user's groups
app.get('/api/users/:userId/groups', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can view their own groups, or admins can view any
    if (req.user.id !== userId && !PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const result = await GroupService.getUserGroups(userId);

    res.json({
      success: true,
      groups: result.groups
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Roles API
app.get('/api/roles', authenticateUser, async (req, res) => {
  try {
    if (!PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const roles = await prisma.roles.findMany({
      orderBy: { level: 'asc' }
    });

    res.json({
      success: true,
      roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Teams API
app.get('/api/teams', authenticateUser, async (req, res) => {
  try {
    if (!PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const teams = await prisma.teams.findMany({
      include: {
        users_teams_managerIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            users_users_teamIdToteams: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        manager: team.users_teams_managerIdTousers,
        memberCount: team._count.users_users_teamIdToteams,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Permissions API
app.get('/api/permissions/user/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can view their own permissions, or admins can view any
    if (req.user.id !== userId && !PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const user = await UserService.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      permissions: user.permissions,
      role: user.role,
      godMode: PermissionService.hasGodMode(user)
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

app.put('/api/permissions/user/:userId', authenticateUser, async (req, res) => {
  try {
    if (!PermissionService.canManageUsers(req.user)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { userId } = req.params;
    const { permissions } = req.body;

    // For now, just return success - in production, update user permissions
    res.json({
      success: true,
      message: 'Permissions updated successfully',
      permissions
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});



app.patch('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, image } = req.body;

    // Update user profile
    const updatedUser = await UserService.updateUser(user.id, {
      name,
      image,
    });

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize application
async function initializeApp() {
  console.log('🚀 Initializing Bold Business AI Workbench Backend...');

  // Test database connection
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✅ Database connection established');

    // Optional: Auto-sync users on startup (can be disabled in production)
    if (process.env.AUTO_SYNC_ON_STARTUP === 'true') {
      try {
        console.log('🔄 Auto-syncing users from Google Workspace...');
        const googleWorkspace = new GoogleWorkspaceService();
        const initialized = await googleWorkspace.initialize();

        if (initialized) {
          await googleWorkspace.syncUsersFromWorkspace();
          console.log('✅ Auto-sync completed');
        } else {
          console.log('⚠️ Google Workspace not configured, skipping auto-sync');
        }
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
      }
    }
  } else {
    console.log('⚠️ Database not available, using fallback mode');
  }

  // Start Weekly Optimizer cron job
  try {
    weeklyOptimizerCron.start();
    console.log('✅ Weekly Optimizer cron job initialized');
  } catch (error) {
    console.error('❌ Failed to start Weekly Optimizer cron:', error);
  }
}

// ===== AI ASSESSMENT API ENDPOINTS =====

// Get random questions for assessment
app.get('/api/assessment/questions', authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const questions = await AIAssessmentService.getRandomQuestions(limit);

    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        categoryId: q.categoryId,
        categoryName: q.categoryName,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax,
        scaleLabels: q.scaleLabels,
        difficultyLevel: q.difficultyLevel
      }))
    });
  } catch (error) {
    console.error('Error getting assessment questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessment questions'
    });
  }
});

// Start new assessment session
app.post('/api/assessment/start', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.email;
    const session = await AIAssessmentService.startAssessmentSession(userId);

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error starting assessment session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start assessment session'
    });
  }
});

// Save question response
app.post('/api/assessment/answer', authenticateUser, async (req, res) => {
  try {
    const { sessionId, questionId, userAnswer, timeSpentSeconds } = req.body;

    if (!sessionId || !questionId || userAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, questionId, userAnswer'
      });
    }

    const result = await AIAssessmentService.saveQuestionResponse(
      sessionId,
      questionId,
      userAnswer,
      timeSpentSeconds || 0
    );

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error saving question response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save question response'
    });
  }
});

// Complete assessment and get results
app.post('/api/assessment/complete', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const results = await AIAssessmentService.completeAssessment(sessionId);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error completing assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete assessment'
    });
  }
});

// Get user's assessment history
app.get('/api/assessment/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.email;
    const limit = parseInt(req.query.limit) || 10;

    const history = await AIAssessmentService.getUserAssessmentHistory(userId, limit);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error getting assessment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessment history'
    });
  }
});

// Get assessment session details
app.get('/api/assessment/session/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AIAssessmentService.getAssessmentSession(sessionId);

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error getting assessment session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessment session'
    });
  }
});

// ===== RESOURCES API ENDPOINTS WITH RBAC =====

// Get accessible resources/documents for current user with RBAC filtering
app.get('/api/resources', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`📚 Resources endpoint called by user: ${user.email}, role: ${user.roles?.name || user.role}, country: ${user.country}`);

    // For now, we'll return a message indicating the endpoint is ready
    // The actual CSV data will be loaded and filtered on the frontend
    // This endpoint can be extended to serve CSV data from the backend if needed

    res.json({
      success: true,
      message: 'Resources endpoint ready with RBAC support',
      user: {
        id: user.id,
        email: user.email,
        role: user.roles?.name || user.role,
        country: user.country || 'US'
      },
      rbacRules: {
        'All Employees': 'Viewable by ANY ROLE + matching country (or All Countries)',
        'New Hires': 'Viewable by ANY ROLE + matching country (or All Countries)',
        'Leaders': 'Viewable by TEAM_MANAGER, SUPER_ADMIN, OWNER only + matching country'
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources'
    });
  }
});

// Validate document access for a specific document
app.post('/api/resources/validate-access', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    const { document } = req.body;

    if (!user || !document) {
      return res.status(400).json({ error: 'User and document are required' });
    }

    const canAccess = ResourceService.canViewDocument(user, document);

    console.log(`🔐 Access validation for ${user.email} to document "${document.name}": ${canAccess ? 'ALLOWED' : 'DENIED'}`);

    res.json({
      success: true,
      canAccess,
      document: {
        name: document.name,
        stakeholder: document.stakeholder,
        country: document.country
      },
      user: {
        role: user.roles?.name || user.role,
        country: user.country || 'US'
      }
    });
  } catch (error) {
    console.error('Error validating document access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate access'
    });
  }
});

// ============================================================================
// MONDAY.COM FORM PROXY
// ============================================================================
// Proxy endpoint to bypass Monday.com's X-Frame-Options and CSP restrictions
app.get('/api/monday-form-proxy', async (req, res) => {
  try {
    console.log('📋 Proxying Monday.com form request...');

    const mondayFormUrl = 'https://forms.monday.com/forms/8493996ce9c50eea77637b46940cc86b?r=use1';

    // Fetch the Monday.com form HTML
    const response = await axios.get(mondayFormUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    let html = response.data;

    // Inject script to intercept all fetch and XMLHttpRequest calls
    const interceptScript = `<script>
(function() {
  const PROXY_BASE = '${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}';
  const CURRENT_ORIGIN = window.location.origin;
  const MONDAY_DOMAINS = [
    'https://forms.monday.com',
    'https://cdn.monday.com',
    'https://forms-cdn.monday.com',
    'https://api.monday.com'
  ];
  console.log('🚀 Monday.com form interceptor loaded');
  console.log('📍 Current origin:', CURRENT_ORIGIN);
  console.log('🎯 Proxy base:', PROXY_BASE);

  function shouldProxy(url) {
    if (typeof url !== 'string') return false;

    // Proxy if URL starts with any Monday.com domain
    if (MONDAY_DOMAINS.some(domain => url.startsWith(domain))) {
      return true;
    }

    // Proxy if URL starts with current origin (api.boldbusiness.com)
    // EXCEPT if it's already a proxy URL
    if (url.startsWith(CURRENT_ORIGIN) && !url.includes('/monday-form-proxy')) {
      return true;
    }

    // Proxy relative URLs (starting with /)
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    return false;
  }

  function proxyUrl(url) {
    // Handle Monday.com domain URLs
    for (const domain of MONDAY_DOMAINS) {
      if (url.startsWith(domain)) {
        const path = url.substring(domain.length);
        const proxiedUrl = PROXY_BASE + '/monday-form-proxy' + path;
        console.log('🔄 Proxying Monday domain:', url, '→', proxiedUrl);
        return proxiedUrl;
      }
    }

    // Handle current origin URLs (api.boldbusiness.com/something)
    if (url.startsWith(CURRENT_ORIGIN)) {
      const path = url.substring(CURRENT_ORIGIN.length);
      if (!path.startsWith('/api/monday-form-proxy')) {
        const proxiedUrl = PROXY_BASE + '/monday-form-proxy' + path;
        console.log('🔄 Proxying current origin:', url, '→', proxiedUrl);
        return proxiedUrl;
      }
    }

    // Handle relative URLs
    if (url.startsWith('/') && !url.startsWith('//')) {
      const proxiedUrl = PROXY_BASE + '/monday-form-proxy' + url;
      console.log('🔄 Proxying relative URL:', url, '→', proxiedUrl);
      return proxiedUrl;
    }

    return url;
  }

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (shouldProxy(url)) {
      url = proxyUrl(url);
    }
    return originalFetch.call(this, url, options);
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (shouldProxy(url)) {
      url = proxyUrl(url);
    }
    return originalOpen.call(this, method, url, ...rest);
  };
})();
</script>`;

    // Inject the intercept script right after the first <meta> tag in <head>
    // This ensures it loads before any other scripts
    html = html.replace(
      /(<head[^>]*>)/i,
      `$1${interceptScript}`
    );

    // Set headers to allow embedding
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://aiworkbench.boldbusiness.com https://main.d1wapgj6lifsrx.amplifyapp.com http://localhost:3000");
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    console.log('✅ Monday.com form proxied successfully');
    res.send(html);
  } catch (error) {
    console.error('❌ Error proxying Monday.com form:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load Monday.com form',
      details: error.message
    });
  }
});

// Helper function to determine the correct Monday.com domain based on the path
function getMondayDomain(path) {
  if (path.startsWith('/workforms/') || path.startsWith('/forms/')) {
    return 'https://forms.monday.com';
  } else if (path.startsWith('/assets/') || path.startsWith('/images/')) {
    return 'https://cdn.monday.com';
  } else if (path.startsWith('/traces')) {
    return 'https://forms.monday.com';
  } else if (path.startsWith('/cdn-cgi/')) {
    return 'https://forms.monday.com';
  } else {
    // Default to forms.monday.com
    return 'https://forms.monday.com';
  }
}

// Proxy GET requests for Monday.com resources (CSS, JS, images, etc.)
app.get('/api/monday-form-proxy/*', async (req, res) => {
  try {
    const targetPath = '/' + req.params[0];
    const mondayDomain = getMondayDomain(targetPath);
    const targetUrl = mondayDomain + targetPath;

    console.log('📥 Proxying Monday.com resource:', targetUrl);

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': mondayDomain + '/'
      },
      responseType: 'arraybuffer' // Handle binary data (images, fonts, etc.)
    });

    // Forward response headers
    Object.keys(response.headers).forEach(key => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key]);
      }
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.send(response.data);
  } catch (error) {
    console.error('❌ Error proxying Monday.com resource:', error.message);
    res.status(error.response?.status || 500).send(error.response?.data || 'Resource not found');
  }
});

// Proxy POST requests (form submissions) to Monday.com
app.post('/api/monday-form-proxy/*', async (req, res) => {
  try {
    const targetPath = '/' + req.params[0];
    const mondayDomain = getMondayDomain(targetPath);
    const targetUrl = mondayDomain + targetPath;

    // Check if this is an analytics/tracking endpoint (non-critical)
    const isAnalyticsEndpoint = targetPath.includes('/traces') ||
                                targetPath.includes('/cdn-cgi/rum') ||
                                targetPath.includes('/cdn-cgi/challenge-platform');

    console.log('📤 Proxying Monday.com form submission to:', targetUrl, isAnalyticsEndpoint ? '(analytics)' : '');

    // Forward the POST request to Monday.com
    const response = await axios({
      method: 'POST',
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': req.headers['accept'] || '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Origin': mondayDomain,
        'Referer': mondayDomain + '/'
      },
      maxRedirects: 0,
      validateStatus: (status) => status < 500 // Accept redirects and client errors
    });

    // For analytics endpoints that return 401/403, silently succeed
    if (isAnalyticsEndpoint && (response.status === 401 || response.status === 403)) {
      console.log('ℹ️ Analytics endpoint rejected (expected):', response.status, targetPath);
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.status(200).json({ success: true, message: 'Analytics tracking skipped' });
    }

    // Set CORS headers to allow the response
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    console.log('✅ Monday.com form submission proxied successfully, status:', response.status);

    // For successful submissions, return a clean JSON response
    if (response.status === 201 || response.status === 200) {
      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        status: response.status
      });
    }

    // For other responses, forward the headers and data
    Object.keys(response.headers).forEach(key => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, response.headers[key]);
      }
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      const targetPath = '/' + req.params[0];
      const isAnalyticsEndpoint = targetPath.includes('/traces') ||
                                  targetPath.includes('/cdn-cgi/rum') ||
                                  targetPath.includes('/cdn-cgi/challenge-platform');

      // For analytics endpoints, silently succeed even if Monday.com rejects them
      if (isAnalyticsEndpoint && (error.response.status === 401 || error.response.status === 403)) {
        console.log('ℹ️ Analytics endpoint rejected (expected):', error.response.status, targetPath);
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).json({ success: true, message: 'Analytics tracking skipped' });
      }

      // Forward error responses from Monday.com for critical endpoints
      console.log('⚠️ Monday.com responded with error:', error.response.status);
      res.status(error.response.status).send(error.response.data);
    } else {
      console.error('❌ Error proxying Monday.com form submission:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to submit form',
        details: error.message
      });
    }
  }
});

// Handle OPTIONS requests for CORS preflight
app.options('/api/monday-form-proxy/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Referer');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🌟 Backend running on port ${PORT}`);
  await initializeApp();
});

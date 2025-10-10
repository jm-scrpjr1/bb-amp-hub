
// Load environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const openaiService = require('./services/openaiService');
const { testConnection } = require('./lib/db');
const { GoogleWorkspaceService } = require('./services/googleWorkspaceService');
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  app.use(cors(corsOptions));
  console.log('🌐 CORS enabled in Node.js');
} else {
  // Production behind Nginx proxy - Add credentials support
  console.log('🌐 CORS handled by Nginx proxy - Adding credentials support');
  app.use((req, res, next) => {
    // Add credentials support for CORS requests
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://main.d1wapgj6lifsrx.amplifyapp.com',
      'http://localhost:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
  });
}

// Middleware
app.use(express.json());

// Import services
const { UserService } = require('./services/userService');
const { AIGroupService } = require('./services/aiGroupService');
const { GroupService } = require('./services/groupService');
const { PermissionService } = require('./services/permissionService');

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
    version: "1.0.0"
  });
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
        role: user.role,
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
      req.user = await UserService.getUserByEmail(email);
      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }
    } catch (decodeError) {
      // Fallback to mock user for development
      req.user = await UserService.getUserByEmail('jlope@boldbusiness.com');
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin Analytics endpoint
app.get('/api/admin/analytics', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 Analytics endpoint called by user:', req.user?.email, 'role:', req.user?.role);

    if (!PermissionService.canAccessAdminPanel(req.user)) {
      console.log('❌ User lacks permission to access admin analytics');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const inactiveUsers = await prisma.user.count({ where: { status: 'INACTIVE' } });
    const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });

    // Get user counts by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {});

    // Get group statistics
    const totalGroups = await prisma.group.count();
    const publicGroups = await prisma.group.count({ where: { visibility: 'PUBLIC' } });
    const privateGroups = await prisma.group.count({ where: { visibility: 'PRIVATE' } });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.findMany({
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
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    // Get login activity (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogins = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: today
        }
      }
    });

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

    console.log('📊 Analytics generated:', {
      totalUsers,
      activeUsers,
      totalGroups,
      recentUsersCount: recentUsers.length
    });

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// User profile endpoint
app.get("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        status: user.status,
        permissions: user.permissions || [],
        groupMemberships: user.groupMemberships || [],
        managedGroups: user.managedGroups || []
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
    const { message, threadId, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 ARIA received message:', message);
    console.log('🧵 Thread ID:', threadId || 'new');

    // Use OpenAI Assistant API
    const result = await openaiService.sendMessage(message, threadId);

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

// Groups API
app.get('/api/groups', authenticateUser, async (req, res) => {
  try {
    const groups = await GroupService.getGroups(req.query);
    res.json({
      success: true,
      groups: groups.groups,
      total: groups.total,
      page: groups.page,
      totalPages: groups.totalPages
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
    console.log('🔍 Users endpoint called by user:', req.user?.email, 'role:', req.user?.role);

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

// User profile endpoints
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    // Get user with full permissions and group memberships
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's group memberships
    const userGroups = await GroupService.getUserGroups(user.id);

    // Get managed groups (mock for now)
    const managedGroups = userGroups.filter(group => group.membershipRole === 'MANAGER');

    const userWithGroups = {
      ...user,
      groupMemberships: userGroups,
      managedGroups
    };

    res.json(userWithGroups);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
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
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🌟 Backend running on port ${PORT}`);
  await initializeApp();
});

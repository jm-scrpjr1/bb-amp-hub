# BB AMP Hub - System Architecture Documentation

**Last Updated:** November 14, 2024
**Version:** 1.0.1
**Production URL:** https://aiworkbench.boldbusiness.com
**API URL:** https://api.boldbusiness.com

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Schema](#database-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Endpoints](#api-endpoints)
9. [Key Features & Services](#key-features--services)
10. [Deployment Infrastructure](#deployment-infrastructure)
11. [Development Workflow](#development-workflow)
12. [Environment Configuration](#environment-configuration)

---

## 🎯 System Overview

**BB AMP Hub** (Bold Business AI-Amplified Workspace) is a production-grade AI-powered workspace platform designed to enhance employee productivity through AI agents, assessments, prompt libraries, and intelligent workflow automation.

### Core Capabilities
- **ARIA Chatbot** - AI assistant with conversation persistence
- **AI Assessments** - Employee AI readiness evaluation system
- **Prompt Library** - 78 curated AI prompts across 7 categories
- **Weekly Optimizer** - AI-powered calendar and meeting optimization
- **Resume Builder** - AI-enhanced resume generation with PDF export
- **Talent Fit Agent** - AI-powered resume analysis and candidate ranking
- **Group Management** - Role-based access control (RBAC) system
- **Resource Hub** - Centralized document and resource management
- **Admin Panel** - User and system management dashboard

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Framer Motion** | 10.18.0 | Animations and transitions |
| **Radix UI** | Latest | Accessible component primitives |
| **Lucide React** | 0.446.0 | Icon library |
| **Chart.js** | 4.4.9 | Data visualization |
| **Axios** | 1.6.0 | HTTP client |
| **React Hot Toast** | Latest | Notifications |
| **GSAP** | 3.13.0 | Advanced animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **Prisma** | 6.17.1 | ORM and database toolkit |
| **PostgreSQL** | 14.x | Primary database |
| **OpenAI API** | 6.1.0 | AI capabilities |
| **Google APIs** | 128.0.0 | OAuth & Calendar integration |
| **Puppeteer** | 24.26.1 | PDF generation |
| **JWT** | 9.0.2 | Authentication tokens |
| **Node-Cron** | 4.2.1 | Scheduled tasks |
| **PM2** | Latest | Process management |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| **Frontend Hosting** | AWS Amplify | Static site hosting with CI/CD |
| **Backend Hosting** | AWS EC2 | Node.js application server |
| **Database** | AWS RDS | PostgreSQL managed database |
| **Reverse Proxy** | Nginx | HTTPS termination & routing |
| **SSL/TLS** | Let's Encrypt | HTTPS certificates |
| **Version Control** | GitHub | Source code management |

---

## 🏗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA (https://aiworkbench.boldbusiness.com)        │   │
│  │  - React Router (Client-side routing)                    │   │
│  │  - AuthProvider (JWT token management)                   │   │
│  │  - RBACProvider (Role-based access control)              │   │
│  │  - ThemeProvider (Light/Dark mode)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      AWS AMPLIFY (CDN)                           │
│  - Auto-deploy from GitHub main branch                          │
│  - Environment variables injection                              │
│  - Build: npm run build                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                           │
│  Server: api.boldbusiness.com (54.226.14.229)                   │
│  - HTTPS termination (Let's Encrypt SSL)                        │
│  - Proxy to localhost:3001                                      │
│  - CORS headers configuration                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js Server (Port 3001)                           │   │
│  │  Managed by PM2 (bb-amp-hub-backend)                     │   │
│  │  Location: /home/ubuntu/bb-amp-hub-backend               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌────────────────┬────────────────┬────────────────────────┐   │
│  │ OpenAI Service │ Google Service │ Weekly Optimizer       │   │
│  │ Resume Builder │ Assessment Svc │ Group Service          │   │
│  │ User Service   │ Resource Svc   │ Permission Service     │   │
│  └────────────────┴────────────────┴────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (AWS RDS)                           │   │
│  │  Host: ai-workbench.c5vzhv0mqgjy.us-east-1.rds.aws...   │   │
│  │  Database: ai_workbench                                  │   │
│  │  ORM: Prisma Client                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌────────────────┬────────────────┬────────────────────────┐   │
│  │ OpenAI API     │ Google OAuth   │ Google Calendar API    │   │
│  │ Monday.com     │ TSheets        │ Sprout (SSO)           │   │
│  └────────────────┴────────────────┴────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend Architecture

### Directory Structure
```
src/backend/
├── app.js                          # Main Express server (PORT 3001)
├── package.json                    # Dependencies & scripts
├── prisma/
│   ├── schema.prisma              # Database schema (SINGLE SOURCE OF TRUTH)
│   └── migrations/                # Database migration history
├── services/                      # Business logic layer
│   ├── openaiService.js          # ARIA chatbot & OpenAI integration
│   ├── weeklyOptimizerService.js # Calendar optimization AI
│   ├── resumeBuilderService.js   # Resume PDF generation
│   ├── resumeAnalyzerService.js  # TalentFit resume analysis AI
│   ├── googleWorkspaceService.js # Google OAuth & Calendar
│   ├── aiAssessmentService.js    # AI readiness assessments
│   ├── groupService.js           # Group management
│   ├── userService.js            # User management
│   ├── permissionService.js      # RBAC permissions
│   ├── resourceService.js        # Resource management
│   └── ariaConversationService.js # ARIA conversation persistence
├── routes/                        # API route handlers
│   ├── prompts.js                # Prompt Library API
│   └── (inline in app.js)        # Other routes defined in app.js
├── middleware/
│   ├── auth.js                   # JWT authentication
│   └── rbac.js                   # Role-based access control
├── lib/
│   └── db.js                     # Prisma client & DB connection
├── jobs/
│   └── weeklyOptimizerCron.js    # Scheduled optimization tasks
├── migrations/                    # Data migration scripts
│   ├── reset_assessment_with_new_questions.sql
│   ├── question_scoring_map.json
│   └── run_assessment_reset.js
└── uploads/                       # File upload storage
```

### Key Backend Services

#### 1. OpenAI Service (`openaiService.js`)
- **Purpose:** ARIA chatbot integration
- **Assistant ID:** `asst_R5RXI0LcyRxsgR80xb05oNQb`
- **Features:**
  - Thread management
  - Message streaming
  - Conversation context
  - Session-based persistence

#### 2. Weekly Optimizer Service (`weeklyOptimizerService.js`)
- **Purpose:** AI-powered calendar optimization
- **Assistant ID:** `asst_4m7Z1Op1hSjkHZPek9tMSJlr`
- **Features:**
  - Google Calendar integration
  - Meeting analysis
  - Focus time recommendations
  - Daily/weekly breakdown
  - Scheduled optimization (cron jobs)

#### 3. Resume Builder Service (`resumeBuilderService.js`)
- **Purpose:** AI-enhanced resume generation
- **Technology:** Puppeteer for PDF generation
- **Features:**
  - Multiple template support
  - AI content enhancement
  - PDF export
  - Real-time preview

#### 4. AI Assessment Service (`aiAssessmentService.js`)
- **Purpose:** Employee AI readiness evaluation
- **Features:**
  - 35 questions across 7 categories
  - Weighted scoring system
  - Randomized question selection (15-20 per session)
  - AI Readiness Levels: AI Champion, AI Explorer, AI Learner, Needs Development
  - Session management with abort capability

#### 5. Google Workspace Service (`googleWorkspaceService.js`)
- **Purpose:** Google OAuth & Calendar integration
- **Features:**
  - OAuth 2.0 authentication
  - Calendar event retrieval
  - Meeting attendee analysis
  - Service account support

#### 6. Group Service (`groupService.js`)
- **Purpose:** Team and group management
- **Features:**
  - CRUD operations for groups
  - Member management
  - Permission-based access
  - Group types: Department, Project, Functional, Temporary, Custom

#### 7. ARIA Conversation Service (`ariaConversationService.js`)
- **Purpose:** Conversation persistence
- **Features:**
  - Thread-to-user mapping
  - Message history storage
  - Topic tracking
  - User preferences

#### 8. Resume Analyzer Service (`resumeAnalyzerService.js`)
- **Purpose:** TalentFit AI-powered resume analysis
- **Assistant ID:** `asst_R5RXI0LcyRxsgR80xb05oNQb` (same as ARIA)
- **Features:**
  - Multi-format support (PDF, DOCX)
  - Parallel file processing for speed
  - PDF upload to OpenAI file_search
  - DOCX text extraction with Mammoth
  - Job description matching
  - Client preference alignment
  - Candidate ranking with scores
  - Key strengths and concerns analysis
  - Public and authenticated endpoints

### API Middleware

#### Authentication Middleware (`authenticateUser`)
```javascript
// Validates JWT tokens from Authorization header
// Attaches user object to req.user
// Used on all protected routes
```

#### RBAC Middleware
- Role hierarchy: OWNER > SUPER_ADMIN > ADMIN > MANAGER > TEAM_MANAGER > MEMBER
- Permission checks based on user role
- Group-level permissions

---

## 🎨 Frontend Architecture

### Directory Structure
```
src/frontend/react_workbench/src/
├── App.js                         # Main React app with routing
├── index.js                       # React entry point
├── index.css                      # Global styles (Tailwind)
├── components/
│   ├── layout/                   # Layout components
│   │   ├── MainLayout.js         # Main app layout with sidebar
│   │   ├── Sidebar.js            # Navigation sidebar
│   │   └── Header.js             # Top header bar
│   ├── dashboard/                # Dashboard components
│   │   ├── WelcomeSection.js     # User welcome card
│   │   ├── QuickActions.js       # Quick action buttons
│   │   ├── HeroSection.js        # Hero banner
│   │   ├── BoldUpdates.js        # Company updates feed
│   │   ├── ActivitySection.js    # Recent activity
│   │   ├── AIReadinessCard.js    # AI assessment status
│   │   ├── WeeklyOptimizerCard.js # Weekly insights card
│   │   ├── ProjectsSection.js    # Projects overview
│   │   ├── TrainingStatus.js     # Training progress
│   │   └── index.js              # Barrel exports
│   ├── ui/                       # Reusable UI components
│   │   ├── FloatingChatbot.js    # ARIA chatbot widget
│   │   ├── TrackTimeModal.js     # Time tracking modal
│   │   ├── BoldIdeaModal.js      # Submit idea modal
│   │   ├── GenieModal.js         # Animated modal wrapper
│   │   ├── AnimatedRobot.js      # Robot animations
│   │   ├── DirectMessageModal.js # DM interface
│   │   ├── GroupChatModal.js     # Group chat interface
│   │   └── index.js              # Barrel exports
│   ├── modals/                   # Feature modals
│   │   ├── WeeklyOptimizerModal.js       # Full optimizer view
│   │   ├── WeeklyOptimizerSetupModal.js  # Optimizer settings
│   │   ├── DocumentViewerModal.js        # Document preview
│   │   └── ResumeBuilderModal.js         # Resume builder
│   ├── TalentFitModal.js         # TalentFit resume analysis
│   ├── TalentFitHowItWorksModal.js # TalentFit onboarding
│   ├── assessment/               # AI Assessment components
│   │   ├── AIAssessmentDatabase.js       # Assessment UI
│   │   └── StartAssessmentButton.js      # Start button
│   ├── auth/                     # Authentication components
│   │   └── ProtectedRoute.js     # Route protection wrapper
│   ├── effects/                  # Visual effects
│   │   ├── ScrollEffects.js      # Scroll animations
│   │   └── index.js              # Barrel exports
│   ├── onboarding/               # Onboarding flows
│   │   └── AmplificationOnboarding.js    # Feature tour
│   └── animations/               # Animation utilities
│       └── GSAPProvider.js       # GSAP context provider
├── pages/                        # Page components
│   ├── HomePage.js               # Dashboard home
│   ├── MySpacePage.js            # Personal workspace
│   ├── AIAgentsPage.js           # AI agents catalog
│   ├── AIAssessmentsPage.js      # Assessment page
│   ├── PromptLibraryPage.js      # Prompt library
│   ├── AutomationsPage.js        # Automations catalog
│   ├── TrainingsPage.js          # Training resources
│   ├── ResourcesPage.js          # Document resources
│   ├── GroupsPage.js             # Group management
│   ├── AdminPage.js              # Admin dashboard
│   ├── AdminUsersPage.js         # User management
│   ├── ProfilePage.js            # User profile
│   ├── SettingsPage.js           # App settings
│   ├── SignInPage.js             # Sign-in page
│   ├── PreLoginPage.js           # Landing/explore page
│   └── NotFoundPage.js           # 404 page
├── providers/                    # React context providers
│   ├── AuthProvider.js           # Authentication context
│   ├── RBACProvider.js           # RBAC context
│   └── ThemeProvider.js          # Theme context
├── services/                     # API service layer
│   ├── backendAuthService.js     # Backend auth API
│   ├── googleAuthService.js      # Google OAuth
│   ├── apiService.js             # Generic API client
│   └── adminService.js           # Admin API calls
├── config/
│   └── environment.js            # Environment configuration
└── lib/
    ├── logger.js                 # Logging utility
    └── permissions.js            # Permission helpers
```

### React Router Structure
```javascript
// Public Routes
/ → PreLoginPage (Landing page)
/explore → PreLoginPage (Explore features)
/auth/signin → SignInPage (Google OAuth)
/weekly-optimizer/callback → WeeklyOptimizerCallback (OAuth callback)

// Protected Routes (require authentication)
/home → HomePage (Dashboard)
/my-space → MySpacePage (Personal workspace)
/ai-agents → AIAgentsPage (AI agents catalog)
/prompts → PromptLibraryPage (Prompt library)
/automations → AutomationsPage (Automations)
/trainings → TrainingsPage (Training resources)
/resources → ResourcesPage (Documents)
/groups → GroupsPage (Group management)
/profile → ProfilePage (User profile)
/settings → SettingsPage (Settings)

// Admin Routes (require ADMIN/SUPER_ADMIN/OWNER role)
/admin → AdminPage (Admin dashboard)
/admin/users → AdminUsersPage (User management)
```

### Key Frontend Patterns

#### 1. Context Providers
- **AuthProvider**: Manages authentication state, JWT tokens, user info
- **RBACProvider**: Provides role-based access control helpers
- **ThemeProvider**: Light/dark mode management

#### 2. Protected Routes
```javascript
<ProtectedRoute requireAdmin={true}>
  <AdminPage />
</ProtectedRoute>
```

#### 3. API Service Layer
- Centralized API calls through `backendAuthService`
- Automatic token injection
- Error handling and retry logic

#### 4. Animation System
- Framer Motion for component animations
- GSAP for advanced effects
- ScrollEffects for scroll-triggered animations

---

## 🗄 Database Schema

### PostgreSQL Database (AWS RDS)
- **Host:** `ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com`
- **Database:** `ai_workbench`
- **Port:** 5432
- **ORM:** Prisma 6.17.1

### Core Tables

#### Users & Authentication
```sql
users
├── id (String, PK)
├── email (String, unique)
├── name (String)
├── image (String)
├── status (UserStatus: ACTIVE/INACTIVE/SUSPENDED)
├── roleId (String, FK → roles)
├── country (String, default: 'US')
├── loginCount (Int)
├── lastLoginAt (DateTime)
├── createdAt (DateTime)
└── updatedAt (DateTime)

roles
├── id (String, PK)
├── name (String, unique)
├── description (String)
├── level (Int, unique)
└── timestamps
```

**Role Hierarchy:**
1. OWNER (level 100)
2. SUPER_ADMIN (level 90)
3. ADMIN (level 80)
4. MANAGER (level 70)
5. TEAM_MANAGER (level 60)
6. MEMBER (level 50)

#### Groups & Permissions
```sql
groups
├── id (String, PK)
├── name (String)
├── description (String)
├── type (GroupType: DEPARTMENT/PROJECT/FUNCTIONAL/TEMPORARY/CUSTOM)
├── visibility (GroupVisibility: PUBLIC/PRIVATE/RESTRICTED)
├── createdById (String, FK → users)
├── managerId (String, FK → users)
└── timestamps

group_memberships
├── id (String, PK)
├── userId (String, FK → users)
├── groupId (String, FK → groups)
├── role (MemberRole: OWNER/ADMIN/MEMBER)
├── status (MembershipStatus: ACTIVE/PENDING/INACTIVE/REMOVED)
└── timestamps

group_permissions
├── id (String, PK)
├── groupId (String, FK → groups)
├── userId (String, FK → users)
├── permission (String)
└── timestamps
```

#### ARIA Chatbot
```sql
aria_conversations
├── id (String, PK)
├── user_id (String, FK → users)
├── thread_id (String, unique)
├── started_at (DateTime)
├── last_message_at (DateTime)
├── message_count (Int)
├── topics (String[])
├── user_preferences (JSON)
└── is_active (Boolean)

aria_messages
├── id (String, PK)
├── conversation_id (String, FK → aria_conversations)
├── role (String: 'user'/'assistant')
├── content (Text)
├── created_at (DateTime)
└── metadata (JSON)
```

#### AI Assessments
```sql
assessment_categories
├── id (String, PK)
├── name (String)
├── description (String)
├── weight (Decimal)
└── order (Int)

assessment_questions
├── id (String, PK)
├── category_id (String, FK → assessment_categories)
├── question_text (Text)
├── question_type (String)
├── options (JSON)
├── correct_answer (String)
├── points (Int)
└── order (Int)

user_assessment_sessions
├── id (String, PK)
├── user_id (String, FK → users)
├── started_at (DateTime)
├── completed_at (DateTime)
├── status (String: 'in_progress'/'completed'/'aborted')
└── total_score (Decimal)

user_question_responses
├── id (String, PK)
├── session_id (String, FK → user_assessment_sessions)
├── question_id (String, FK → assessment_questions)
├── user_answer (String)
├── is_correct (Boolean)
├── points_earned (Int)
└── answered_at (DateTime)

assessment_results
├── id (String, PK)
├── session_id (String, FK → user_assessment_sessions)
├── category_id (String, FK → assessment_categories)
├── score (Decimal)
├── max_score (Decimal)
└── percentage (Decimal)
```

#### Weekly Optimizer
```sql
weekly_optimizations
├── id (String, PK)
├── user_id (String, FK → users)
├── week_start (Date)
├── week_end (Date)
├── optimization_data (JSON)
├── created_at (DateTime)
└── updated_at (DateTime)

weekly_optimizer_settings
├── id (String, PK)
├── user_id (String, FK → users)
├── schedule_enabled (Boolean)
├── schedule_day (String)
├── schedule_time (String)
├── delivery_methods (String[])
└── updated_at (DateTime)
```

#### Prompt Library
```sql
prompt_library
├── id (String, PK)
├── title (String)
├── description (Text)
├── category (String)
├── prompt_text (Text)
├── variables (JSON)
├── created_by (String, FK → users)
├── is_favorite (Boolean)
├── usage_count (Int)
└── timestamps
```

#### Resources
```sql
resources
├── id (String, PK)
├── title (String)
├── description (Text)
├── file_url (String)
├── file_type (String)
├── category (String)
├── visibility (String: 'public'/'private'/'group')
├── uploaded_by (String, FK → users)
└── timestamps
```

---

## 🔌 API Endpoints

### Base URL
- **Production:** `https://api.boldbusiness.com/api`
- **Local:** `http://localhost:3001/api`

### Authentication Endpoints
```
POST   /auth/google              # Google OAuth authentication
POST   /auth/refresh              # Refresh JWT token
GET    /auth/me                   # Get current user info
POST   /auth/logout               # Logout user
```

### User Management
```
GET    /users                     # List all users (admin)
GET    /users/:id                 # Get user by ID
PUT    /users/:id                 # Update user
DELETE /users/:id                 # Delete user (admin)
PUT    /users/:id/role            # Update user role (admin)
PUT    /users/:id/status          # Update user status (admin)
```

### Group Management
```
GET    /groups                    # List all groups
POST   /groups                    # Create group
GET    /groups/:id                # Get group details
PUT    /groups/:id                # Update group
DELETE /groups/:id                # Delete group
POST   /groups/:id/members        # Add member to group
DELETE /groups/:id/members/:userId # Remove member from group
GET    /groups/:id/permissions    # Get group permissions
POST   /groups/:id/permissions    # Grant permission
DELETE /groups/:id/permissions/:permissionId # Revoke permission
```

### ARIA Chatbot
```
POST   /aria/chat                 # Send message to ARIA
GET    /aria/conversations        # Get user's conversations
GET    /aria/conversations/:id    # Get conversation details
DELETE /aria/conversations/:id    # Delete conversation
```

### AI Assessments
```
POST   /assessment/start          # Start new assessment session
GET    /assessment/session/:id    # Get session details
POST   /assessment/answer         # Submit answer
POST   /assessment/complete       # Complete assessment
DELETE /assessment/session/:id    # Abort assessment
GET    /assessment/results/:userId # Get user's assessment results
GET    /assessment/history/:userId # Get assessment history
```

### Prompt Library
```
GET    /prompts                   # List all prompts
GET    /prompts/:id               # Get prompt details
POST   /prompts/:id/execute       # Execute prompt with GPT-4o
POST   /prompts/:id/favorite      # Toggle favorite
GET    /prompts/categories        # Get all categories
GET    /prompts/search?q=         # Search prompts
```

### Weekly Optimizer
```
GET    /weekly-optimizer/current?weekType=current|next  # Get optimization
POST   /weekly-optimizer/trigger  # Trigger new optimization
GET    /weekly-optimizer/settings # Get user settings
PUT    /weekly-optimizer/settings # Update settings
POST   /weekly-optimizer/schedule # Schedule optimization
GET    /weekly-optimizer/history  # Get optimization history
```

### Resume Builder
```
POST   /resume/build              # Generate resume PDF
POST   /resume/analyze            # Analyze resume with AI
GET    /resume/templates          # Get available templates
```

### Talent Fit Agent
```
POST   /talentfit/analyze         # Analyze resumes (authenticated)
POST   /public/talentfit/analyze  # Analyze resumes (public access)
```

**Request Format:**
```javascript
// FormData with:
// - jobDescription (string)
// - clientWords (string)
// - resumes (files[]) - PDF or DOCX
```

**Response Format:**
```javascript
{
  success: true,
  analysis: "AI-generated analysis with rankings...",
  threadId: "thread_xxx",
  assistantId: "asst_R5RXI0LcyRxsgR80xb05oNQb"
}
```

### Resources
```
GET    /resources                 # List resources
POST   /resources                 # Upload resource
GET    /resources/:id             # Get resource details
DELETE /resources/:id             # Delete resource
GET    /resources/download/:id    # Download resource
```

### Admin Panel
```
GET    /admin/analytics           # Get system analytics
GET    /admin/users               # Get all users with filters
POST   /admin/users/sync          # Sync users from Google Workspace
GET    /admin/groups              # Get all groups
GET    /admin/activity            # Get system activity logs
```

---


## 🔐 Authentication & Authorization

### Authentication Flow

```
1. User clicks "Sign in with Google" on SignInPage
   ↓
2. Google OAuth popup opens (Google Identity Services)
   ↓
3. User authenticates with Google
   ↓
4. Google returns credential (JWT token)
   ↓
5. Frontend sends credential to backend: POST /auth/google
   ↓
6. Backend validates Google token
   ↓
7. Backend creates/updates user in PostgreSQL
   ↓
8. Backend generates custom JWT token
   ↓
9. Frontend stores JWT in localStorage ('auth_token')
   ↓
10. Frontend redirects to /home
```

### JWT Token Structure
```javascript
{
  userId: "user_id_here",
  email: "user@boldbusiness.com",
  role: "ADMIN",
  iat: 1234567890,
  exp: 1234567890 + (7 * 24 * 60 * 60) // 7 days
}
```

### Authorization (RBAC)

#### Role Hierarchy
```
OWNER (100)
  ↓
SUPER_ADMIN (90)
  ↓
ADMIN (80)
  ↓
MANAGER (70)
  ↓
TEAM_MANAGER (60)
  ↓
MEMBER (50)
```

#### Permission Checks
```javascript
// Frontend (RBACProvider)
const { hasPermission, isAdmin, isOwner } = useRBAC();

if (hasPermission('manage_users')) {
  // Show admin UI
}

// Backend (middleware)
app.get('/admin/users', authenticateUser, requireRole('ADMIN'), (req, res) => {
  // Only ADMIN+ can access
});
```

#### Group-Level Permissions
- **OWNER/SUPER_ADMIN/ADMIN**: Can manage all groups
- **MANAGER/TEAM_MANAGER**: Can edit groups where they are members
- **MEMBER**: Read-only access to their groups

---

## 🚀 Deployment Infrastructure

### Frontend Deployment (AWS Amplify)

**URL:** https://aiworkbench.boldbusiness.com

**Configuration:**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd src/frontend/react_workbench
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: src/frontend/react_workbench/build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Environment Variables (Amplify):**
```
REACT_APP_API_URL=https://api.boldbusiness.com/api
REACT_APP_GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
REACT_APP_ENVIRONMENT=production
```

**Deployment Trigger:**
- Automatic deployment on `git push origin main`
- Build time: ~3-5 minutes
- Rollback available through Amplify console

---

### Backend Deployment (AWS EC2)

**Server:** Ubuntu 20.04 LTS
**IP:** 54.226.14.229
**Domain:** api.boldbusiness.com
**SSH Key:** `~/Downloads/AI Workbench SSH.pem`

**Directory Structure:**
```
/home/ubuntu/
├── bb-amp-hub-backend/          # Git repository
│   ├── src/backend/             # Backend code
│   ├── .env                     # Environment variables
│   └── ...
└── nginx/                       # Nginx configuration
```

**PM2 Process Management:**
```bash
# Service name: bb-amp-hub-backend
pm2 list                         # List all processes
pm2 logs bb-amp-hub-backend      # View logs
pm2 restart bb-amp-hub-backend   # Restart service
pm2 stop bb-amp-hub-backend      # Stop service
pm2 start bb-amp-hub-backend     # Start service
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl;
    server_name api.boldbusiness.com;

    ssl_certificate /etc/letsencrypt/live/api.boldbusiness.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.boldbusiness.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Deployment Process:**
```bash
# 1. SSH into EC2
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229

# 2. Navigate to backend directory
cd /home/ubuntu/bb-amp-hub-backend

# 3. Pull latest changes
git pull origin main

# 4. Install dependencies (if needed)
cd src/backend
npm install

# 5. Run database migrations (if needed)
npx prisma migrate deploy

# 6. Restart PM2 service
pm2 restart bb-amp-hub-backend

# 7. Check logs
pm2 logs bb-amp-hub-backend --lines 50
```

**Auto-Deployment:**
- Backend auto-deploys via GitHub webhook (optional)
- Currently manual deployment via SSH

---

### Database (AWS RDS PostgreSQL)

**Connection Details:**
```
Host: ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com
Port: 5432
Database: ai_workbench
Username: postgresadmin
Password: [Stored in .env]
```

**Prisma Management:**
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Open Prisma Studio (local)
npx prisma studio
# Access at: http://localhost:5555
```

**Backup Strategy:**
- AWS RDS automated backups (daily)
- Retention period: 7 days
- Point-in-time recovery enabled

---

## 💻 Development Workflow

### Local Development Setup

#### Prerequisites
```bash
- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL client (optional, for direct DB access)
- Git
```

#### Frontend Setup
```bash
# 1. Clone repository
git clone https://github.com/jm-scrpjr1/bb-amp-hub.git
cd bb-amp-hub

# 2. Navigate to frontend
cd src/frontend/react_workbench

# 3. Install dependencies
npm install

# 4. Create .env file
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
echo "REACT_APP_GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com" >> .env

# 5. Start development server
npm start
# Access at: http://localhost:3000
```

#### Backend Setup
```bash
# 1. Navigate to backend
cd src/backend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgresadmin:UDGDYf4ET3s6dfyAeusD@ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432/ai_workbench
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=org-cRVzeAj1CBsZgGArW3a3aVIx
OPENAI_ASSISTANT_ID=asst_R5RXI0LcyRxsgR80xb05oNQb
WEEKLY_OPTIMIZER_ASSISTANT_ID=asst_4m7Z1Op1hSjkHZPek9tMSJlr
JWT_SECRET=your_jwt_secret
PORT=3001
EOF

# 4. Generate Prisma Client
npx prisma generate

# 5. Start development server
npm run dev
# Access at: http://localhost:3001
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "Add feature description"

# 3. Push to GitHub
git push origin feature/your-feature-name

# 4. Create Pull Request (optional)
# Or merge directly to main for immediate deployment

# 5. Deploy to production
git checkout main
git merge feature/your-feature-name
git push origin main
# Frontend auto-deploys via Amplify
# Backend requires manual deployment via SSH
```

### Testing

#### Manual Testing
```bash
# Frontend
npm start
# Test in browser at http://localhost:3000

# Backend
npm run dev
# Test API endpoints with Postman or curl
```

#### Database Testing
```bash
# Open Prisma Studio
npx prisma studio
# Access at: http://localhost:5555
```

---

## 🔧 Environment Configuration

### Frontend Environment Variables

**Development (.env.local):**
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
REACT_APP_ENVIRONMENT=development
```

**Production (AWS Amplify):**
```
REACT_APP_API_URL=https://api.boldbusiness.com/api
REACT_APP_GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
REACT_APP_ENVIRONMENT=production
```

### Backend Environment Variables

**Production (EC2 .env):**
```
DATABASE_URL=postgresql://postgresadmin:***@ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432/ai_workbench
OPENAI_API_KEY=sk-***
OPENAI_ORG_ID=org-cRVzeAj1CBsZgGArW3a3aVIx
OPENAI_ASSISTANT_ID=asst_R5RXI0LcyRxsgR80xb05oNQb
WEEKLY_OPTIMIZER_ASSISTANT_ID=asst_4m7Z1Op1hSjkHZPek9tMSJlr
JWT_SECRET=***
PORT=3001
NODE_ENV=production
GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=***
```

---

## 📊 Key Features & Services

### 1. ARIA Chatbot
- **Technology:** OpenAI Assistant API
- **Assistant ID:** `asst_R5RXI0LcyRxsgR80xb05oNQb`
- **Features:**
  - Conversation persistence (PostgreSQL)
  - Session-based context management
  - Knowledge of BB AMP Hub features
  - Floating widget on all pages

### 2. AI Assessments
- **Questions:** 35 across 7 categories
- **Categories:**
  - Willingness to Learn (15%)
  - Digital Curiosity (15%)
  - Process Thinking (20%)
  - AI Literacy (10%)
  - Problem-Solving (15%)
  - Communication (15%)
  - Growth Mindset (10%)
- **Scoring:** Weighted category scores, capped at 100%
- **Levels:** AI Champion, AI Explorer, AI Learner, Needs Development

### 3. Prompt Library
- **Total Prompts:** 78
- **Categories:** Finance (2), General Use (32), HR (2), IT (9), Marketing (5), Operations (22), Sales (6)
- **Features:**
  - Search and filter
  - Favorites
  - GPT-4o execution
  - Variable substitution

### 4. Weekly Optimizer
- **Technology:** OpenAI Assistant API + Google Calendar API
- **Features:**
  - Calendar analysis
  - Meeting breakdown
  - Focus time recommendations
  - People you meet with
  - Scheduled optimization (cron)
  - Email/dashboard delivery

### 5. Resume Builder
- **Technology:** Puppeteer + OpenAI
- **Features:**
  - Multiple templates
  - AI content enhancement
  - PDF export
  - Real-time preview

### 6. Group Management
- **Features:**
  - RBAC-based permissions
  - Group types: Department, Project, Functional, Temporary, Custom
  - Member management
  - Permission delegation

### 7. Talent Fit Agent
- **Technology:** OpenAI Assistant API + Mammoth (DOCX parsing)
- **Assistant ID:** `asst_R5RXI0LcyRxsgR80xb05oNQb`
- **Features:**
  - Multi-format resume support (PDF, DOCX)
  - Parallel file processing for maximum speed
  - Job description matching
  - Client preference alignment
  - AI-powered candidate ranking
  - Key strengths identification
  - Potential concerns flagging
  - Structured output format
  - Public and authenticated access
- **Use Cases:**
  - Recruiter candidate screening
  - Hiring manager resume review
  - Client-facing talent matching
  - Internal hiring processes

---

## 📝 Notes & Best Practices

### Code Organization
- **Backend:** Service layer pattern (services handle business logic, routes handle HTTP)
- **Frontend:** Component-based architecture with context providers
- **Database:** Prisma schema is the single source of truth

### Security
- JWT tokens expire after 7 days
- HTTPS enforced on all production endpoints
- CORS configured for specific origins
- Role-based access control on all sensitive endpoints

### Performance
- Framer Motion animations optimized for 60fps
- GSAP effects temporarily disabled for performance
- Database queries optimized with Prisma
- PM2 cluster mode for backend (if needed)

### Monitoring
- PM2 logs for backend errors
- AWS Amplify build logs for frontend
- PostgreSQL slow query logs
- OpenAI API usage tracking

---

## 🆘 Troubleshooting

### Frontend Issues
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm start
```

### Backend Issues
```bash
# Check PM2 logs
pm2 logs bb-amp-hub-backend --lines 100

# Restart service
pm2 restart bb-amp-hub-backend

# Check Nginx status
sudo systemctl status nginx
```

### Database Issues
```bash
# Test connection
npx prisma db pull

# Reset database (CAUTION: Development only)
npx prisma migrate reset

# View database
npx prisma studio
```

---

## 📚 Additional Resources

- **GitHub Repository:** https://github.com/jm-scrpjr1/bb-amp-hub
- **Production Frontend:** https://aiworkbench.boldbusiness.com
- **Production API:** https://api.boldbusiness.com
- **Prisma Documentation:** https://www.prisma.io/docs
- **React Documentation:** https://react.dev
- **OpenAI API Documentation:** https://platform.openai.com/docs

---

**Document Version:** 1.1
**Last Updated:** November 14, 2024
**Maintained By:** BB AMP Hub Development Team

**Changelog:**
- v1.1 (Nov 14, 2024): Added Talent Fit Agent documentation
- v1.0 (Nov 14, 2024): Initial comprehensive architecture documentation

# BB AMP Hub - AI Agent Handoff Summary
**Last Updated:** 2025-11-21
**Repository:** https://github.com/jm-scrpjr1/bb-amp-hub.git
**Local Path:** `/Users/JM/Documents/GitHub_2/bb-amp-hub`

---

## 🎯 PROJECT OVERVIEW

**Bold Business AI Workbench (BB AMP Hub)** - An AI-amplified workspace platform for employees to access IT, HR, and project resources with integrated AI agents, automation tools, and resume building capabilities.

### Core Features
- **AI Agents (ARIA)** - OpenAI Assistant-powered chatbot (ID: `asst_R5RXI0LcyRxsgR80xb05oNQb`)
- **Prompt Library** - 78 AI prompts across 7 categories with GPT-4o execution
- **Weekly Optimizer** - AI-powered calendar analysis and scheduling optimization
- **Resume Builder (Boldified Resume Builder)** - AI-powered resume generation with custom PDF templates
- **Group Management** - RBAC-based team/department organization
- **AI Assessments** - Skill assessment and evaluation system
- **Automations** - Workflow automation tools
- **Trainings** - Learning management system
- **Resources** - Document and resource library

---

## 🏗️ ARCHITECTURE

### Frontend (React.js - PRODUCTION)
- **Framework:** React 18 + React Router v6
- **UI:** Tailwind CSS + Custom Components
- **State Management:** React Context (AuthProvider, RBACProvider)
- **HTTP Client:** Axios with custom API wrapper
- **Deployment:** AWS Amplify (auto-deploy on git push to main)
- **Production URL:** https://aiworkbench.boldbusiness.com
- **Amplify URL:** https://main.d1wapgj6lifsrx.amplifyapp.com (redirects to custom domain)
- **Code Location:** `src/frontend/react_workbench/`
- **Build Output:** `src/frontend/react_workbench/build/`
- **Port (local):** 3000

**Key Technologies:**
- React Router for navigation
- Google OAuth for authentication
- Tailwind CSS for styling
- Axios for API calls
- React Context for global state

### Backend (Node.js + Express)
- **Framework:** Express.js
- **Runtime:** Node.js
- **Database ORM:** Prisma
- **Authentication:** JWT + Google OAuth
- **Process Manager:** PM2 on EC2
- **Web Server:** Nginx (reverse proxy, HTTPS termination)
- **Deployment:** AWS EC2 (Ubuntu) - Git-based deployment
- **Production URL:** https://api.boldbusiness.com
- **Code Location:** `src/backend/`
- **Port:** 3001 (proxied by nginx on port 443)

**Key Technologies:**
- Express.js for REST API
- Prisma for database access
- OpenAI API for AI features
- Google Calendar API for calendar integration
- Puppeteer for PDF generation (resume builder)
- PM2 for process management
- Nginx for HTTPS and reverse proxy

### Database
- **Type:** PostgreSQL 16
- **ORM:** Prisma
- **Production:** AWS RDS at `ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432`
- **Database Name:** `ai_workbench`
- **Schema Location:** `src/backend/prisma/schema.prisma` (SINGLE SOURCE OF TRUTH)
- **Migrations:** `src/backend/prisma/migrations/`
- **Local Management:** Prisma Studio on `localhost:5555`

**Key Tables:**
- `users` - User accounts and profiles
- `roles` - RBAC roles (OWNER, ADMIN, MEMBER, etc.)
- `groups` - Team/department organization
- `group_members` - User-group relationships
- `prompts` - Prompt Library (78 prompts)
- `prompt_favorites` - User favorites
- `aria_conversations` - ARIA chat sessions
- `aria_messages` - ARIA chat messages
- `weekly_optimizations` - Weekly Optimizer results
- `weekly_optimizer_settings` - User preferences
- `google_oauth_tokens` - OAuth tokens for Google integration

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  React 18 + Tailwind CSS + React Router                    │
│  https://aiworkbench.boldbusiness.com                       │
│  (AWS Amplify - Auto-deploy on git push)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS API Calls
                      │ (Axios with JWT)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      NGINX (EC2)                            │
│  HTTPS Termination + Reverse Proxy                         │
│  https://api.boldbusiness.com → localhost:3001             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (EC2)                             │
│  Node.js + Express.js (PM2 managed)                        │
│  Port 3001                                                  │
│  /home/ubuntu/bb-amp-hub-backend/                          │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                  │
│  • openaiService.js - ARIA chatbot                         │
│  • weeklyOptimizerService.js - Calendar optimization       │
│  • promptLibraryService.js - Prompt execution              │
│  • resumeBuilderService.js - PDF generation                │
│  • googleWorkspaceService.js - Google OAuth & Calendar     │
└─────────────────────┬───────────────────────────────────────┘
                      │ Prisma ORM
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (AWS RDS)                           │
│  ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com    │
│  Database: ai_workbench                                     │
│  Port: 5432                                                 │
└─────────────────────────────────────────────────────────────┘

External Integrations:
├─ OpenAI API (GPT-4o) - ARIA, Prompt Library, Weekly Optimizer
├─ Google OAuth - Authentication
└─ Google Calendar API - Weekly Optimizer calendar data
```

---

## 🚀 DEPLOYMENT SETUP

### AWS EC2 Backend Server
- **IP:** `54.226.14.229`
- **SSH Key:** `~/Downloads/AI Workbench SSH.pem`
- **User:** `ubuntu`
- **Backend Directory:** `/home/ubuntu/bb-amp-hub-backend/`
- **Git Repository:** Git clone of https://github.com/jm-scrpjr1/bb-amp-hub.git
- **Process Manager:** PM2 (service name: `bb-amp-hub-backend`)
- **Web Server:** Nginx (handles HTTPS, proxies to backend on port 3001)
- **SSL:** Configured via nginx for HTTPS
- **Auto-Deploy:** Git-based - push to main, then SSH and git pull

#### Backend Deployment Commands (Git-Based - RECOMMENDED)
```bash
# 1. Commit and push changes
git add -A
git commit -m "Your descriptive message"
git push origin main

# 2. SSH to EC2, pull changes, and restart
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "cd /home/ubuntu/bb-amp-hub-backend && git pull && pm2 restart bb-amp-hub-backend"

# 3. Check logs to verify
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 50"
```

#### Alternative: Direct SCP (for quick single-file fixes)
```bash
# Deploy single file
scp -i ~/Downloads/"AI Workbench SSH.pem" src/backend/services/someService.js ubuntu@54.226.14.229:/home/ubuntu/bb-amp-hub-backend/services/

# Restart backend
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 restart bb-amp-hub-backend"
```

#### Useful Backend Commands
```bash
# Check PM2 status
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 status"

# View logs (live stream)
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend"

# View logs (last 200 lines, no stream)
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 200 --nostream"

# Restart service
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 restart bb-amp-hub-backend"

# Check nginx status
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "sudo systemctl status nginx"

# View nginx error logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "sudo tail -50 /var/log/nginx/error.log"
```

### AWS Amplify Frontend
- **App ID:** `d1wapgj6lifsrx`
- **Branch:** `main`
- **Build Config:** `amplify.yml` (at repository root)
- **Auto-Deploy:** Enabled (deploys on git push to main)
- **Build Location:** `src/frontend/react_workbench/`
- **Build Output:** `src/frontend/react_workbench/build/`
- **Build Time:** ~3-5 minutes

#### Amplify Build Configuration (`amplify.yml`)
**Important:** The `amplify.yml` file at the repository root tells Amplify:
1. **appRoot:** `src/frontend/react_workbench` - where to find the React app
2. **preBuild:** Install dependencies, set environment variables
3. **build:** Run `npm run build`
4. **artifacts:** Serve files from `build/` directory
5. **cache:** Cache `node_modules/` for faster builds

**Environment Variables (set in Amplify Console):**
- `REACT_APP_API_URL` - Backend API URL (https://api.boldbusiness.com)
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `REACT_APP_OPENAI_API_KEY` - OpenAI API key
- `REACT_APP_OPENAI_ASSISTANT_ID` - ARIA assistant ID
- `REACT_APP_OPENAI_ORG_ID` - OpenAI organization ID
- `REACT_APP_ENVIRONMENT` - Set to "production"

**DO NOT edit `amplify.yml` unless:**
- Changing build directory structure
- Adding new environment variables
- Modifying build commands
- Changing cache settings

#### Frontend Deployment
```bash
# Automatic deployment on push
git add -A
git commit -m "Your message"
git push origin main
# Amplify auto-builds and deploys (takes ~3-5 minutes)

# Check build status:
# 1. Go to AWS Amplify Console
# 2. Select bb-amp-hub app
# 3. View build logs under "main" branch
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Google OAuth
- **Client ID:** `1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com`
- **Domain Restriction:** `@boldbusiness.com` emails only
- **Auto-Create Users:** Yes - users auto-created in PostgreSQL on first login
- **Profile Sync:** Name, email, and profile image synced from Google

### RBAC (Role-Based Access Control)
**Roles (in order of permissions):**
1. **OWNER** - Full system access (jmadrino@boldbusiness.com has this)
2. **SUPER_ADMIN** - Full admin panel access
3. **ADMIN** - Admin panel access
4. **TEAM_MANAGER** - Can manage assigned teams
5. **MANAGER** - Limited management capabilities
6. **MEMBER** - Standard user access

**Group Management Permissions:**
- ADMIN/SUPER_ADMIN/OWNER: Can manage all groups and add members
- MANAGERS/TEAM_MANAGERS: Can only edit groups where they are members
- MEMBERs: Cannot manage groups

---

## 📁 KEY FILE LOCATIONS & STRUCTURE

### Backend Critical Files
```
src/backend/
├── app.js                              # Main Express server (PORT 3001)
├── services/
│   ├── openaiService.js               # OpenAI Assistant (ARIA) integration
│   ├── resumeBuilderService.js        # Resume PDF generation with Puppeteer
│   ├── googleWorkspaceService.js      # Google OAuth & Calendar integration
│   ├── weeklyOptimizerService.js      # ⭐ Weekly calendar optimization AI
│   └── promptLibraryService.js        # Prompt Library execution service
├── routes/
│   ├── auth.js                        # Authentication endpoints
│   ├── users.js                       # User management
│   ├── groups.js                      # Group management
│   ├── aria.js                        # ARIA chatbot endpoints
│   ├── resume.js                      # Resume builder endpoints
│   ├── prompts.js                     # ⭐ Prompt Library API (/api/prompts)
│   ├── weeklyOptimizer.js             # ⭐ Weekly Optimizer API
│   └── admin.js                       # Admin panel endpoints
├── prisma/
│   ├── schema.prisma                  # Database schema (SINGLE SOURCE OF TRUTH)
│   └── migrations/                    # Database migration history
├── lib/
│   └── db.js                          # Prisma client & DB connection
└── middleware/
    ├── auth.js                        # JWT authentication middleware
    └── rbac.js                        # Role-based access control
```

### Frontend Critical Files
```
src/frontend/react_workbench/
├── src/
│   ├── App.js                         # Main React app with routing
│   ├── providers/
│   │   ├── AuthProvider.js           # Google OAuth provider
│   │   └── RBACProvider.js           # Role-based access control
│   ├── pages/
│   │   ├── SignInPage.js             # Google OAuth sign-in
│   │   ├── MySpacePage.js            # Dashboard with Weekly Optimizer
│   │   ├── AIAgentsPage.js           # ARIA chatbot interface
│   │   ├── PromptLibraryPage.js      # ⭐ Prompt Library (78 prompts)
│   │   ├── ResumeBuilderPage.js      # Resume builder interface
│   │   ├── GroupsPage.js             # Group management
│   │   ├── AdminPanelPage.js         # Admin panel (OWNER/ADMIN only)
│   │   └── ExplorePage.js            # Feature discovery page
│   ├── components/
│   │   ├── Navigation.js             # Left sidebar navigation
│   │   ├── WeeklyOptimizerModal.js   # ⭐ Weekly Optimizer UI
│   │   ├── PromptExecutionModal.js   # ⭐ Prompt execution interface
│   │   └── [other components]
│   ├── config/
│   │   └── environment.js            # Environment configuration
│   └── utils/
│       └── api.js                    # API client with auth headers
├── public/
│   ├── assets/                       # Images, logos, bot animations
│   └── index.html                    # HTML template
└── package.json                      # Frontend dependencies
```

### Deployment Configuration Files
```
Root Directory:
├── amplify.yml                        # ⭐ AWS Amplify build config (FRONTEND)
├── package.json                       # Root package.json (for Amplify build)
├── deploy-backend.sh                  # Backend deployment script
└── nginx.conf                         # Nginx config (on EC2 server)
```

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env on EC2)
```bash
PORT=3001
NODE_ENV=production
BEHIND_PROXY=true
DATABASE_URL=postgresql://postgresadmin:UDGDYf4ET3s6dfyAeusD@ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432/ai_workbench
GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
OPENAI_API_KEY=[set on server]
OPENAI_ASSISTANT_ID=asst_R5RXI0LcyRxsgR80xb05oNQb
CORS_ORIGIN=https://main.d1wapgj6lifsrx.amplifyapp.com,http://localhost:3000
```

### Frontend (AWS Amplify Environment Variables)
```bash
REACT_APP_API_URL=https://api.boldbusiness.com
REACT_APP_GOOGLE_CLIENT_ID=1095873294496-47956hstcv5fgol4tf7mplog3o417hkj.apps.googleusercontent.com
REACT_APP_OPENAI_API_KEY=[set in Amplify]
REACT_APP_OPENAI_ASSISTANT_ID=asst_R5RXI0LcyRxsgR80xb05oNQb
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_BACKEND_AUTH=true
```

---

## 🤖 ARIA CHATBOT (AI Assistant)

### Implementation
- **Provider:** OpenAI Assistant API
- **Assistant ID:** `asst_R5RXI0LcyRxsgR80xb05oNQb`
- **Conversation Persistence:** PostgreSQL with session-based summarization
- **Tables:** `aria_conversations`, `aria_messages`
- **Context Loading:** Loads existing context at session start
- **Storage:** Messages stored during conversation, summarized per userID at session end
- **Service File:** `src/backend/services/openaiService.js`
- **API Routes:** `src/backend/routes/aria.js`

### Key Features
- Personalized context without performance compromise
- Session-based conversation management
- Automatic context summarization
- User-specific conversation history
- Knowledge of BB AMP Hub features including Resources section

---

## 📚 PROMPT LIBRARY (Production Feature)

### Overview
**Status:** ✅ FULLY DEPLOYED - "NEW HOLY GRAIL" build
**Total Prompts:** 78 AI prompts across 7 categories
**Execution:** GPT-4o powered with real-time AI responses

### Categories & Counts
- **Finance:** 2 prompts
- **General Use:** 32 prompts
- **HR:** 2 prompts
- **IT:** 9 prompts
- **Marketing:** 5 prompts
- **Operations:** 22 prompts
- **Sales:** 6 prompts

### Technical Implementation
**Database Schema:**
```sql
Table: prompts
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- category (VARCHAR)
- prompt_text (TEXT)
- how_to_use (TEXT)
- catchy_name (VARCHAR)
- created_at (TIMESTAMP)
```

**Backend:**
- **Service:** `src/backend/services/promptLibraryService.js`
- **API Routes:** `src/backend/routes/prompts.js`
- **Endpoints:**
  - `GET /api/prompts` - List all prompts
  - `GET /api/prompts/:id` - Get single prompt
  - `POST /api/prompts/:id/execute` - Execute prompt with GPT-4o
  - `POST /api/prompts/:id/favorite` - Toggle favorite
  - `GET /api/prompts/favorites` - Get user favorites

**Frontend:**
- **Page:** `src/frontend/react_workbench/src/pages/PromptLibraryPage.js`
- **Features:**
  - Search across all prompts
  - Filter by category
  - Favorite prompts (per user)
  - Execute prompts with custom inputs
  - View AI responses in modal

### User Preferences
- **Response Label:** "ARIA's Response" (not "AI Response")
- **Formatting:** Markdown formatting (###, **) removed from responses for cleaner output
- **Production URLs:**
  - Frontend: https://aiworkbench.boldbusiness.com
  - API: https://api.boldbusiness.com/api/prompts

---

## 📅 WEEKLY OPTIMIZER (AI Calendar Analysis)

### Overview
**Status:** ✅ PRODUCTION FEATURE
**Purpose:** AI-powered calendar analysis and scheduling optimization
**AI Model:** OpenAI GPT-4o
**Integration:** Google Calendar API

### How It Works
1. **Fetches** upcoming week's calendar events from Google Calendar
2. **Analyzes** meetings, conflicts, focus time, and workload
3. **Detects** scheduling conflicts and overlaps
4. **Suggests** intelligent time slot adjustments
5. **Prioritizes** what to move (Placeholders > Focus Time > Real Meetings)
6. **Validates** suggestions don't create new conflicts or eliminate lunch breaks
7. **Provides** deterministic recommendations (same calendar = same suggestions)

### Technical Implementation
**Service File:** `src/backend/services/weeklyOptimizerService.js`

**Key Functions:**
- `optimizeUserWeek(userId)` - Main optimization function
- `analyzeCalendarData(events)` - Detect conflicts and analyze workload
- `generateRecommendations(calendarData, emailData, userContext)` - AI prompt engineering
- `formatDailySchedule(eventDetails)` - Create structured schedule for AI grounding
- `findFreeSlots(events)` - Identify available time slots (30+ min gaps)

**Database Tables:**
```sql
weekly_optimizations
- id (UUID)
- user_id (UUID)
- week_start_date (DATE)
- week_end_date (DATE)
- optimization_data (JSONB)
- created_at (TIMESTAMP)

weekly_optimizer_settings
- id (UUID)
- user_id (UUID)
- enabled (BOOLEAN)
- schedule_day (VARCHAR)
- schedule_time (TIME)
- delivery_email (BOOLEAN)
- delivery_dashboard (BOOLEAN)
- user_role (VARCHAR)
- top_priorities (TEXT)
- time_constraints (TEXT)
- improvement_feedback (TEXT)

weekly_optimizer_logs
- id (UUID)
- user_id (UUID)
- execution_time (TIMESTAMP)
- status (VARCHAR)
- processing_time (INTEGER)
- error_message (TEXT)
```

**API Routes:** `src/backend/routes/weeklyOptimizer.js`
- `POST /api/weekly-optimizer/optimize` - Run optimization
- `GET /api/weekly-optimizer/current` - Get current week's optimization
- `GET /api/weekly-optimizer/settings` - Get user settings
- `PUT /api/weekly-optimizer/settings` - Update settings

**Frontend:**
- **Component:** `src/frontend/react_workbench/src/components/WeeklyOptimizerModal.js`
- **Trigger:** Available on MySpace page and AI Agents page
- **UI:** Modal with executive summary, conflicts, and recommendations

### AI Prompt Engineering (CRITICAL)
**Structured Daily Schedule Format:**
The AI receives a formatted schedule showing:
- All meetings by day (Monday-Friday)
- Meeting names and time ranges
- **FREE TIME SLOTS** for each day (30+ min gaps)
- This grounds the AI and ensures deterministic analysis

**Example:**
```
THURSDAY:
  8:00 AM - 9:00 AM - John's Focus Time - Emails and Chats
  8:00 AM - 8:15 AM - Place Holder: Daily Start of Shift Report
  9:00 AM - 10:00 AM - Dustin's Team Call
  12:00 PM - 3:00 PM - John's Focus Time - Project Work
  FREE TIME SLOTS:
    10:00 AM - 12:00 PM
    3:00 PM - 4:00 PM
```

**Priority Algorithm:**
1. **Placeholders first** - Move placeholder meetings before real meetings
2. **Focus time second** - Consider moving focus blocks instead of multiple meetings
3. **Real meetings last** - Only move actual meetings if no other option

**Validation Checklist (AI must verify):**
- ✓ Does suggested time conflict with existing meetings?
- ✓ Does suggested time conflict with other suggested moves?
- ✓ Does it eliminate or overlap with lunch break?
- ✓ Is there a better free slot available?
- ✓ After all moves, is lunch still intact?

### Recent Fixes & Improvements
1. ✅ **Deterministic Analysis** - Same calendar produces same recommendations
2. ✅ **Structured Schedule** - AI sees actual meeting names and free slots
3. ✅ **Smart Conflict Resolution** - Prioritizes moving placeholders over real meetings
4. ✅ **Validation** - Ensures suggestions don't conflict with each other
5. ✅ **Lunch Preservation** - Never eliminates lunch breaks
6. ✅ **Free Slot Detection** - Identifies 30+ minute gaps for rescheduling
7. ✅ **Field Name Fix** - Uses `e.title` instead of `e.summary` from calendar events

### Known Issues & Solutions
**Problem:** Meeting names showing as "undefined"
**Cause:** `analyzeCalendarData()` returns events with `title` field, not `summary`
**Solution:** Use `e.title || e.summary || 'No title'` when mapping events
**Status:** ✅ FIXED (commit 058e3bb)

---

## 📄 RESUME BUILDER (Boldified Resume Builder)

### Current Status (Latest Changes)
**Clean layout with proper spacing:**
- Header image at top (all pages)
- **Page 1:** Name with purple underline, then content
- **Page 2+:** Just content (no name repetition)
- Footer image at bottom (all pages)

### Technical Implementation
- **Service:** `src/backend/services/resumeBuilderService.js`
- **PDF Generation:** Puppeteer
- **Templates:** Header/Footer images as base64
- **Margins:** 48mm top, 38mm bottom for header/footer clearance
- **Page Breaks:** Intelligent section handling to avoid awkward splits

### Recent Fixes
1. ✅ Removed decorative borders/backgrounds (were just mockup guides)
2. ✅ Name section only appears on page 1
3. ✅ Improved page break handling
4. ✅ Content flows naturally across pages
5. ✅ Proper spacing between header/footer and content

---

## ⚠️ CRITICAL WARNINGS & DO'S AND DON'TS

### 🚫 DO NOT MODIFY (WORKING PERFECTLY)
1. **Authentication System** - Working perfectly, confirmed by user multiple times
2. **Google OAuth Configuration** - Properly configured and tested
3. **Nginx Configuration on EC2** - Handles HTTPS and proxying correctly
4. **CORS Settings** - Configured correctly for production and localhost
5. **Commit 43093eb (/explore page)** - This is the "HOLY GRAIL" build to preserve

### ✅ ALWAYS DO
1. **Use Package Managers** - NEVER manually edit `package.json`, `requirements.txt`, etc.
   - Use: `npm install <package>`, `npm uninstall <package>`
   - Reason: Prevents version conflicts, updates lock files, resolves dependencies
2. **Use Prisma Migrations** - NEVER manually edit database with SQL
   - Edit `schema.prisma` → Run `npx prisma migrate dev --name "description"`
   - Reason: Tracks changes, preserves data, keeps dev/prod in sync
3. **Test Locally First** - Before deploying to production
4. **Commit with Descriptive Messages** - Explain what changed and why
5. **Use Codebase Retrieval** - Before making edits, search for related code
6. **Ask User Permission** - Before installing dependencies, pushing to remote, or making potentially damaging changes
7. **Preserve Existing Functionality** - Over adding new visual effects
8. **Make Parallel Tool Calls** - When reading multiple files or running multiple read-only commands

### 🚫 NEVER DO
1. **Never manually edit package files** - Use package managers instead
2. **Never modify auth without explicit permission** - It's working perfectly
3. **Never commit or push without user approval** - User wants control
4. **Never install dependencies without asking** - User prefers to approve first
5. **Never create documentation files unless requested** - User doesn't want unsolicited docs
6. **Never do more than user asked** - Focus on the specific request
7. **Never manually edit database** - Use Prisma migrations
8. **Never change database schema without migrations** - Data loss risk

### 📋 DEPLOYMENT WORKFLOW (CRITICAL)

#### Frontend Deployment (Automatic via Amplify)
```bash
# 1. Make changes in src/frontend/react_workbench/
# 2. Test locally (optional but recommended)
cd src/frontend/react_workbench
npm start  # Test on localhost:3000

# 3. Commit and push to main
git add -A
git commit -m "Descriptive message explaining what changed"
git push origin main

# 4. AWS Amplify auto-deploys (takes ~3-5 minutes)
# 5. Verify at https://aiworkbench.boldbusiness.com
```

**Important Notes:**
- Amplify builds from `src/frontend/react_workbench/` directory
- Build config is in `amplify.yml` at root
- Environment variables set in AWS Amplify Console
- Build logs available in AWS Amplify Console

#### Backend Deployment (Manual via EC2)
```bash
# METHOD 1: Git-based deployment (RECOMMENDED)
# 1. Commit changes to git
git add -A
git commit -m "Descriptive message"
git push origin main

# 2. SSH to EC2 and pull changes
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "cd /home/ubuntu/bb-amp-hub-backend && git pull && pm2 restart bb-amp-hub-backend"

# 3. Verify logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 50"

# METHOD 2: Direct SCP (for quick fixes)
# 1. Copy specific file to EC2
scp -i ~/Downloads/"AI Workbench SSH.pem" src/backend/services/someService.js ubuntu@54.226.14.229:~/bb-amp-hub-backend/services/

# 2. Restart PM2
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 restart bb-amp-hub-backend"
```

**Important Notes:**
- Backend runs on EC2 at `/home/ubuntu/bb-amp-hub-backend/`
- PM2 service name: `bb-amp-hub-backend`
- Backend is a git clone of the main repo
- Always restart PM2 after changes
- Check logs to verify deployment success

#### Database Changes (Use Migrations!)
```bash
# 1. Edit schema
# Edit src/backend/prisma/schema.prisma

# 2. Create migration
cd src/backend
npx prisma migrate dev --name "add_new_field_to_users"

# 3. Test locally
npx prisma studio  # Verify changes

# 4. Deploy to production
npx prisma migrate deploy

# 5. Regenerate Prisma client
npx prisma generate

# 6. Commit migration files
git add prisma/migrations/
git commit -m "Migration: add new field to users"
git push origin main

# 7. Deploy backend (see Backend Deployment above)
```

### 🔍 WHICH FILES TO EDIT

#### Frontend Changes
**Edit these files:**
- `src/frontend/react_workbench/src/pages/*.js` - Page components
- `src/frontend/react_workbench/src/components/*.js` - Reusable components
- `src/frontend/react_workbench/src/App.js` - Routing and main app
- `src/frontend/react_workbench/src/config/environment.js` - Config (rarely)
- `src/frontend/react_workbench/src/utils/api.js` - API client

**DO NOT edit:**
- `src/frontend/react_workbench/src/providers/AuthProvider.js` - Auth is working perfectly
- `amplify.yml` - Unless you know what you're doing
- `package.json` - Use npm install/uninstall instead

#### Backend Changes
**Edit these files:**
- `src/backend/services/*.js` - Business logic and integrations
- `src/backend/routes/*.js` - API endpoints
- `src/backend/prisma/schema.prisma` - Database schema (then run migrations)
- `src/backend/middleware/*.js` - Auth, RBAC, etc.

**DO NOT edit:**
- `src/backend/app.js` - Unless adding new routes or middleware
- `src/backend/lib/db.js` - Database connection is stable
- `.env` on EC2 - Environment variables are set correctly
- `nginx.conf` on EC2 - HTTPS and proxying work correctly

#### Configuration Files
**Rarely edit:**
- `amplify.yml` - Frontend build configuration
- `package.json` (root) - Only for Amplify build dependencies
- `src/backend/package.json` - Use npm install/uninstall instead
- `src/frontend/react_workbench/package.json` - Use npm install/uninstall instead

### 🎯 DEPLOYMENT CHECKLIST

**Before Deploying:**
- [ ] Changes tested locally (if applicable)
- [ ] Code reviewed for errors
- [ ] Dependencies installed via package manager (not manual edit)
- [ ] Database migrations created (if schema changed)
- [ ] Commit message is descriptive
- [ ] User approved the changes

**After Deploying:**
- [ ] Check build logs (Amplify for frontend, PM2 for backend)
- [ ] Verify functionality on production URLs
- [ ] Check for errors in browser console (frontend)
- [ ] Check PM2 logs for errors (backend)
- [ ] Test the specific feature that was changed

---

## 🎨 DESIGN PREFERENCES

### Visual Style
- Align with dev.boldbusiness.com design system
- Light purple/lavender for selected/active navigation tabs
- Futuristic effects with performance consideration
- Diverse bot images across pages (AI Agent 4.png, AI Agent 5.png, etc.)
- Robot animations consistent across all pages

### UX Preferences
- Notifications at middle-top (avoid covering profile)
- US as default location for new users
- Compact, single-line chat bubbles positioned left of chatbot
- AI Workbench tool name should stand out prominently

---

## 🛠️ DEVELOPMENT WORKFLOW

### Local Development
```bash
# Backend (runs on localhost:3001)
cd src/backend
npm install
npx prisma generate
npm start

# Frontend (runs on localhost:3000)
cd src/frontend/react_workbench
npm install
npm start

# Database Management
cd src/backend
npx prisma studio  # Opens on localhost:5555
```

### Making Changes

#### Backend Changes
1. Edit files in `src/backend/`
2. Test locally if possible
3. Deploy to EC2:
   ```bash
   scp -i "$HOME/Downloads/AI Workbench SSH.pem" src/backend/[file] ubuntu@54.226.14.229:~/bb-amp-hub-backend/[path]
   ssh -i "$HOME/Downloads/AI Workbench SSH.pem" ubuntu@54.226.14.229 "cd ~/bb-amp-hub-backend && pm2 restart bb-amp-hub-backend"
   ```
4. Commit to git

#### Frontend Changes
1. Edit files in `src/frontend/react_workbench/`
2. Test locally: `npm start`
3. Commit and push to main:
   ```bash
   git add -A
   git commit -m "Description"
   git push origin main
   ```
4. Amplify auto-deploys (check build status in AWS Console)

#### Database Changes (IMPORTANT - Use Migrations!)
**What "use migrations" means:** You CAN make changes to the database, but do it the SAFE way using Prisma migrations instead of manually editing the database. This preserves existing data and tracks all changes.

**Safe way to change database:**
1. Edit `src/backend/prisma/schema.prisma` (add/modify tables, columns, etc.)
2. Generate migration: `npx prisma migrate dev --name "description_of_change"`
   - This creates a migration file that shows exactly what changed
   - Applies changes to your local database
   - Preserves all existing data
3. Test locally to make sure nothing broke
4. Deploy to production: `npx prisma migrate deploy`
5. Regenerate client: `npx prisma generate`
6. Commit the migration files to git

**Example - Adding a new column:**
```prisma
// In schema.prisma, add a new field to users table:
model users {
  id        String   @id
  email     String   @unique
  name      String?
  newField  String?  // ← Your new column
  // ... rest of fields
}
```
Then run: `npx prisma migrate dev --name "add_newField_to_users"`

This is MUCH safer than manually running SQL commands because:
- ✅ Changes are tracked and reversible
- ✅ Existing data is preserved
- ✅ Team members can see what changed
- ✅ Production and development stay in sync

---

## 📊 USER MANAGEMENT

### Default Settings
- **Default Group:** "General" for new users
- **Default Location:** US
- **Auto-Creation:** Users auto-created on first @boldbusiness.com login
- **Profile Sync:** Name, email, image synced from Google OAuth

### Special Access
- **jmadrino@boldbusiness.com** - OWNER role with full admin panel access

---

## 🔍 TROUBLESHOOTING GUIDE

### Frontend Issues

#### Build Failures in Amplify
**Symptoms:** Build fails in AWS Amplify Console

**Common Causes & Solutions:**
1. **Missing dependencies**
   - Check `package.json` in `src/frontend/react_workbench/`
   - Verify all dependencies are listed
   - Check Amplify build logs for "Module not found" errors

2. **Environment variables not set**
   - Go to Amplify Console → App Settings → Environment Variables
   - Verify all `REACT_APP_*` variables are set
   - Check build logs for "undefined" errors

3. **Build command fails**
   - Check `amplify.yml` build commands
   - Verify `npm run build` works locally
   - Check for syntax errors in code

**Debug Steps:**
```bash
# Test build locally
cd src/frontend/react_workbench
npm install
npm run build

# If build succeeds locally but fails in Amplify:
# 1. Check Amplify build logs for specific error
# 2. Verify amplify.yml appRoot is correct
# 3. Check environment variables in Amplify Console
```

#### Runtime Errors in Browser
**Symptoms:** App loads but features don't work

**Common Causes & Solutions:**
1. **API calls failing (CORS errors)**
   - Check browser console (F12) for CORS errors
   - Verify `REACT_APP_API_URL` is set correctly
   - Check backend CORS configuration

2. **Authentication not working**
   - Check Google OAuth client ID is correct
   - Verify redirect URIs in Google Console
   - Check browser console for auth errors

3. **Features returning errors**
   - Check Network tab (F12) for failed API calls
   - Verify backend is running (check PM2 status)
   - Check backend logs for errors

**Debug Steps:**
```bash
# Check browser console (F12)
# Look for:
# - Red errors
# - Failed network requests (Network tab)
# - CORS errors
# - Authentication errors

# Verify API URL
console.log(process.env.REACT_APP_API_URL)
# Should output: https://api.boldbusiness.com

# Test API connection
fetch('https://api.boldbusiness.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Backend Issues

#### PM2 Service Not Running
**Symptoms:** API calls fail, backend unreachable

**Debug Steps:**
```bash
# Check PM2 status
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 status"

# If service is stopped or errored:
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 restart bb-amp-hub-backend"

# View error logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 100 --err"
```

#### API Endpoints Returning Errors
**Symptoms:** Specific features not working

**Common Causes & Solutions:**
1. **Database connection issues**
   - Check Prisma connection in logs
   - Verify DATABASE_URL is correct
   - Check RDS security groups allow EC2 access

2. **Missing environment variables**
   - Check `.env` file on EC2
   - Verify OPENAI_API_KEY, GOOGLE_CLIENT_ID, etc.

3. **Code errors after deployment**
   - Check PM2 logs for stack traces
   - Verify file was deployed correctly
   - Check for syntax errors

**Debug Steps:**
```bash
# View recent logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 200 --nostream"

# Check specific log file
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "tail -100 /home/ubuntu/.pm2/logs/bb-amp-hub-backend-out.log"

# Check error log
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "tail -100 /home/ubuntu/.pm2/logs/bb-amp-hub-backend-error.log"

# Test database connection
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "cd /home/ubuntu/bb-amp-hub-backend && node -e \"require('./lib/db').testConnection()\""
```

#### Nginx Issues
**Symptoms:** HTTPS not working, 502 Bad Gateway

**Debug Steps:**
```bash
# Check nginx status
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "sudo systemctl status nginx"

# View nginx error logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "sudo tail -50 /var/log/nginx/error.log"

# Test nginx configuration
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "sudo nginx -t"

# Restart nginx (if needed)
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "sudo systemctl restart nginx"
```

### Database Issues

#### Prisma Connection Errors
**Symptoms:** "Can't reach database server" errors

**Debug Steps:**
```bash
# Test connection locally
cd src/backend
node -e "require('./lib/db').testConnection()"

# Check DATABASE_URL
cd src/backend
grep DATABASE_URL .env

# Verify Prisma client is generated
npx prisma generate

# Check migration status
npx prisma migrate status
```

#### Migration Issues
**Symptoms:** Schema out of sync, migration errors

**Debug Steps:**
```bash
# Check migration status
cd src/backend
npx prisma migrate status

# If migrations are pending:
npx prisma migrate deploy

# If schema is out of sync:
npx prisma db push  # WARNING: Only for development!

# For production, always use migrations:
npx prisma migrate dev --name "description"
npx prisma migrate deploy
```

#### Data Issues
**Symptoms:** Missing data, incorrect data

**Debug Steps:**
```bash
# Open Prisma Studio to view/edit data
cd src/backend
npx prisma studio
# Opens on localhost:5555

# Query database directly (if needed)
# Use Prisma Studio or psql client
```

### Weekly Optimizer Specific Issues

#### Meeting Names Showing as "undefined"
**Cause:** Using wrong field name from calendar events
**Solution:** Ensure using `e.title || e.summary || 'No title'`
**File:** `src/backend/services/weeklyOptimizerService.js` line ~330

#### AI Giving Different Recommendations Each Time
**Cause:** AI not grounded in structured data
**Solution:** Verify `formatDailySchedule()` is called and included in prompt
**File:** `src/backend/services/weeklyOptimizerService.js` line ~340-360

#### AI Suggesting Conflicting Times
**Cause:** AI not validating suggestions
**Solution:** Ensure validation checklist is in AI prompt
**File:** `src/backend/services/weeklyOptimizerService.js` line ~388-432

**Debug Steps:**
```bash
# Check logs for structured schedule
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 300 --nostream | grep -A 100 'STRUCTURED DAILY SCHEDULE'"

# Verify calendar events are being fetched
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 200 --nostream | grep 'Found.*calendar events'"
```

### Prompt Library Specific Issues

#### Prompts Not Executing
**Cause:** OpenAI API key missing or invalid
**Solution:** Verify `OPENAI_API_KEY` in backend `.env`

#### Favorites Not Saving
**Cause:** Database issue or user not authenticated
**Solution:** Check `prompt_favorites` table, verify user ID

**Debug Steps:**
```bash
# Check OpenAI API calls in logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 100 --nostream | grep -i openai"

# Verify prompts in database
cd src/backend && npx prisma studio
# Navigate to 'prompts' table, verify 78 records exist
```

---

## 📝 RECENT WORK COMPLETED

### PreLoginPage Interactive Modals (Nov 21, 2025)
**Status:** ✅ FULLY DEPLOYED - "Fron re-alignment_jm_scrpjr1"
**Commit:** `546744f` - 31 files changed, 2,799 insertions, 267 deletions

**Overview:**
Created 5 stunning interactive modals for the PreLoginPage to showcase AI-powered features with 3D carousel animations, glassmorphism effects, and unique color schemes.

**New Modal Components Created:**
1. **TalentFitHowItWorksModal.js** (Purple/Pink theme)
   - 3-slide carousel showcasing TalentFit workflow
   - Metrics: 30-50% faster onboarding, 85-95% skill match accuracy
   - Features: Role-based skill assessment, personalized learning paths
   - Triggered from "How It Works" section

2. **SmartProjectOrganizerModal.js** (Orange/Amber theme)
   - 5-slide carousel with Smart_.png, Smart_1.png, Smart_3.png, Smart_4.png, Smart_5.png
   - Metrics: 3-5 hours/week saved, 90% clarity improvement
   - Features: Goal extraction, action planning, risk insights
   - Triggered from "Prompts" section

3. **PermittingCodeModal.js** (Emerald/Green theme)
   - 3-slide carousel with Perm_0.webp, Perm_1.png, Perm_2.png
   - Metrics: 4-6 hours/week saved, 85-95% completeness, 60-80% follow-through
   - Features: Permit requirements, code citations, submission steps
   - Triggered from "Automations" section

4. **TaskCalendarModal.js** (Indigo/Blue theme)
   - 3-slide carousel with Calendar_0.png, Calendar_1.png, Calendar_2.png
   - Metrics: 2-4 hours/week saved, 90% plan completion, 10-25% carryover
   - Features: Task consolidation, goal clarification, risk surfacing
   - Triggered from "AI Agents" section

5. **RoleBasedSkillModal.js** (Purple/Pink theme)
   - 5-slide carousel with Train_0.png, Train_1.png, Train_2.jpg, Train_3.png, Train_4.png
   - Metrics: 20-40% competence gain, 75-90% completion rate, 60-80% application
   - Features: Skill diagnosis, personalized training, adaptive learning
   - Triggered from "Training" section

**Technical Implementation:**
- **Framer Motion** for 3D carousel animations with rotateY transforms
- **Auto-advance** carousel every 4 seconds with manual navigation
- **Glassmorphism** effects with backdrop blur and gradient backgrounds
- **Pulsing glow** animations on header icons
- **Icon rotation** on hover effects
- **Responsive design** with Tailwind CSS
- **Lucide React** icons throughout

**Files Modified:**
- `src/frontend/react_workbench/src/pages/PreLoginPage.js` - Added modal integrations
- `src/frontend/react_workbench/src/components/TalentFitHowItWorksModal.js` - Created
- `src/frontend/react_workbench/src/components/SmartProjectOrganizerModal.js` - Created
- `src/frontend/react_workbench/src/components/PermittingCodeModal.js` - Created
- `src/frontend/react_workbench/src/components/TaskCalendarModal.js` - Created
- `src/frontend/react_workbench/src/components/RoleBasedSkillModal.js` - Created

**Image Assets Added (26 files):**
- Smart Project Organizer: Smart_.png, Smart_1.png, Smart_3.png, Smart_4.png, Smart_5.png, Smart_7.webp, Smart_8.webp, Smart_9.webp
- Permitting & Code: Perm_0.webp, Perm_1.png, Perm_2.png
- Task & Calendar: Calendar_0.png, Calendar_1.png, Calendar_1.jpg, Calendar_2.png, Calendar_4.png
- Role-Based Skill: Train_0.png, Train_1.png, Train_2.jpg, Train_3.png, Train_4.png
- Additional: bench-buddy.webp, various marketing images

**Deployment:**
- ✅ Committed to git with message "Fron re-alignment_jm_scrpjr1"
- ✅ Pushed to origin/main successfully
- ✅ AWS Amplify auto-deployment triggered
- ✅ All modals live on production

---

### Weekly Optimizer - Deterministic AI Analysis (Nov 7, 2025)
**Problem:** AI was giving different recommendations each time, even with same calendar
**Solution:** Implemented structured daily schedule format to ground AI analysis

**Key Commits:**
- `058e3bb` - Fix: Use 'title' field from calendar events instead of 'summary'
- `1a4478c` - Debug: Add logging for structured daily schedule
- `f9c2dfb` - Fix: Deterministic AI analysis with structured daily schedule

**Changes Made:**
1. ✅ Created `formatDailySchedule()` function - formats events by day with free slots
2. ✅ Created `findFreeSlots()` function - identifies 30+ min gaps between meetings
3. ✅ Fixed field name bug - use `e.title` instead of `e.summary`
4. ✅ AI now sees actual meeting names and free time slots
5. ✅ Deterministic analysis - same calendar = same recommendations
6. ✅ Smart conflict resolution - prioritizes placeholders > focus time > real meetings
7. ✅ Validation checklist - ensures suggestions don't conflict or eliminate lunch

**Files Modified:**
- `src/backend/services/weeklyOptimizerService.js` - Core optimization logic

### Prompt Library Implementation (Production)
**Status:** ✅ FULLY DEPLOYED - "NEW HOLY GRAIL" build

**Features:**
- 78 AI prompts across 7 categories
- GPT-4o execution with real-time responses
- Search and filter functionality
- User favorites (per user)
- "ARIA's Response" label (not "AI Response")
- Clean output (markdown formatting removed)

**Files:**
- Backend: `src/backend/services/promptLibraryService.js`, `src/backend/routes/prompts.js`
- Frontend: `src/frontend/react_workbench/src/pages/PromptLibraryPage.js`
- Database: `prompts` table with 78 records

### Resume Builder Improvements
1. Fixed content overlap with header/footer
2. Implemented proper page layout (name on page 1 only)
3. Removed decorative borders (were mockup guides)
4. Improved page break handling
5. Clean, professional formatting with natural content flow

**Commits:**
- `c089c3c` - Fix content overlap with header/footer - increase margins
- `868b970` - Redesign resume layout to match mockup specifications
- `881dd3b` - Clean up resume layout - remove decorative borders/backgrounds

---

## 🎯 NEXT STEPS / KNOWN ITEMS

### Potential Enhancements
- Collective intelligence system (aggregate learnings across users)
- Vector database or BigQuery for AI agent knowledge storage
- Additional AI-amplified features for group management
- Enhanced ARIA prompt documentation with Resources section

### Testing Preference
- **Manual testing preferred** over automated test setup
- User prefers to test features directly rather than writing test suites

---

## 💡 KEY REMINDERS FOR NEXT AI AGENT

### Critical Rules
1. **NEVER modify auth** - it's working perfectly, confirmed multiple times
2. **Always use package managers** - never manually edit package files
3. **Always use Prisma migrations** - never manually edit database with SQL
4. **Test locally when possible** before deploying
5. **Backend changes:** Commit → Git push → SSH to EC2 → Git pull → PM2 restart
6. **Frontend changes:** Commit → Git push → Amplify auto-deploys
7. **User prefers to be asked** before installing dependencies, pushing to remote, or making potentially damaging changes
8. **Focus on what user asks** - don't add extra features without permission
9. **Preserve existing functionality** over adding new visual effects
10. **Use codebase-retrieval extensively** before making edits
11. **Commit frequently** with descriptive messages
12. **Make parallel tool calls** when reading multiple files

### Common Pitfalls to Avoid
1. ❌ Editing `package.json` manually → ✅ Use `npm install <package>`
2. ❌ Running SQL to change schema → ✅ Use `npx prisma migrate dev`
3. ❌ Modifying auth code → ✅ Leave it alone, it works perfectly
4. ❌ Creating docs without request → ✅ Only create files when explicitly asked
5. ❌ Deploying without testing → ✅ Test locally first when possible
6. ❌ Making assumptions about field names → ✅ Check actual data structure first
7. ❌ Forgetting to restart PM2 → ✅ Always restart after backend changes
8. ❌ Not checking logs after deploy → ✅ Verify deployment success in logs

### Debugging Tips
**Frontend Issues:**
- Check AWS Amplify build logs in console
- Check browser console for errors (F12)
- Verify environment variables in Amplify settings
- Check API calls in Network tab

**Backend Issues:**
```bash
# Check PM2 status
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 status"

# View recent logs
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 100"

# View specific log file
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "tail -100 /home/ubuntu/.pm2/logs/bb-amp-hub-backend-out.log"

# Restart service
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 restart bb-amp-hub-backend"
```

**Database Issues:**
```bash
# Open Prisma Studio
cd src/backend && npx prisma studio

# Check database connection
cd src/backend && node -e "require('./lib/db').testConnection()"

# View migration status
cd src/backend && npx prisma migrate status
```

### Weekly Optimizer Specific Notes
**Common Issues:**
1. **Meeting names showing as "undefined"**
   - Cause: Using wrong field name (`e.summary` vs `e.title`)
   - Solution: Use `e.title || e.summary || 'No title'`
   - Location: `weeklyOptimizerService.js` line ~330

2. **Non-deterministic AI responses**
   - Cause: AI not grounded in structured data
   - Solution: Ensure `formatDailySchedule()` is called and included in prompt
   - Location: `weeklyOptimizerService.js` line ~340-360

3. **AI suggesting conflicting times**
   - Cause: AI not validating suggestions against each other
   - Solution: Ensure validation checklist is in AI prompt
   - Location: `weeklyOptimizerService.js` line ~388-432

### Prompt Library Specific Notes
**Important:**
- Use "ARIA's Response" label (not "AI Response")
- Remove markdown formatting from responses (###, **)
- Favorites are per-user (stored in database)
- Execution uses GPT-4o model
- 78 prompts across 7 categories (don't modify count without user approval)

---

## 📞 SUPPORT CONTACTS

- **Git User:** jlope@boldbusiness.com
- **Repository:** https://github.com/jm-scrpjr1/bb-amp-hub.git
- **Owner:** jmadrino@boldbusiness.com (OWNER role)

---

## 🌐 PRODUCTION URLS & ACCESS

### Public URLs
- **Frontend:** https://aiworkbench.boldbusiness.com
- **Backend API:** https://api.boldbusiness.com
- **Amplify URL:** https://main.d1wapgj6lifsrx.amplifyapp.com

### Infrastructure
- **EC2 Server:** 54.226.14.229
- **SSH Key:** `~/Downloads/AI Workbench SSH.pem`
- **SSH User:** ubuntu
- **Database:** ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432

### AWS Console Access
- **Amplify App ID:** d1wapgj6lifsrx
- **RDS Instance:** ai-workbench
- **EC2 Instance:** 54.226.14.229

---

## 📋 QUICK REFERENCE CHEAT SHEET

### Deploy Frontend
```bash
git add -A && git commit -m "Message" && git push origin main
# Amplify auto-deploys in ~3-5 minutes
```

### Deploy Backend
```bash
git add -A && git commit -m "Message" && git push origin main
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "cd /home/ubuntu/bb-amp-hub-backend && git pull && pm2 restart bb-amp-hub-backend"
```

### Check Backend Logs
```bash
ssh -i ~/Downloads/"AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 100"
```

### Database Migration
```bash
cd src/backend
# Edit schema.prisma
npx prisma migrate dev --name "description"
npx prisma migrate deploy
npx prisma generate
```

### View Database
```bash
cd src/backend && npx prisma studio
# Opens on localhost:5555
```

### Test Locally
```bash
# Backend
cd src/backend && npm start

# Frontend
cd src/frontend/react_workbench && npm start
```

---

## 🎓 LEARNING RESOURCES FOR NEXT AGENT

### Understanding the Codebase
1. **Start with:** `AI_AGENT_HANDOFF_SUMMARY.md` (this file)
2. **Review:** `src/backend/app.js` - Main Express server setup
3. **Review:** `src/frontend/react_workbench/src/App.js` - Main React app
4. **Review:** `src/backend/prisma/schema.prisma` - Database schema
5. **Review:** Recent commits in git history

### Key Concepts to Understand
- **Prisma ORM:** How to query database, create migrations
- **React Router:** How navigation works in the app
- **JWT Authentication:** How auth tokens are used
- **PM2:** How to manage Node.js processes
- **Nginx:** How reverse proxy and HTTPS work
- **AWS Amplify:** How frontend deployment works

### Common Tasks
1. **Add new API endpoint:**
   - Create route in `src/backend/routes/`
   - Add service logic in `src/backend/services/`
   - Register route in `src/backend/app.js`
   - Test with Postman or curl
   - Deploy backend

2. **Add new page:**
   - Create page in `src/frontend/react_workbench/src/pages/`
   - Add route in `src/frontend/react_workbench/src/App.js`
   - Add navigation link in `src/frontend/react_workbench/src/components/Navigation.js`
   - Test locally
   - Deploy frontend

3. **Add database table:**
   - Edit `src/backend/prisma/schema.prisma`
   - Run `npx prisma migrate dev --name "add_table_name"`
   - Run `npx prisma generate`
   - Update services to use new table
   - Deploy backend

4. **Fix bug:**
   - Reproduce issue locally
   - Check logs (browser console or PM2 logs)
   - Identify root cause
   - Make fix
   - Test locally
   - Deploy to production
   - Verify fix in production

---

## ⚡ MOST IMPORTANT THINGS TO REMEMBER

1. **Authentication is SACRED** - Never modify without explicit permission
2. **Use package managers** - Never manually edit package.json
3. **Use Prisma migrations** - Never manually edit database
4. **Git-based deployment** - Both frontend and backend deploy from git
5. **Test locally first** - Catch errors before production
6. **Check logs after deploy** - Verify deployment success
7. **Ask before installing** - User wants to approve dependencies
8. **Focus on the ask** - Don't add extra features
9. **Preserve functionality** - Don't break existing features
10. **Use codebase-retrieval** - Search before editing

---

## 🚀 CURRENT STATUS (as of Nov 21, 2025)

### Production Features (Fully Deployed)
- ✅ **ARIA Chatbot** - OpenAI Assistant with conversation persistence
- ✅ **Prompt Library** - 78 prompts with GPT-4o execution
- ✅ **Weekly Optimizer** - AI calendar analysis with deterministic recommendations
- ✅ **Resume Builder** - PDF generation with custom templates
- ✅ **Group Management** - RBAC-based team organization
- ✅ **AI Assessments** - Skill evaluation system
- ✅ **Google OAuth** - Authentication with @boldbusiness.com
- ✅ **Admin Panel** - User and role management
- ✅ **PreLoginPage Interactive Modals** - 5 feature showcase modals with 3D carousels

### Recent Improvements
- ✅ PreLoginPage Interactive Modals (Nov 21, 2025) - 5 modals with 3D carousel animations
- ✅ TalentFit, Smart Project Organizer, Permitting & Code, Task & Calendar, Role-Based Skill modals
- ✅ 26 new image assets for client-facing feature showcases
- ✅ Glassmorphism effects and unique color schemes per modal
- ✅ Weekly Optimizer deterministic analysis (Nov 7, 2025)
- ✅ Structured daily schedule for AI grounding
- ✅ Smart conflict resolution with priority algorithm
- ✅ Free slot detection for intelligent rescheduling
- ✅ Validation to prevent conflicting suggestions

### Known Issues
- None currently - all features working as expected

### Next Potential Enhancements (User Ideas)
- Collective intelligence system (aggregate learnings across users)
- Vector database for AI agent knowledge storage
- Enhanced ARIA prompt with Resources section documentation
- Additional AI-amplified features for group management

---

**END OF COMPREHENSIVE HANDOFF SUMMARY**

*This document is the SINGLE SOURCE OF TRUTH for understanding the BB AMP Hub architecture, deployment, and best practices. Keep it updated as the project evolves.*


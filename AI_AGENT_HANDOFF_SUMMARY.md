# BB AMP Hub - AI Agent Handoff Summary
**Last Updated:** 2025-01-23  
**Repository:** https://github.com/jm-scrpjr1/bb-amp-hub.git  
**Local Path:** `/Users/JM/Documents/GitHub/bb-amp-hub`

---

## 🎯 PROJECT OVERVIEW

**Bold Business AI Workbench** - An AI-amplified workspace platform for employees to access IT, HR, and project resources with integrated AI agents, automation tools, and resume building capabilities.

### Core Features
- **AI Agents (ARIA)** - OpenAI Assistant-powered chatbot (ID: `asst_R5RXI0LcyRxsgR80xb05oNQb`)
- **Resume Builder (Boldified Resume Builder)** - AI-powered resume generation with custom PDF templates
- **Group Management** - RBAC-based team/department organization
- **Prompt Tutor** - AI prompt learning and management
- **Automations** - Workflow automation tools
- **Trainings** - Learning management system
- **Resources** - Document and resource library

---

## 🏗️ ARCHITECTURE

### Frontend (React.js - PRODUCTION)
- **Framework:** React 18 + React Router
- **UI:** Tailwind CSS + Custom Components
- **Deployment:** AWS Amplify
- **Production URL:** https://aiworkbench.boldbusiness.com
- **Amplify URL:** https://main.d1wapgj6lifsrx.amplifyapp.com (redirects to custom domain)
- **Code Location:** `src/frontend/react_workbench/`

### Backend (Node.js + Express)
- **Framework:** Express.js
- **Database:** PostgreSQL (AWS RDS) via Prisma ORM
- **Deployment:** AWS EC2 (Ubuntu)
- **Production URL:** https://api.boldbusiness.com
- **Code Location:** `src/backend/`

### Database
- **Type:** PostgreSQL 
- **ORM:** Prisma
- **Production:** AWS RDS at `ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432`
- **Schema Location:** `src/backend/prisma/schema.prisma`
- **Local Management:** Prisma Studio on `localhost:5555`

---

## 🚀 DEPLOYMENT SETUP

### AWS EC2 Backend Server
- **IP:** `54.226.14.229`
- **SSH Key:** `~/Downloads/AI Workbench SSH.pem`
- **User:** `ubuntu`
- **Backend Directory:** `~/bb-amp-hub-backend/`
- **Process Manager:** PM2 (service name: `bb-amp-hub-backend`)
- **Web Server:** Nginx (handles HTTPS, proxies to backend on port 3001)
- **SSL:** Configured via nginx for HTTPS

#### Backend Deployment Commands
```bash
# Deploy backend changes
scp -i "$HOME/Downloads/AI Workbench SSH.pem" src/backend/[file] ubuntu@54.226.14.229:~/bb-amp-hub-backend/[path]

# Restart backend
ssh -i "$HOME/Downloads/AI Workbench SSH.pem" ubuntu@54.226.14.229 "cd ~/bb-amp-hub-backend && pm2 restart bb-amp-hub-backend"

# Check logs
ssh -i "$HOME/Downloads/AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend"
```

### AWS Amplify Frontend
- **App ID:** `d1wapgj6lifsrx`
- **Branch:** `main`
- **Build Config:** `amplify.yml`
- **Auto-Deploy:** Enabled (deploys on git push to main)
- **Build Location:** `src/frontend/react_workbench/`

#### Frontend Deployment
```bash
# Automatic deployment on push
git add -A
git commit -m "Your message"
git push origin main
# Amplify auto-builds and deploys
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

## 📁 KEY FILE LOCATIONS

### Backend Critical Files
```
src/backend/
├── app.js                          # Main Express server
├── services/
│   ├── openaiService.js           # OpenAI Assistant (ARIA) integration
│   ├── resumeBuilderService.js    # Resume PDF generation
│   └── googleWorkspaceService.js  # Google OAuth integration
├── prisma/
│   └── schema.prisma              # Database schema
├── lib/
│   └── db.js                      # Prisma client & DB connection
└── routes/                        # API endpoints
```

### Frontend Critical Files
```
src/frontend/react_workbench/
├── src/
│   ├── App.js                     # Main React app with routing
│   ├── providers/
│   │   ├── AuthProvider.js       # Google OAuth provider
│   │   └── RBACProvider.js       # Role-based access control
│   ├── pages/                    # All page components
│   ├── components/               # Reusable UI components
│   └── config/
│       └── environment.js        # Environment configuration
└── public/                       # Static assets
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

### Key Features
- Personalized context without performance compromise
- Session-based conversation management
- Automatic context summarization
- User-specific conversation history

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

## ⚠️ CRITICAL WARNINGS

### DO NOT MODIFY
1. **Authentication System** - Working perfectly, confirmed by user
2. **Google OAuth Configuration** - Properly configured and tested
3. **Database Schema** - Stable, use Prisma migrations for changes
4. **Nginx Configuration on EC2** - Handles HTTPS and proxying correctly

### ALWAYS USE PACKAGE MANAGERS
- **Never manually edit** `package.json`, `requirements.txt`, etc.
- **Use:** `npm install`, `npm uninstall` for dependencies
- **Reason:** Prevents version conflicts and broken builds

### DEPLOYMENT WORKFLOW
1. **Test locally first** (if applicable)
2. **Commit changes** with descriptive messages
3. **Frontend:** Push to main → Amplify auto-deploys
4. **Backend:** SCP files to EC2 → Restart PM2
5. **Verify:** Check logs and test functionality

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

## 🔍 TROUBLESHOOTING

### Backend Issues
```bash
# Check PM2 status
ssh -i "$HOME/Downloads/AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 status"

# View logs
ssh -i "$HOME/Downloads/AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 logs bb-amp-hub-backend --lines 100"

# Restart service
ssh -i "$HOME/Downloads/AI Workbench SSH.pem" ubuntu@54.226.14.229 "pm2 restart bb-amp-hub-backend"
```

### Frontend Issues
- Check AWS Amplify build logs in console
- Verify environment variables in Amplify settings
- Check browser console for errors

### Database Issues
```bash
# Connect to Prisma Studio
cd src/backend && npx prisma studio

# Check connection
cd src/backend && node -e "require('./lib/db').testConnection()"
```

---

## 📝 RECENT WORK COMPLETED

### Resume Builder Improvements
1. Fixed content overlap with header/footer
2. Implemented proper page layout (name on page 1 only)
3. Removed decorative borders (were mockup guides)
4. Improved page break handling
5. Clean, professional formatting with natural content flow

### Commits
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

1. **NEVER modify auth** - it's working perfectly
2. **Always use package managers** - never manually edit package files
3. **Test locally when possible** before deploying
4. **Backend changes require manual SCP + PM2 restart**
5. **Frontend changes auto-deploy via Amplify on git push**
6. **User prefers to be asked** before installing dependencies, pushing to remote, or making potentially damaging changes
7. **Focus on what user asks** - don't add extra features without permission
8. **Preserve existing functionality** over adding new visual effects
9. **Use codebase-retrieval extensively** before making edits
10. **Commit frequently** with descriptive messages

---

## 📞 SUPPORT CONTACTS

- **Git User:** jlope@boldbusiness.com
- **Repository:** https://github.com/jm-scrpjr1/bb-amp-hub.git

---

## 🌐 PRODUCTION URLS SUMMARY

- **Frontend:** https://aiworkbench.boldbusiness.com
- **Backend API:** https://api.boldbusiness.com
- **Database:** ai-workbench.c5vzhv0mqgjy.us-east-1.rds.amazonaws.com:5432
- **EC2 Server:** 54.226.14.229

---

**END OF HANDOFF SUMMARY**


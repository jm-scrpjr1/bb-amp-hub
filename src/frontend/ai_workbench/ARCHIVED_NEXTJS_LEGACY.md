# ⚠️ ARCHIVED - LEGACY NEXT.JS FOLDER

## Status: DO NOT USE - LEGACY CODE

This folder (`src/frontend/ai_workbench/`) contains a **legacy Next.js implementation** that is **NO LONGER IN PRODUCTION**.

### ❌ What NOT to do:
- ❌ Do NOT use this folder for any new features
- ❌ Do NOT use this folder for assessments
- ❌ Do NOT use this folder for any UI components
- ❌ Do NOT deploy this folder
- ❌ Do NOT reference this folder in development

### ✅ What to use instead:
- ✅ Use `src/frontend/react_workbench/` for ALL frontend development
- ✅ Use React components from `src/frontend/react_workbench/src/`
- ✅ Use React pages from `src/frontend/react_workbench/src/pages/`
- ✅ Use React components from `src/frontend/react_workbench/src/components/`

### 📋 Why this folder exists:
This folder was created during an earlier phase of development when the team was exploring Next.js. It contains:
- Legacy Next.js authentication pages
- Legacy assessment components (AIAssessmentSimple.tsx)
- Legacy UI components
- Legacy pages

### 🔄 Migration Status:
- ✅ Authentication: Migrated to React (SignInPage.js in react_workbench)
- ✅ Assessments: Using React (AIAssessmentDatabase.js in react_workbench)
- ✅ All pages: Migrated to React
- ✅ All components: Migrated to React

### 📝 Production Deployment:
- **Deployed:** `src/frontend/react_workbench/` ONLY
- **Build Config:** `amplify.yml` points to `src/frontend/react_workbench/`
- **URL:** https://aiworkbench.boldbusiness.com

### 🗑️ Future Action:
This folder can be safely deleted once all legacy code has been confirmed as migrated and working in production. For now, it's archived as a reference.

---

**Last Updated:** 2025-10-26
**Status:** ARCHIVED - DO NOT USE


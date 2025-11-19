# BAIIT Team Development Guide

Hey team! This doc covers how we work together on the BB-AMP-Hub codebase. It's pretty straightforward once you get the hang of it.

## Quick Start

If you're new to the project, here's what you need to do first:

```bash
# Clone the repo
git clone https://github.com/jm-scrpjr1/bb-amp-hub.git
cd bb-amp-hub

# Install dependencies
npm install

# Copy environment variables (ask JM for the actual values)
cp .env.example .env

# Run locally
npm run dev
```

## How We Work

We use a simple branch workflow. Think of it like this:

- **main** = Production (what users see)
- **dev** = Our testing ground
- **feature branches** = Your work in progress

### The Basic Flow

1. Start from `dev` branch
2. Create your feature branch
3. Do your work
4. Push and create a Pull Request
5. Wait for review
6. Once approved, it gets merged to `dev`
7. JM handles merging `dev` to `main` when ready for production

## Step-by-Step Workflow

### Starting a New Feature

```bash
# Make sure you're on dev and it's up to date
git checkout dev
git pull origin dev

# Create your feature branch (use a descriptive name)
git checkout -b feature/add-export-button
# or
git checkout -b bugfix/fix-login-error
```

### Working on Your Feature

Just code normally! Commit often with clear messages:

```bash
git add .
git commit -m "Add export to CSV functionality"

# Push your branch to GitHub
git push origin feature/add-export-button
```

**Commit message tips:**
- Keep it short but descriptive
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Bad: "changes"
- Good: "Fix resume parsing for multi-page PDFs"

### Creating a Pull Request

Once your feature is ready:

1. Go to https://github.com/jm-scrpjr1/bb-amp-hub/pulls
2. Click "New Pull Request"
3. Set base to `dev` and compare to your feature branch
4. Fill in the title and description (explain what you did and why)
5. Request review from JM
6. Wait for feedback

**PR Description Template:**

```
## What does this do?
Brief explanation of the feature/fix

## How to test?
1. Go to X page
2. Click Y button
3. Should see Z result

## Screenshots (if applicable)
[Add screenshots here]
```

### After Your PR is Merged

Clean up your local branches:

```bash
# Switch back to dev
git checkout dev

# Pull the latest (includes your merged changes)
git pull origin dev

# Delete your old feature branch (optional but keeps things tidy)
git branch -d feature/add-export-button
```

## Important Rules

### DO:
- ✅ Always branch from `dev`
- ✅ Test your changes locally before pushing
- ✅ Write clear commit messages
- ✅ Keep PRs focused (one feature/fix per PR)
- ✅ Ask questions if you're unsure about something

### DON'T:
- ❌ Push directly to `main` (you can't anyway, it's protected)
- ❌ Push directly to `dev` (always use PRs)
- ❌ Commit sensitive data (API keys, passwords, etc.)
- ❌ Leave console.logs everywhere (clean up debug code)
- ❌ Commit `node_modules` or `.env` files

## Common Scenarios

### "I need to pull in changes from dev while working on my feature"

```bash
git checkout dev
git pull origin dev
git checkout feature/your-feature
git merge dev
# Resolve any conflicts if they come up
```

### "I messed up and need to start over"

```bash
# Throw away all local changes (careful!)
git checkout .
git clean -fd

# Or just delete the branch and start fresh
git checkout dev
git branch -D feature/your-feature
git checkout -b feature/your-feature
```

### "I accidentally committed to the wrong branch"

```bash
# If you haven't pushed yet
git reset HEAD~1  # Undo last commit but keep changes
git stash         # Save your changes
git checkout correct-branch
git stash pop     # Apply your changes here
```

## Backend Deployment

JM handles all backend deployments to the EC2 server. If you made backend changes:

1. Create your PR as usual
2. Mention in the PR description that it includes backend changes
3. After merge to `dev`, JM will test and deploy to production

You don't need to worry about SSH, PM2, or server stuff.

## Frontend Deployment

Frontend auto-deploys from `main` via AWS Amplify. Once JM merges `dev` to `main`, it'll automatically build and deploy. You'll see it live in a few minutes.

## Getting Help

- **Git issues?** Ask in the team chat or ping JM
- **Code questions?** Create a draft PR and ask for early feedback
- **Not sure if something should be a feature or bugfix?** Doesn't really matter, just pick one
- **Broke something?** It happens! Just let the team know

## Useful Git Commands

```bash
# See what branch you're on
git branch

# See what files changed
git status

# See commit history
git log --oneline

# Undo last commit (keeps changes)
git reset --soft HEAD~1

# See all branches (including remote)
git branch -a

# Update your branch list
git fetch --prune
```

---

That's pretty much it! The workflow becomes second nature after a few PRs. When in doubt, just ask. We're all learning as we go.

Happy coding! 🚀


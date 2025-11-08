# Developer Guide

**Complete guide for setting up, developing, and collaborating on Vipra Sethu**

**Last Updated:** 2025-11-08

---

## Table of Contents

1. [Local Setup](#local-setup)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Development Commands](#development-commands)
5. [Database Setup](#database-setup)
6. [Git Workflow](#git-workflow)
7. [Collaboration Guide](#collaboration-guide)
8. [Daily Workflow](#daily-workflow)
9. [Working with Issues, Projects, and PRs](#working-with-issues-projects-and-prs)
10. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Required Tools

Install these tools before starting:

**Node.js (v18 or later)**
- JavaScript runtime that executes our code. Download from [nodejs.org](https://nodejs.org/)

**pnpm (package manager)**
- Faster alternative to npm, saves disk space by sharing packages. Install with `npm install -g pnpm`

**Git (version control)**
- Tracks code changes and enables collaboration. Download from [git-scm.com](https://git-scm.com/)

**VS Code (recommended editor)**
- Code editor with great TypeScript support. Download from [code.visualstudio.com](https://code.visualstudio.com/)

### VS Code Extensions (Recommended)

```bash
# Install these extensions for better development experience
code --install-extension dbaeumer.vscode-eslint          # Shows code quality issues
code --install-extension esbenp.prettier-vscode          # Auto-formats code
code --install-extension bradlc.vscode-tailwindcss       # Tailwind CSS autocomplete
code --install-extension ms-vscode.vscode-typescript-next # Better TypeScript support
```

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
pnpm --version    # Should show 8.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## Getting Started

### 1. Clone the Repository

```bash
# Clone from GitHub (downloads the entire project to your computer)
git clone https://github.com/KSH79/vipra-sethu.git

# Navigate into the project folder
cd vipra-sethu
```

### 2. Install Dependencies

```bash
# Install all packages for the entire monorepo (takes 2-3 minutes)
pnpm install

# This installs packages for:
# - Root workspace
# - apps/web (Next.js app)
# - Any shared packages
```

### 3. Set Up Environment Variables

```bash
# Navigate to the web app
cd apps/web

# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual credentials (see next section)
code .env.local
```

### 4. Run the Development Server

```bash
# Go back to project root
cd ../..

# Start the dev server (opens at http://localhost:3000)
pnpm dev

# Server will auto-reload when you change files
```

---

## Environment Variables

### Required Variables

Edit `apps/web/.env.local` with these values:

```env
# Supabase Configuration
# Get these from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# Application URL
# Use localhost for development, your domain for production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (Optional - can add later)
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Optional - can add later)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or open existing)
3. Go to **Settings** → **API**
4. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy **service_role** key → paste as `SUPABASE_SERVICE_ROLE_KEY`

### Security Rules

- ✅ **DO** commit `.env.example` (template with no real values)
- ❌ **DON'T** commit `.env.local` (contains secrets)
- ❌ **DON'T** share service role keys publicly
- ✅ **DO** use different keys for dev/staging/production

---

## Development Commands

### Starting the Server

```bash
pnpm dev              # Starts dev server at http://localhost:3000 with hot reload
pnpm build            # Creates production build (tests if code compiles correctly)
pnpm start            # Runs production build locally (must run build first)
```

### Code Quality

```bash
pnpm lint             # Checks code for errors and style issues (runs ESLint)
pnpm lint:fix         # Auto-fixes linting issues where possible
pnpm type-check       # Validates TypeScript types without building (catches type errors)
```

### Package Management

```bash
# Add a new package to the web app
cd apps/web
pnpm add <package-name>              # Production dependency (e.g., pnpm add zod)
pnpm add -D <package-name>           # Dev dependency (e.g., pnpm add -D @types/node)

# Remove a package
pnpm remove <package-name>           # Uninstalls and removes from package.json

# Update all packages
pnpm update                          # Updates all packages to latest compatible versions

# Clean install (if things break)
rm -rf node_modules                  # Delete all installed packages
pnpm install                         # Reinstall everything fresh
```

### Workspace Commands

```bash
# Run commands in specific workspace
pnpm --filter web dev                # Run dev only in apps/web
pnpm --filter web build              # Build only apps/web

# Run commands in all workspaces
pnpm -r build                        # Build all packages (-r = recursive)
pnpm -r lint                         # Lint all packages
```

### Cleaning Up

```bash
# Kill all Node.js processes (if server won't stop)
taskkill /F /IM node.exe             # Windows: Force kills all Node processes
pkill -9 node                        # Mac/Linux: Force kills all Node processes

# Clean build artifacts
pnpm clean                           # Removes .next, dist, and build folders
rm -rf .next                         # Manually delete Next.js build cache
```

---

## Database Setup

### Running Migrations

Migrations must be run in order in your Supabase SQL Editor:

```bash
# 1. Open Supabase Dashboard → SQL Editor
# 2. Run these files in order:

infra/supabase/01_schema.sql                    # Core tables (providers, admins, etc.)
infra/supabase/02_policies.sql                  # Row Level Security policies
infra/supabase/03_storage.sql                   # Photo storage bucket and policies
infra/supabase/04_rpc_search.sql                # Search function with filters
infra/supabase/05_admin_functions.sql           # Admin approval and audit functions
infra/supabase/06_clean_taxonomy_tables.sql     # Category and sampradaya tables
infra/supabase/07_clean_rpc_and_views.sql       # Updated search with taxonomy
```

### Verifying Database Setup

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should show: providers, admins, admin_actions, categories, sampradayas, etc.

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
-- rowsecurity should be 't' (true) for all tables

-- Test search function
SELECT * FROM search_providers(
  p_category_code := 'purohit',
  p_limit := 5
);
-- Should return results or empty array (no errors)
```

### Database Commands (via Supabase CLI - Optional)

```bash
# Install Supabase CLI
pnpm add -g supabase

# Link to your project
supabase link --project-ref your-project-ref    # Connects CLI to your Supabase project

# Pull schema from remote
supabase db pull                                # Downloads current database schema

# Generate TypeScript types
supabase gen types typescript --local > apps/web/lib/types/database.ts
# Creates type-safe database types for TypeScript
```

---

## Git Workflow

### Initial Setup

```bash
# Configure Git (first time only)
git config --global user.name "Your Name"           # Sets your name for commits
git config --global user.email "your@email.com"     # Sets your email for commits

# Verify configuration
git config --list                                   # Shows all Git settings
```

### Daily Git Commands

```bash
# Check status
git status                          # Shows modified files and current branch

# Pull latest changes
git pull origin main                # Downloads latest code from GitHub main branch
git pull                            # Short version (pulls from current branch's upstream)

# Create a new branch
git checkout -b feat/your-feature   # Creates and switches to new branch for your work
git checkout -b fix/bug-name        # For bug fixes, use 'fix/' prefix

# Stage changes
git add .                           # Stages all modified files for commit
git add path/to/file.ts             # Stages specific file only
git add -p                          # Interactively choose which changes to stage

# Commit changes
git commit -m "feat: add user search"              # Commits with message (see commit format below)
git commit -m "fix: resolve login timeout"         # Bug fix commit
git commit --amend -m "new message"                # Changes last commit message (before push)

# Push to GitHub
git push origin feat/your-feature   # Uploads your branch to GitHub
git push -u origin feat/your-feature # First push: -u sets upstream tracking
git push                            # Short version (pushes to tracked upstream)

# Switch branches
git checkout main                   # Switches to main branch
git checkout feat/other-feature     # Switches to another feature branch

# Keep branch updated with main
git checkout main                   # Switch to main
git pull                            # Get latest changes
git checkout feat/your-feature      # Switch back to your branch
git merge main                      # Merges main into your branch (resolves conflicts if any)
# OR use rebase for cleaner history:
git rebase main                     # Replays your commits on top of latest main
```

### Viewing History

```bash
git log                             # Shows full commit history (press 'q' to exit)
git log --oneline                   # Compact one-line format (easier to read)
git log --oneline -n 5              # Shows last 5 commits only
git log --graph --oneline --all     # Visual branch graph with all branches

# View changes
git diff                            # Shows unstaged changes in files
git diff --staged                   # Shows staged changes (what will be committed)
git diff main                       # Shows differences between your branch and main
```

### Undoing Changes

```bash
# Discard local changes (before commit)
git checkout -- path/to/file.ts     # Reverts file to last commit (DESTRUCTIVE)
git restore path/to/file.ts         # Modern way to discard changes
git restore .                       # Discards all local changes (CAREFUL!)

# Unstage files
git reset HEAD path/to/file.ts      # Removes file from staging (keeps changes)
git restore --staged path/to/file.ts # Modern way to unstage

# Undo last commit (keep changes)
git reset --soft HEAD~1             # Undoes commit, keeps changes staged
git reset HEAD~1                    # Undoes commit, keeps changes unstaged

# Undo last commit (discard changes)
git reset --hard HEAD~1             # DESTRUCTIVE: Deletes commit and changes permanently
```

### Branch Management

```bash
# List branches
git branch                          # Shows local branches (* marks current)
git branch -a                       # Shows all branches (local + remote)

# Delete branches
git branch -d feat/completed        # Deletes local branch (safe: prevents if unmerged)
git branch -D feat/abandoned        # Force deletes local branch (CAREFUL)
git push origin --delete feat/old   # Deletes remote branch on GitHub

# Rename branch
git branch -m old-name new-name     # Renames local branch
```

### Stashing (Save Work Temporarily)

```bash
git stash                           # Saves current changes and cleans working directory
git stash save "WIP: feature X"     # Stashes with descriptive message
git stash list                      # Shows all stashed changes
git stash pop                       # Applies most recent stash and removes it
git stash apply                     # Applies stash but keeps it in list
git stash drop                      # Deletes most recent stash
```

---

## Collaboration Guide

### Branch Naming Convention

Use prefixes to indicate branch type:

```bash
feat/user-authentication            # New feature
fix/login-timeout                   # Bug fix
refactor/cleanup-api                # Code refactoring
docs/update-readme                  # Documentation changes
chore/update-dependencies           # Maintenance tasks
test/add-unit-tests                 # Adding tests
```

### Commit Message Format

Follow this format for clear commit history:

```
<type>: <short description>

[optional body with more details]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring (no behavior change)
- `docs` - Documentation changes
- `style` - Formatting, missing semicolons (no code change)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (dependencies, config)

**Examples:**

```bash
git commit -m "feat: add WhatsApp contact button to provider cards"
git commit -m "fix: resolve photo upload timeout on slow connections"
git commit -m "refactor: extract search logic into separate service"
git commit -m "docs: add database migration guide to README"
```

### Pull Request Process

1. **Create branch from main**
   ```bash
   git checkout main
   git pull
   git checkout -b feat/your-feature
   ```

2. **Make changes and commit**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: add feature description"
   ```

3. **Keep branch updated**
   ```bash
   git checkout main
   git pull
   git checkout feat/your-feature
   git merge main              # Or: git rebase main
   ```

4. **Push to GitHub**
   ```bash
   git push -u origin feat/your-feature
   ```

5. **Open Pull Request**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Fill in PR template with:
     - What changed
     - Why it changed
     - How to test
   - Request reviewers

6. **Address review feedback**
   ```bash
   # Make requested changes
   git add .
   git commit -m "fix: address review comments"
   git push                    # Updates PR automatically
   ```

7. **Merge when approved**
   - Reviewer approves PR
   - Merge via GitHub UI (squash or merge commit)
   - Delete branch after merge

### Code Review Guidelines

**As Author:**

- Keep PRs small (< 400 lines changed)
- Write clear PR description
- Add screenshots for UI changes
- Respond to comments promptly
- Don't take feedback personally

**As Reviewer:**

- Review within 24 hours
- Be constructive and specific
- Ask questions, don't demand
- Approve if no blocking issues
- Test the changes locally if possible

### Resolving Merge Conflicts

```bash
# When merge/rebase shows conflicts:

# 1. See which files have conflicts
git status                          # Shows files with conflicts

# 2. Open conflicted files, look for:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> main

# 3. Edit file to keep correct version (remove markers)

# 4. Mark as resolved
git add path/to/resolved-file.ts

# 5. Complete merge/rebase
git commit                          # For merge
git rebase --continue               # For rebase
```

---

## Daily Workflow

### Morning Routine

```bash
# 1. Pull latest changes
git checkout main
git pull

# 2. Update dependencies (if package.json changed)
pnpm install

# 3. Start dev server
pnpm dev

# 4. Create/switch to your feature branch
git checkout feat/your-feature
```

### Before Committing

```bash
# 1. Check types
pnpm type-check                     # Ensures no TypeScript errors

# 2. Run linter
pnpm lint                           # Checks code quality

# 3. Test build
pnpm build                          # Verifies production build works

# 4. Review changes
git diff                            # See what you're about to commit

# 5. Commit
git add .
git commit -m "feat: your change description"
```

### End of Day

```bash
# 1. Commit work in progress
git add .
git commit -m "wip: save progress on feature X"

# 2. Push to backup
git push origin feat/your-feature   # Backs up work to GitHub

# 3. Stop dev server
# Press Ctrl+C in terminal
```

### Weekly Maintenance

```bash
# 1. Update dependencies
pnpm update                         # Updates packages to latest compatible versions

# 2. Clean up old branches
git branch -d feat/merged-feature   # Delete merged branches

# 3. Pull latest main
git checkout main
git pull
```

---

## Working with Issues, Projects, and PRs

### GitHub as Single Source of Truth

We use GitHub Issues for all work tracking - no separate tools needed. Everything lives in GitHub for full traceability from idea to production.

### Issue Management

**Creating Issues:**

- Every feature, bug, or chore gets a GitHub Issue
- Use clear titles (2-6 words)
- Add 2-6 sentence description with acceptance criteria
- Apply labels for filtering

**Label System:**

```bash
type:feature     # New functionality
type:bug         # Something broken
type:chore       # Maintenance, refactoring
type:docs        # Documentation changes

P0-critical      # Blocks launch, urgent
P1-high          # Important for quality
P2-normal        # Regular priority work
P3-low           # Nice to have, can wait

area:frontend    # UI components, pages
area:backend     # Database, RPC functions
area:infra       # Deployment, CI/CD
area:docs        # Documentation, guides
```

**Example Issue Workflow:**

1. Create Issue with proper labels
2. Issue appears in "Backlog" column of GitHub Projects
3. During planning, move to "This Sprint" column
4. Assign to Milestone for release tracking

### Branching with Issues

Always link your branch to the Issue number:

```bash
# Get latest updates
git fetch origin

# Create feature branch linked to issue
git switch -c feat/provider-search          # Use descriptive name
git push -u origin feat/provider-search     # Push and set tracking

# For bug fixes
git switch -c fix/login-timeout
git push -u origin fix/login-timeout
```

### Pull Request Best Practices

**PR Description Template:**
```markdown
## What changed
Brief description of what this PR does.

## Why
Why this change is needed (user impact, technical reason).

## How to test
Step-by-step instructions to verify the fix.

## Screenshots
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project conventions
- [ ] Self-reviewed for typos/errors
- [ ] Tested manually
- [ ] Ready for review

Closes #42    # Links to the Issue, closes it when merged
```

**Important:** Always include `Closes #<number>` or `Fixes #<number>` in PR description. This automatically closes the Issue when PR merges and creates permanent link between code and requirement.

### GitHub Projects Board

Our Kanban board has these columns:
- **Inbox** - New ideas/requests (untriaged)
- **Backlog** - Triage complete, ready for planning
- **This Sprint** - Work planned for current sprint
- **In Progress** - Developer actively working on it
- **In Review** - PR opened, waiting for review
- **Done** - Merged to main, deployed

**Daily Workflow:**
1. Pick an Issue from "This Sprint" column
2. Move it to "In Progress"
3. Create branch and start coding
4. Open PR, move Issue to "In Review"
5. After merge, Issue moves to "Done"

### Useful Git Commands for GitHub Workflow

```bash
# Before starting new work
git checkout main
git pull
git switch -c feat/your-feature-name

# Keep your branch updated
git fetch origin
git rebase origin/main

# When PR is ready
git push -u origin feat/your-feature-name
# Then open PR on GitHub with "Closes #<number>"

# After merge, clean up
git checkout main
git pull
git branch -d feat/your-feature-name    # Delete local branch
```

### Searching and Filtering Issues

**Quick filters in GitHub:**
```bash
# Show all high-priority bugs
is:open is:issue label:type:bug label:P1-high

# Show your assigned work
is:open assignee:@me

# Show work for current sprint
milestone:"Sprint 01" is:open

# Show frontend work
label:area:frontend is:open
```

---

## Troubleshooting

### Port Already in Use

**Problem:** `Error: Port 3000 is already in use`

```bash
# Windows
netstat -ano | findstr :3000       # Find process using port 3000
taskkill /PID <process-id> /F      # Kill that process

# Mac/Linux
lsof -ti:3000                      # Find process ID
kill -9 <process-id>               # Kill that process

# Or just kill all Node processes
taskkill /F /IM node.exe           # Windows
pkill -9 node                      # Mac/Linux
```

### Module Not Found

**Problem:** `Error: Cannot find module 'package-name'`

```bash
# 1. Clean install
rm -rf node_modules
pnpm install

# 2. If still broken, clear pnpm cache
pnpm store prune                   # Removes unused packages from store
pnpm install

# 3. Check if package is in package.json
cat apps/web/package.json | grep package-name
```

### Git Merge Conflicts

**Problem:** `CONFLICT (content): Merge conflict in file.ts`

```bash
# 1. See conflicted files
git status

# 2. Open each file and resolve conflicts manually
# Look for <<<<<<< HEAD markers

# 3. After fixing, mark as resolved
git add path/to/file.ts

# 4. Complete merge
git commit                         # Opens editor for merge commit message
```

### TypeScript Errors

**Problem:** Type errors after pulling latest code

```bash
# 1. Regenerate database types (if schema changed)
supabase gen types typescript --local > apps/web/lib/types/database.ts

# 2. Restart TypeScript server in VS Code
# Press Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 3. Check for missing dependencies
pnpm install
```

### Build Failures

**Problem:** `pnpm build` fails

```bash
# 1. Check for type errors
pnpm type-check                    # Shows all TypeScript errors

# 2. Check for lint errors
pnpm lint                          # Shows code quality issues

# 3. Clear Next.js cache
rm -rf .next
pnpm build

# 4. Check environment variables
cat apps/web/.env.local            # Verify all required vars are set
```

### Supabase Connection Issues

**Problem:** `Error: Invalid API key` or connection timeout

```bash
# 1. Verify environment variables
cat apps/web/.env.local

# 2. Check Supabase project status
# Go to supabase.com → your project → should be "Active"

# 3. Regenerate API keys if needed
# Supabase Dashboard → Settings → API → "Reset API keys"

# 4. Test connection
# Open browser console on localhost:3000
# Check for Supabase errors in Network tab
```

### Git Push Rejected

**Problem:** `error: failed to push some refs`

```bash
# 1. Pull latest changes first
git pull origin feat/your-branch

# 2. If conflicts, resolve them
git status                         # See conflicted files
# Fix conflicts, then:
git add .
git commit

# 3. Push again
git push origin feat/your-branch

# 4. If history diverged, force push (CAREFUL)
git push -f origin feat/your-branch # Only if you're sure no one else is using branch
```

### pnpm Install Fails

**Problem:** `ERR_PNPM_FETCH_404` or network errors

```bash
# 1. Clear pnpm cache
pnpm store prune

# 2. Delete lock file and reinstall
rm pnpm-lock.yaml
pnpm install

# 3. Check npm registry
pnpm config get registry          # Should be https://registry.npmjs.org/

# 4. Try with legacy peer deps
pnpm install --legacy-peer-deps
```

### VS Code Issues

**Problem:** IntelliSense not working or slow

```bash
# 1. Restart TypeScript server
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 2. Reload VS Code window
# Ctrl+Shift+P → "Developer: Reload Window"

# 3. Check TypeScript version
# Should use workspace version, not global
# Check bottom-right of VS Code status bar

# 4. Reinstall VS Code extensions
code --list-extensions             # See installed extensions
code --uninstall-extension <ext>   # Remove problematic extension
code --install-extension <ext>     # Reinstall
```

---

## Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Supabase Docs](https://supabase.com/docs) - Backend and database
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework

### Internal Docs
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [ROADMAP.md](./ROADMAP.md) - Development plan
- [OPERATIONS.md](./OPERATIONS.md) - Monitoring and deployment

### Getting Help
- **GitHub Issues** - Report bugs or request features
- **GitHub Discussions** - Ask questions or share ideas
- **Team Chat** - Quick questions and daily coordination

---

**Next Steps:**
- ✅ Set up local environment
- ✅ Clone repo and install dependencies
- ✅ Create your first branch
- ✅ Make a small change and open a PR
- 📚 Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system

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
6. [Supabase CLI](#supabase-cli)
7. [Git Workflow](#git-workflow)
8. [Collaboration Guide](#collaboration-guide)
9. [Daily Workflow](#daily-workflow)
10. [Working with Issues, Projects, and PRs](#working-with-issues-projects-and-prs)
11. [UI Component Guidelines](#ui-component-guidelines)
12. [UI/UX Standards](#uiux-standards)
13. [shadcn/ui Components](#shadcnui-components)
14. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Required Tools

Install these tools before starting:

#### Node.js (v18 or later)**

- JavaScript runtime that executes our code. Download from [nodejs.org](https://nodejs.org/)

#### pnpm (package manager)

- Faster alternative to npm, saves disk space by sharing packages. Install with `npm install -g pnpm`

#### Git (version control)

- Tracks code changes and enables collaboration. Download from [git-scm.com](https://git-scm.com/)

#### VS Code / Windsurf / Cursor (recommended editor)

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

### Environment Strategy

We use a **two-environment setup** (dev + prod) with separate Supabase projects:

- **Local Development** → Always uses `vipra-sethu-dev` (dev Supabase project)
- **Vercel Dev** → Uses `vipra-sethu-dev` (dev Supabase project)
- **Vercel Prod** → Uses `vipra-sethu` (prod Supabase project)

**📖 Complete Guide:** See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for full details on dev/prod setup.

### Required Variables (Local Development)

Edit `apps/web/.env.local` with **dev environment** values:

```env
# Supabase Configuration (DEV PROJECT)
# Get these from: Supabase Dashboard → vipra-sethu-dev → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<dev-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-key>

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (Optional - use dev keys)
NEXT_PUBLIC_POSTHOG_KEY=<dev-posthog-key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Optional - use dev DSN)
NEXT_PUBLIC_SENTRY_DSN=<dev-sentry-dsn>
SENTRY_AUTH_TOKEN=<dev-sentry-token>
```

### Getting Supabase Credentials

**For Dev Environment:**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open **vipra-sethu-dev** project
3. Go to **Settings** → **API**
4. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy **service_role** key → paste as `SUPABASE_SERVICE_ROLE_KEY`

**For Prod Environment:**

- Prod credentials are managed in Vercel dashboard
- Never use prod credentials locally
- See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for Vercel configuration

### Security Rules

- ✅ **DO** commit `.env.example` (template with no real values)
- ❌ **DON'T** commit `.env.local` (contains secrets)
- ❌ **DON'T** share service role keys publicly
- ✅ **DO** use different keys for dev/prod environments
- ✅ **DO** always use dev keys for local development
- ❌ **DON'T** use prod keys locally (risk of accidental data changes)

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

### Modern Approach: Supabase CLI Migrations

**We now use Supabase CLI for database management** (Database as Code):

- All schema changes tracked in `supabase/migrations/` folder
- Migrations committed to Git alongside code
- Applied via CLI to dev, then prod environments
- No more manual SQL execution in Studio

**📖 Complete Guide:** See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for full migration workflow.

### Quick Start with Supabase CLI

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to dev project
cd c:\dev\vipra-sethu
supabase link --project-ref <dev-project-ref>

# 4. Apply all migrations
supabase db push

# 5. Verify setup
supabase db diff  # Should show "No schema differences"
```

### Creating New Migrations

```bash
# Create new migration file
supabase migration new "add_booking_table"

# Edit the generated file
code supabase/migrations/<timestamp>_add_booking_table.sql

# Apply to dev environment
supabase db push

# Test locally
pnpm dev

# Commit to Git
git add supabase/migrations/
git commit -m "feat: add booking table migration"
```

### Legacy Approach (Deprecated)

**⚠️ Old Method:** The following files in `infra/supabase/` are **legacy** and should NOT be used for new projects:

- `01_alter_providers_table.sql` through `08_fix_admins_policy.sql`
- These were manually run in Supabase Studio
- Now superseded by CLI-managed migrations in `supabase/migrations/`

**Migration Status:** We are migrating from the old approach to Supabase CLI. See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for migration instructions.

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

---

## Supabase CLI

### Essential Commands

```bash
# Help and documentation
supabase --help                                  # Show all commands
supabase db --help                               # Database commands
supabase migration --help                        # Migration commands

# Project management
supabase login                                   # Login to Supabase
supabase link --project-ref <ref>                # Link to Supabase project
supabase projects list                           # List all your projects

# Database operations
supabase db pull                                 # Fetch current schema from remote
supabase db push                                 # Apply local migrations to remote
supabase db diff                                 # Show differences between local and remote
supabase db reset                                # Reset local database (dev only!)

# Migration management
supabase migration new "description"             # Create new migration file
supabase migration list                          # List all migrations
supabase migration up                            # Apply pending migrations

# Type generation
supabase gen types typescript --linked > apps/web/lib/types/database.ts
```

### Common Workflows

**Switch between dev and prod:**

```bash
# Work on dev environment
supabase link --project-ref <dev-project-ref>
supabase db push

# Switch to prod (for applying tested migrations)
supabase link --project-ref <prod-project-ref>
supabase db push
```

**Create and apply migration:**

```bash
# 1. Create migration
supabase migration new "add_reviews_table"

# 2. Edit file
code supabase/migrations/<timestamp>_add_reviews_table.sql

# 3. Apply to dev
supabase link --project-ref <dev-project-ref>
supabase db push

# 4. Test locally
pnpm dev

# 5. Commit to Git
git add supabase/migrations/
git commit -m "feat: add reviews table"

# 6. After merge, apply to prod
supabase link --project-ref <prod-project-ref>
supabase db push
```

**Generate TypeScript types:**

```bash
# After schema changes, regenerate types
supabase gen types typescript --linked > apps/web/lib/types/database.ts

# Commit updated types
git add apps/web/lib/types/database.ts
git commit -m "chore: update database types"
```

### Troubleshooting

**Problem:** `supabase: command not found`

```bash
# Reinstall globally
npm install -g supabase

# Verify
supabase --version
```

**Problem:** `Failed to link project`

```bash
# Get project ref from Supabase Dashboard → Settings → General
# Ensure you're logged in
supabase login

# Link with correct ref
supabase link --project-ref <exact-project-ref>
```

**Problem:** `Migration already applied`

```bash
# Check migration status
supabase migration list

# If needed, create new migration to fix issue
supabase migration new "fix_schema_issue"
```

**📖 Full Guide:** See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for complete Supabase CLI documentation.

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

```bash
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
   git checkout main # Switch to main branch
   git pull          # Fetch and merge remote changes
   git checkout -b feat/your-feature # Create and switch to new feature branch
   ```

2. **Make changes and commit**

   ```bash
   # Make your changes
   git add . # Stage all changes
   git commit -m "feat: add feature description" # Commit changes
   ```

3. **Keep branch updated**

   ```bash
   git checkout main # Switch to main branch
   git pull          # Fetch and merge remote changes
   git checkout feat/your-feature # Switch to feature branch
   git merge main              # Or: git rebase main
   ```

4. **Push to GitHub**

   ```bash
   git push -u origin feat/your-feature # Push feature branch to remote
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
   git add . # Stage all changes
   git commit -m "fix: address review comments" # Commit changes
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
git add path/to/resolved-file.ts # Stage resolved file

# 5. Complete merge/rebase
git commit                          # For merge
git rebase --continue               # For rebase
```

---

## Daily Workflow

### Morning Routine

```bash
# 1. Pull latest changes
git checkout main # Switch to main branch
git pull          # Fetch and merge remote changes

# 2. Update dependencies (if package.json changed)
pnpm install # Install dependencies

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
git add . # Stage all changes
git commit -m "feat: your change description" # Commit changes
```

### End of Day

```bash
# 1. Commit work in progress
git add . # Stage all changes
git commit -m "wip: save progress on feature X" # Commit changes

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
git checkout main # Switch to main branch
git pull          # Fetch and merge remote changes
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
git switch -c fix/login-timeout             # Use descriptive name
git push -u origin fix/login-timeout        # Push and set tracking
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
git checkout main # Switch to main branch
git pull          # Fetch and merge remote changes
git switch -c feat/your-feature-name # Create and switch to new feature branch

# Keep your branch updated
git fetch origin # Fetch remote changes
git rebase origin/main # Rebase feature branch on top of main

# When PR is ready
git push -u origin feat/your-feature-name # Push feature branch to remote
# Then open PR on GitHub with "Closes #<number>"

# After merge, clean up
git checkout main # Switch to main branch
git pull          # Fetch and merge remote changes
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
rm -rf node_modules # Remove node_modules folder
pnpm install # Install dependencies

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

## UI/UX Standards

### Design Principles

Our design follows modern web standards inspired by top-tier platforms like Airbnb, Stripe, and Linear:

#### Visual Hierarchy

- **Clean Layouts**: Use generous whitespace and proper spacing (`space-y-8`, `space-y-6`)
- **No Dividing Lines**: Avoid harsh borders, use subtle shadows and whitespace instead
- **Consistent Colors**: Primary saffron (`#f59e0b`), slate grays, and white backgrounds
- **Modern Typography**: Clear hierarchy with `text-4xl/3xl/2xl` for headings

#### Component Design

- **Rounded Corners**: Use `rounded-3xl` for major cards, `rounded-full` for buttons
- **Subtle Shadows**: `shadow-sm` with `hover:shadow-md` transitions
- **Clean Cards**: White backgrounds with subtle borders (`border-slate-100`)
- **Responsive Grids**: Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` patterns

#### Color Usage

- **Primary Actions**: `bg-saffron-600 hover:bg-saffron-700`
- **Secondary Actions**: `bg-slate-100 hover:bg-slate-200`
- **Backgrounds**: Consistent `bg-white` with subtle `bg-slate-50` variations
- **Text**: `text-slate-900` for headings, `text-slate-600` for body text

#### Layout Patterns

- **Centered Content**: Use `max-w-4xl mx-auto` for readable content
- **Sticky Elements**: `sticky top-14` for navigation, `lg:sticky lg:top-28` for sidebars
- **Proper Spacing**: `py-16` for sections, `py-8` for subsections

### Common Patterns

#### Hero Sections

```tsx
<section className="py-16 md:py-24 bg-gradient-to-br from-saffron-50 via-ivory to-gold-50">
  <div className="container-custom">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
        Title
      </h1>
      <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
        Description
      </p>
    </div>
  </div>
</section>
```

#### Card Layouts

```tsx
<div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-2xl font-bold text-slate-900 mb-4">Title</h3>
  <p className="text-slate-600 leading-relaxed">Content</p>
</div>
```

#### Contact Cards

```tsx
<div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
  <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
  <div className="space-y-3">
    <a href="#" className="w-full py-3 rounded-full bg-saffron-600 text-white font-medium hover:bg-saffron-700 transition-all">
      WhatsApp
    </a>
  </div>
</div>
```

---

## shadcn/ui Components

### Configuration

We use shadcn/ui components with the following configuration:

- **Style**: `new-york`
- **Base Color**: `slate`
- **CSS Variables**: `true`

### Available Components

#### Core Components

- **Button**: `@/components/ui/button.tsx`
  - Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
  - Sizes: `default`, `sm`, `lg`, `icon`

- **Card**: `@/components/ui/card.tsx`
  - Use `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

- **Accordion**: `@/components/ui/accordion.tsx`
  - Perfect for FAQs and expandable content
  - Use `type="single"` or `type="multiple"`

- **Badge**: `@/components/ui/badge.tsx`
  - For status indicators, categories, tags
  - Variants: `default`, `secondary`, `destructive`, `outline`

- **Input**: `@/components/ui/input.tsx`
  - Form inputs with consistent styling

- **Skeleton**: `@/components/ui/skeleton.tsx`
  - Loading states and placeholders

### Usage Examples

#### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button className="px-5 py-2.5 rounded-full bg-saffron-600 hover:bg-saffron-700">
  WhatsApp
</Button>

// Secondary action
<Button variant="outline" className="rounded-full border-slate-200">
  Cancel
</Button>

// Icon button
<Button variant="ghost" size="icon" className="rounded-full">
  <Share2 className="h-4 w-4" />
</Button>
```

#### Accordion for FAQs

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

<Accordion type="single" defaultValue="item-0" className="w-full">
  <AccordionItem value="item-0">
    <AccordionTrigger className="text-left">Question?</AccordionTrigger>
    <AccordionContent>
      <p className="text-slate-600">Answer</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Card Layout

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="rounded-3xl shadow-sm">
  <CardHeader>
    <CardTitle className="text-2xl">Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### Custom Styling

Extend shadcn components with custom Tailwind classes:

```tsx
// Custom styled button
<Button className="rounded-full bg-saffron-600 hover:bg-saffron-700 transition-all shadow-sm hover:shadow-md">
  Custom Button
</Button>

// Custom card with gradient
<Card className="bg-gradient-to-br from-saffron-50 to-orange-50 border-saffron-100">
  <CardContent className="p-6">
    Content
  </CardContent>
</Card>
```

### Best Practices

1. **Consistency**: Use the same variants and sizes across the app
2. **Accessibility**: shadcn components are built with accessibility in mind
3. **Customization**: Use Tailwind classes to extend, not override default styles
4. **Performance**: Components are tree-shakeable, only import what you use

---

## UI Component Guidelines

### Naming Convention

Follow our standardized UI component naming convention:

- **shadcn/ui components**: Use lowercase (e.g., `button.tsx`, `card.tsx`, `input.tsx`)
- **Custom app components**: Use PascalCase (e.g., `ProviderCard.tsx`, `SearchBar.tsx`)
- **Simple UI elements**: Use lowercase (e.g., `chip.tsx`, `empty-state.tsx`)

**📖 Full Documentation**: See [UI-COMPONENT-NAMING.md](./UI-COMPONENT-NAMING.md) for detailed rules and examples.

### Recent Build Fixes

For information about recent build fixes and troubleshooting, see:

- [BUILD-FIXES.md](./BUILD-FIXES.md) - Complete changelog of build fixes

---

**Next Steps:**

- ✅ Set up local environment
- ✅ Clone repo and install dependencies
- ✅ Create your first branch
- ✅ Make a small change and open a PR
- 📚 Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system

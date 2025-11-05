# Vipra Sethu — Developer Handbook

**Last Updated:** 2025-11-05

Welcome to the developer handbook for Vipra Sethu. This document is the single source of truth for setting up, developing, deploying, and maintaining the application.

## Table of Contents

1. [Overview & Tech Stack](#overview--tech-stack)
2. [Project Structure](#project-structure)
3. [Local Development Setup](#local-development-setup)
4. [Development Commands](#development-commands)
5. [Database Management](#database-management)
6. [Core Concepts & Architecture](#core-concepts--architecture)
7. [Taxonomy Implementation](#taxonomy-implementation)
8. [Git Workflow](#git-workflow)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview & Tech Stack

Vipra Sethu is a community directory platform connecting users with trusted service providers. This is a full-stack application built on a modern, serverless-first technology stack.

- **Monorepo:** [pnpm](https://pnpm.io/) workspaces with [Turborepo](https://turbo.build/repo) for build orchestration.
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router).
- **Backend & Database:** [Supabase](https://supabase.com/) (Postgres, Auth, Storage, RLS).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/).
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.
- **Deployment:** [Vercel](https://vercel.com/).

---

## Project Structure

The project is organized as a monorepo to keep all related code in one place.

```bash
/vipra-sethu
├── apps/
│   └── web/            # The main Next.js web application
├── docs/               # All project documentation, including this file
├── infra/
│   └── supabase/       # Database schema, policies, and RPC functions
├── .gitignore
├── package.json        # Root package file with monorepo scripts
├── pnpm-lock.yaml
└── pnpm-workspace.yaml # Defines the monorepo workspaces
```

### Key Directories

- **`apps/web/`**: This is the main application.
  - `app/`: The Next.js App Router directory. All pages, layouts, and API routes are here.
    - `app/api/`: API routes (e.g., `/api/onboard`).
    - `app/admin/`: Admin-facing pages.
    - `app/providers/`: Public-facing provider directory pages.
  - `lib/`: Shared utility functions, including Supabase clients (`supabaseServer.ts`).
  - `.env.local`: **CRITICAL**. Contains your Supabase keys. **Never commit this file.**

- **`infra/supabase/`**: Your database source of truth.
  - `schema.sql`: Defines all tables, columns, and indices.
  - `policies.sql`: Defines the Row Level Security (RLS) policies for each table.
  - `rpc_search_providers.sql`: The main search function.
  - `provider-photos-storage-policy.sql`: Security policies for the photo storage bucket.

- **`docs/`**: All non-code documentation.
  - `00-vision.md` to `20-risk-register.md`: The original product and technical planning documents.
  - `review.md`: A detailed review of the codebase's implementation status.
  - `to-do.md`: A prioritized checklist of development tasks.
  - `README.md`: This file.

---

## Local Development Setup

Follow these steps to get the application running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [pnpm](https://pnpm.io/installation)
- A Supabase account and a new project created.

### 2. Why We Use pnpm

**pnpm** (performant npm) is our package manager of choice for several key reasons:

- **Disk Space Efficiency**: pnpm uses a content-addressable filesystem to store all dependencies in a single place, saving significant disk space compared to npm/yarn
- **Fast Installations**: Dependencies are linked rather than copied, making installations significantly faster
- **Strict Dependency Management**: pnpm prevents phantom dependencies by only allowing access to explicitly declared dependencies
- **Monorepo Support**: Excellent built-in support for monorepos with workspaces
- **Compatibility**: Fully compatible with npm packages and registries

> **Note**: If you don't have pnpm installed, run: `npm install -g pnpm`

### 3. Installation

Clone the repository and install dependencies using `pnpm`.

```bash
# Clone your repository (if you haven't already)
git clone <your-repo-url>
cd vipra-sethu

# Install all dependencies for all workspaces
pnpm install
```

### 4. Environment Variables

Your app needs to connect to Supabase. You'll need to get your project URL and API keys.

1. In your Supabase project dashboard, go to **Project Settings > API**.
2. Find the **Project URL** and the **`anon` (public) key**.
3. Find the **`service_role` (secret) key**.
4. Create a new file `apps/web/.env.local` by copying `apps/web/.env.example`.
5. Paste your keys into `.env.local`:

    ```ini
    NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

### 5. Database Setup

You need to apply the schema and policies to your Supabase database.

1. Go to your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Open the files in `infra/supabase/` and copy-paste their contents into the SQL Editor in the following order:
   1. `schema.sql`
   2. `policies.sql`
   3. `provider-photos-storage-policy.sql`
   4. `rpc_search_providers.sql`
4. Click **"Run"** for each script.

---

## Development Commands

### Essential Commands

All commands should be run from the **project root** directory unless specified otherwise.

#### 🚀 Start Development Server

```bash
pnpm dev
```

- Starts the Next.js development server
- Opens at [http://localhost:3000](http://localhost:3000)
- Includes hot reload for fast development
- Runs in watch mode for automatic restarts

#### 🔨 Build for Production

```bash
pnpm build
```

- Creates an optimized production build
- Checks for TypeScript errors during build
- Generates static assets and optimizes bundles
- Use this to test before deployment

#### 🧪 Type Checking

```bash
pnpm tsc --noEmit
```

- Checks for TypeScript compilation errors
- Fast way to validate types without building
- Run this frequently during development
- Equivalent to: `cd apps/web && pnpm tsc --noEmit`

#### 📦 Install Dependencies

```bash
pnpm install
```

- Installs all dependencies for all workspaces
- Use after adding new packages or pulling changes
- Automatically resolves cross-workspace dependencies

#### 🧹 Clean Cache

```bash
pnpm clean
```

- Removes build artifacts and cache
- Useful for fixing weird build issues
- Deletes `.next` directories and node_modules cache

#### 📊 Lint Code

```bash
pnpm lint
```

- Runs ESLint to check code quality
- Identifies potential issues and style violations
- Run before committing changes

#### 🎨 Format Code

```bash
pnpm format
```

- Formats code using Prettier
- Ensures consistent code style across the project
- Run automatically on pre-commit hooks if configured

### Workspace-Specific Commands

Sometimes you need to run commands in specific workspaces:

#### Web App Commands (from apps/web/)

```bash
cd apps/web

# Start dev server for web app only
pnpm dev

# Build web app only
pnpm build

# Type check web app only
pnpm tsc --noEmit

# Install dependency for web app only
pnpm add <package-name>

# Install dev dependency for web app only
pnpm add -D <package-name>
```

### Development Workflow

#### Daily Development

1. **Start**: `pnpm dev` to start the development server
2. **Code**: Make changes to your files
3. **Type Check**: `pnpm tsc --noEmit` to validate types
4. **Build Test**: `pnpm build` to test production build
5. **Lint**: `pnpm lint` to check code quality
6. **Format**: `pnpm format` to clean up code style
7. **Kill Node**: `taskkill /F /IM node.exe` to kill any running Node.js processes

#### Adding New Dependencies

```bash
# For production dependencies
pnpm add <package-name>

# For development dependencies
pnpm add -D <package-name>

# For specific workspace
cd apps/web
pnpm add <package-name>
```

#### Before Committing

```bash
# 1. Check types
pnpm tsc --noEmit

# 2. Build to ensure everything works
pnpm build

# 3. Lint code
pnpm lint

# 4. Format code
pnpm format
```

### Troubleshooting Development Issues

#### Common Problems

**"Module not found" errors:**

```bash
# Clear cache and reinstall
pnpm clean
pnpm install
```

**TypeScript errors not showing in IDE:**

```bash
# Force type check
pnpm tsc --noEmit
```

**Build fails but dev works:**

```bash
# Clean build artifacts
rm -rf .next
pnpm build
```

**Dependency conflicts:**

```bash
# Update lockfile
pnpm install --force
```

#### Performance Tips

- **Fast Refresh**: The dev server supports fast refresh - most changes appear instantly
- **Type Checking**: Run `pnpm tsc --noEmit` frequently to catch errors early
- **Build Size**: Use `pnpm build` to check bundle size before deployment
- **Memory**: If the dev server becomes slow, restart it with `pnpm dev`

#### Environment-Specific Commands

**Development:**

```bash
pnpm dev          # Development server with hot reload
pnpm tsc --noEmit # Type checking only
pnpm lint         # Code quality checks
```

**Production:**

```bash
pnpm build        # Production build
pnpm start        # Start production server (after build)
pnpm preview      # Preview production build locally
```

**Maintenance:**

```bash
pnpm install      # Install/update dependencies
pnpm clean        # Clean build artifacts
pnpm outdated      # Check for outdated packages
pnpm update        # Update packages
```

### Running the Application

Start the development server from the root of the project.

```bash
pnpm dev
```

This will start the Next.js app. You can now open [http://localhost:3000](http://localhost:3000) in your browser.

**What happens when you run `pnpm dev`:**

1. pnpm reads the workspace configuration
2. Starts the Next.js development server in `apps/web/`
3. Enables hot module replacement for fast development
4. Watches for file changes and automatically restarts
5. Opens the application on port 3000 (or next available port)

**Development Server Features:**

- ⚡ **Fast Refresh**: Changes appear instantly without page reload
- 🔍 **Error Overlay**: Detailed error messages in browser
- 📊 **Build Metrics**: Real-time compilation stats
- 🌐 **Network Requests**: View all API calls and responses
- 📱 **Responsive Testing**: Test mobile layouts with device simulation

---

## Database Management

All database changes are managed through SQL migration scripts in the `infra/supabase/` directory.

### ✅ **Current Status: Clean Taxonomy Implementation**

The database now uses a **clean, normalized taxonomy approach** (no backward compatibility needed):

- **Categories Table**: Normalized service categories (`purohit`, `cook`, `essentials`, etc.)
- **Sampradayas Table**: Normalized religious traditions (`madhwa`, `smarta`, `vaishnava`, etc.)
- **Provider Table**: Uses FK references (`category_code`, `sampradaya_code`) instead of text fields
- **Clean RPC Functions**: All search functions use code-based filters only

### Migration Scripts (Execute in Order)

```sql
-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Run migration scripts in order
\i 01_alter_providers_table.sql
\i 02_create_new_tables.sql
\i 03_update_rls_policies.sql
\i 04_create_triggers.sql
\i 05_update_rpc_functions.sql
\i 06_clean_taxonomy_tables.sql
\i 07_clean_rpc_and_views.sql

-- 3. Set up storage bucket
\i provider-photos-storage-policy.sql
```

### Testing the Migration

```sql
-- Test search with clean taxonomy
SELECT * FROM search_providers(
  p_category_code := 'purohit',
  p_sampradaya_code := 'madhwa',
  p_limit := 10
);

-- Test taxonomy functions
SELECT * FROM get_active_categories();
SELECT * FROM get_active_sampradayas();

-- Test provider view with taxonomy names
SELECT id, name, category_name, sampradaya_name 
FROM provider_with_taxonomies 
WHERE status = 'approved' 
LIMIT 5;
```

### Schema Documentation

See `docs/11-data-model-and-schemas.md` for comprehensive schema documentation and `infra/supabase/README.md` for detailed migration instructions.

---

## Taxonomy Implementation

### ✅ **Completed: Clean Taxonomy Schema**

The database now uses normalized taxonomy tables instead of free-text fields:

#### Database Changes

- **`categories` table**: Service categories with codes (`purohit`, `cook`, `essentials`, etc.)
- **`sampradayas` table**: Religious traditions with codes (`madhwa`, `smarta`, `vaishnava`, etc.)
- **`providers` table**: Uses `category_code` and `sampradaya_code` FK references
- **Legacy text fields removed**: No more `category` and `sampradaya` text columns

#### Frontend Integration

**TypeScript Types:**

```typescript
// Provider interface now uses clean taxonomy
interface Provider {
  id: string;
  name: string;
  category_code: string;  // FK reference
  sampradaya_code?: string;  // FK reference
  // ... other fields
}

// Taxonomy types
interface Category {
  code: string;
  name: string;
  active: boolean;
}

interface Sampradaya {
  code: string;
  name: string;
  active: boolean;
}
```

**UI Components:**

- Filter dropdowns load via service functions that query tables directly
  (hotfix to avoid RPC 500s due to an admins policy recursion; see Troubleshooting).
- Search form uses code-based filters (`p_category_code`, `p_sampradaya_code`).
- Provider cards display resolved names via `provider_with_taxonomies` view.

**Service Functions (current):**

```typescript
// Fetch taxonomy for UI filters (direct table read)
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .eq('active', true)
  .order('sort_order', { ascending: true })
  .order('name', { ascending: true });

const { data: sampradayas } = await supabase
  .from('sampradayas')
  .select('*')
  .eq('active', true)
  .order('sort_order', { ascending: true })
  .order('name', { ascending: true });

// Search with clean taxonomy still uses RPC
const { data: results } = await supabase.rpc('search_providers', {
  p_category_code: 'purohit',
  p_sampradaya_code: 'madhwa'
});
```

### Implementation Guide

For detailed implementation steps, see `docs/CLEAN-TAXONOMY-IMPLEMENTATION.md`.

---

## Core Concepts & Architecture

- **Authentication:** Handled by Supabase Auth. The app will use email magic links. Routes are protected using Next.js Middleware, which checks for a valid session and user role.
- **Data Access:** All database queries are made through the Supabase client. Server Components use a server-side client, while client components will use a client-side one. RLS enforces that users can only see the data they are permitted to.
- **Search:** The `search_providers` RPC function is the primary way to query the provider directory. It's designed to be called from the server and encapsulates all filtering logic.
- **File Uploads:** Photos are uploaded directly to Supabase Storage from the client, but the security policies (`provider-photos-storage-policy.sql`) ensure only authenticated users can upload and only admins can delete.

---

## Git Workflow

We use a simple feature-branch workflow (GitHub Flow).

1. **`main` branch is always stable.**
2. Create a new branch for every feature or bugfix (e.g., `feat/auth`, `fix/search-filter`).
3. Commit your changes to your feature branch.
4. Push your branch and open a Pull Request (PR) against `main`.
5. Once the PR is reviewed and approved, it can be merged into `main`.

---

## Deployment

We recommend deploying to **Vercel** for the best performance and developer experience with Next.js.

### Vercel Setup

1. Create a Vercel account and connect it to your GitHub repository.
2. Create a new Vercel project and import the `vipra-sethu` repository.
3. Vercel will automatically detect it as a Next.js app.
4. In the Vercel project settings, go to **Environment Variables**.
5. Add the same keys from your `.env.local` file (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
6. Trigger a deployment. Vercel will now build and deploy your app automatically on every push to `main` and create preview deployments for every PR.

---

## Troubleshooting

- **`Error: connect ECONNREFUSED`**: The Next.js app can't connect to the database. Check that your Supabase project is running and that your `.env.local` keys are correct.
- **`401 Unauthorized` or RLS errors**: You are trying to access data you don't have permission for. Check the RLS policies in `policies.sql` and ensure your user has the correct role (e.g., are they in the `admins` table?).
- **`pnpm` errors**: Run `pnpm install` again to ensure all dependencies are correctly installed in all workspaces.
- **Vercel build fails**: Check the build logs on Vercel. It's often due to missing environment variables or a type error that `tsc` catches during the build.

### Known Issue: Taxonomy RPC 500 due to RLS recursion

- **Symptom:** UI showed "Failed to fetch categories/sampradayas" and API logs had multiple 500s for `get_active_categories` / `get_active_sampradayas`.
- **Root Cause:** Postgres logs reported `infinite recursion detected in policy for relation "admins"`. The `admins` table policy referenced `admins` inside its own `USING` clause via `EXISTS (SELECT 1 FROM admins ...)`, triggering recursion during policy evaluation used by other tables' admin checks.
- **Fix:** Replace recursive policy with a self-filter policy and avoid referencing `admins` from within itself:

  ```sql
  -- infra/supabase/08_fix_admins_policy.sql
  DROP POLICY IF EXISTS admins_read ON public.admins;
  DROP POLICY IF EXISTS admins_self_read ON public.admins;
  CREATE POLICY admins_self_read ON public.admins
  FOR SELECT TO public
  USING (user_email = (auth.jwt() ->> 'email'));
  ```

- **Hotfix in app:** `apps/web/lib/services/taxonomy.ts` now queries `categories` and `sampradayas` tables directly (public SELECT) instead of RPC, with comments referencing this incident. RPCs for search remain unchanged.

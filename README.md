# 🌉 Vipra Sethu

**"Bridge among the wise"** — Connecting Brahmin community members with trusted, values-aligned service providers.

**Last Updated:** 2025-11-08  
**Status:** Active Development | Alpha Phase

---

## 📖 Table of Contents

1. [What is Vipra Sethu?](#what-is-vipra-sethu)
2. [Quick Start](#quick-start)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Key Features](#key-features)
6. [Documentation](#documentation)
7. [Development Status](#development-status)
8. [Contributing](#contributing)

---

## 🎯 What is Vipra Sethu?

Vipra Sethu is a community directory platform that helps users find and connect with trusted service providers within the Brahmin community. Starting with Madhwa Brahmins in Bangalore, we're building a platform that makes it easy to:

- **Find providers** - Search by service type, location, language, and religious tradition
- **Verify quality** - Admin-approved providers with detailed profiles
- **Connect easily** - Direct WhatsApp and phone contact (no middleman)
- **Onboard quickly** - Simple multi-step registration for service providers

### Who is this for?

- **Users** - Community members looking for purohits, cooks, senior care, and other services
- **Providers** - Service providers wanting to reach their community
- **Admins** - Community moderators who approve and manage provider listings

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **pnpm** (package manager) - Install with `npm install -g pnpm`
- **Supabase account** - [Sign up free](https://supabase.com/)
- **Git** - [Download here](https://git-scm.com/)

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/KSH79/vipra-sethu.git
cd vipra-sethu

# 2. Install dependencies (this installs all packages for the entire project)
pnpm install

# 3. Set up environment variables
cd apps/web
cp .env.example .env.local
# Edit .env.local with your Supabase credentials (see below)

# 4. Run database migrations
# Go to your Supabase dashboard → SQL Editor
# Run the SQL files from infra/supabase/ in order (see DEVELOPER-GUIDE.md)

# 5. Start the development server
cd ../..  # Back to project root
pnpm dev

# 6. Open your browser
# Visit http://localhost:3000
```

### Environment Variables

Edit `apps/web/.env.local` with your Supabase credentials:

```env
# Get these from your Supabase project dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Your local development URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics and monitoring (can add later)
# NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**💡 Tip:** Never commit `.env.local` to Git! It contains secret keys.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router (handles pages and routing)
- **TypeScript** - Type-safe JavaScript (catches errors before runtime)
- **Tailwind CSS** - Utility-first styling (makes beautiful UIs fast)
- **React Hook Form + Zod** - Form handling and validation

### Backend & Database
- **Supabase** - All-in-one backend platform providing:
  - **PostgreSQL** - Powerful database (stores all data)
  - **Authentication** - Magic link login (no passwords needed)
  - **Storage** - Photo uploads for provider profiles
  - **Row Level Security (RLS)** - Database-level access control
  - **Real-time** - Live updates (future feature)

### Deployment & Monitoring
- **Vercel** - Hosting platform (deploys automatically from Git)
- **PostHog** - User analytics (tracks how people use the app)
- **Sentry** - Error tracking (alerts us when things break)

### Development Tools
- **pnpm** - Fast package manager (better than npm)
- **Turborepo** - Monorepo build system (manages multiple apps)
- **ESLint** - Code quality checker
- **Prettier** - Code formatter

---

## 📁 Project Structure

```
vipra-sethu/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/                # Pages and routes (Next.js App Router)
│       │   ├── page.tsx        # Homepage
│       │   ├── providers/      # Provider directory pages
│       │   ├── onboard/        # Provider registration
│       │   ├── admin/          # Admin dashboard
│       │   └── api/            # API endpoints
│       ├── components/         # Reusable UI components
│       │   ├── ui/             # Basic UI elements (Button, Card, etc.)
│       │   ├── forms/          # Form components
│       │   └── navigation/     # Navigation components
│       ├── lib/                # Utility functions and services
│       │   ├── supabaseClient.ts   # Database client
│       │   ├── services/           # Business logic
│       │   └── types/              # TypeScript type definitions
│       ├── public/             # Static assets (images, fonts)
│       └── .env.local          # Environment variables (DO NOT COMMIT!)
│
├── infra/
│   └── supabase/               # Database schema and migrations
│       ├── schema.sql          # Main database structure
│       ├── policies.sql        # Security policies (RLS)
│       ├── rpc_*.sql           # Database functions
│       └── *.sql               # Migration files (run in order)
│
├── docs/                       # Documentation
│   ├── README.md               # This file (start here!)
│   ├── DEVELOPER-GUIDE.md      # Complete development manual
│   ├── ARCHITECTURE.md         # Technical architecture
│   ├── PRODUCT.md              # Product vision and requirements
│   ├── ROADMAP.md              # Development plan and tasks
│   └── OPERATIONS.md           # Running and monitoring
│
├── package.json                # Root package file (workspace config)
├── pnpm-workspace.yaml         # Defines monorepo workspaces
├── turbo.json                  # Turborepo configuration
└── .gitignore                  # Files to exclude from Git
```

### Key Directories Explained

- **`apps/web/app/`** - All pages live here. Each folder becomes a route (e.g., `providers/` → `/providers`)
- **`apps/web/lib/`** - Shared code like database queries, utilities, and type definitions
- **`infra/supabase/`** - Your database "source of truth" - all schema changes go here
- **`docs/`** - All project documentation (you're reading one now!)

---

## ✨ Key Features

### For Users
- ✅ **Advanced Search** - Filter by category, location, language, and tradition
- ✅ **Provider Profiles** - Detailed information with photos
- ✅ **Direct Contact** - WhatsApp and phone links (no middleman)
- ✅ **Mobile-Friendly** - Works great on phones and tablets

### For Providers
- ✅ **Easy Onboarding** - Multi-step registration form
- ✅ **Photo Upload** - Showcase your work
- ✅ **Profile Management** - Update your information anytime
- 🔄 **Analytics** - See how many people view your profile (coming soon)

### For Admins
- ✅ **Approval Queue** - Review and approve new providers
- ✅ **Admin Dashboard** - Manage all providers
- ✅ **MFA Security** - Two-factor authentication for admin accounts
- 🔄 **Audit Logs** - Track all admin actions (coming soon)

**Legend:** ✅ = Implemented | 🔄 = In Progress | 📋 = Planned

---

## 📚 Documentation

### External Resources

- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Supabase Docs](https://supabase.com/docs) - Backend and database
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework

### Internal Docs

- [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) - Complete development guide
- [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) - Dev/prod environment management
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [ROADMAP.md](./ROADMAP.md) - Development plan
- [OPERATIONS.md](./OPERATIONS.md) - Monitoring and deployment

### For Product & Business
- **[PRODUCT.md](docs/PRODUCT.md)** - Product vision, requirements, and user stories
- **[OPERATIONS.md](docs/OPERATIONS.md)** - Running and monitoring the app

- [Local Development Setup](docs/DEVELOPER-GUIDE.md#local-setup)
- [Database Migrations](docs/DEVELOPER-GUIDE.md#database-migrations)
- [Deployment Guide](docs/DEVELOPER-GUIDE.md#deployment)
- [Troubleshooting](docs/DEVELOPER-GUIDE.md#troubleshooting)

---

## 🎯 Development Status

### ✅ Completed (Alpha Ready)
- Core database schema with RLS policies
- Provider search with filters (category, location, language, tradition)
- Provider onboarding with photo upload
- Admin approval workflow
- Authentication system (magic links)
- MFA for admin security
- Analytics integration (PostHog)
- Error tracking (Sentry)

### 🔄 In Progress
- Vercel deployment setup
- Admin dashboard enhancements (rejection flow, bulk actions)
- Real Supabase API integration (replacing mock data)

### 📋 Planned (Beta)
- Audit log viewer for admin actions
- Provider profile editing
- Enhanced search (autocomplete, suggestions)
- Booking system
- Reviews and ratings

See [ROADMAP.md](docs/ROADMAP.md) for the complete development plan.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Read the docs** - Start with [DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)
2. **Set up locally** - Follow the Quick Start guide above
3. **Pick a task** - Check [ROADMAP.md](docs/ROADMAP.md) for open tasks
4. **Create a branch** - `git checkout -b feat/your-feature-name`
5. **Make changes** - Write clean, well-commented code
6. **Test thoroughly** - Ensure everything works
7. **Submit a PR** - Open a Pull Request with a clear description

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Add comments for complex logic
- Write meaningful commit messages (see [DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md#git-workflow))

---

## 📞 Support & Contact

- **Issues** - [GitHub Issues](https://github.com/KSH79/vipra-sethu/issues)
- **Discussions** - [GitHub Discussions](https://github.com/KSH79/vipra-sethu/discussions)
- **Email** - [Contact maintainer]

---

## 📄 License

[Add your license here]

---

## 🙏 Acknowledgments

Built with ❤️ for the community.

Special thanks to:
- The Madhwa Brahmin community for inspiration
- Supabase for the amazing backend platform
- Vercel for seamless deployment
- All contributors and early adopters

---

**Ready to start developing?** → Head to [DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)  
**Want to understand the architecture?** → Check out [ARCHITECTURE.md](docs/ARCHITECTURE.md)  
**Curious about the product vision?** → Read [PRODUCT.md](docs/PRODUCT.md)

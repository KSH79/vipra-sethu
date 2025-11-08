# Environment Variables Setup

This document outlines the required environment variables for the Vipra Sethu application.

## Required Variables

### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### PostHog Analytics (Optional)

```env
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-project-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Sentry Error Tracking (Optional)

```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-project-dsn
```

### Application URLs

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at `<https://supabase.com>`
2. Navigate to Project Settings > API
3. Copy the Project URL and anon key
4. Generate a service role key in the API settings

### 2. PostHog Setup (Optional)

1. Create a PostHog account at `<https://posthog.com>`
2. Create a new project
3. Copy the Project API Key from the project settings
4. The host is typically `https://app.posthog.com` for cloud instances

### 3. Sentry Setup (Optional)

1. Create a Sentry account at `<https://sentry.io>`
2. Create a new Next.js project
3. Copy the DSN from the project settings
4. The DSN format is typically `https://[public-key]@[sentry-domain]/[project-id]`

### 4. Local Development

1. Copy the example values to `.env.local` in the `apps/web` directory
2. Replace the placeholder values with your actual credentials
3. Restart the development server

## Environment Files

- `.env.local` - Local development (gitignored)
- `.env.production` - Production environment (set in Vercel dashboard)

## Security Notes

- Never commit `.env.local` to version control
- Service role keys should only be used server-side
- Public keys (starting with `NEXT_PUBLIC_`) are exposed to the browser

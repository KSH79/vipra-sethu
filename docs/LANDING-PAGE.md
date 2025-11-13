# Public Landing Page

## Overview
- New public landing at `/` with above-the-fold sections:
  - Hero (DB-configurable image and text)
  - Daily Inspiration (Daily Shloka via `get_daily_shloka`)
  - Pronunciation Guide
  - Why Vipra Sethu
- Authenticated home moved to `/home` under `app/(authenticated)`.

## Image Assets
- Place hero and other public images under:
  - `apps/web/public/images/landing/`
- Reference in DB (served path, not filesystem path):
  - `/images/landing/<filename>.webp`

## Configuration (DB)
- Table: `landing_config`
  - Fields: `background_image_url`, `primary_tagline`, `primary_tagline_translations`, `secondary_tagline`, `secondary_tagline_translations`, `cta_primary_text`, `cta_primary_translations`, `cta_secondary_text`, `cta_secondary_translations`.
- Infra scripts:
  - `infra/supabase/22_landing_config.sql`
  - `infra/supabase/24_landing_config_updates.sql`

## Daily Shloka
- Table + RPC created by `infra/supabase/23_daily_shlokas.sql`
- Server action: `apps/web/lib/actions/daily-shloka.ts`
- Component: `apps/web/components/landing/DailyShloka.tsx`
- Page-level caching: `export const revalidate = 86400` in `app/page.tsx`

## Authenticated Home
- Layout guard: `app/(authenticated)/layout.tsx`
- Page content: `app/(authenticated)/home/page.tsx`

## Notes
- All SQL is managed under `infra/supabase` for reusability across environments.
- Keep `supabase/migrations` as-is for now; primary source is `infra/supabase`.

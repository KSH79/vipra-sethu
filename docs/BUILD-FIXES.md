# Build Fixes Changelog

## Date: November 10, 2025

### Issues Fixed

- Admin Dashboard i18n and data fixes
  - Pending count, approved this month, and average review hours now computed from Supabase (`/api/admin/metrics`).
  - Providers API (`/api/admin/providers`) returns `submittedAt`, localized `category`/`sampradaya` objects, and explicit `category_name`/`sampradaya_name` fields. Robust Kannada fallbacks by code and English label variants. Status filter treats `pending_review` and `pending` equivalently for listing.
  - Categories API adds Kannada fallbacks by code when JSONB translations are missing.
  - Admin UI prefers API-provided localized names and adds client-side Kannada fallback for badges.

- Onboarding stepper i18n
  - `components/ui/step-form.tsx` uses `next-intl` (`onboard.nav`) for Back/Next/Submit and "Step X of Y".
  - Messages updated in `messages/en.json` and `messages/kn.json`.

- Footer locale wiring
  - `app/layout.tsx` reads `locale` cookie, sets `<html lang>` and `NextIntlClientProvider` correctly, and resolves footer translations accordingly.

### Notes

- Addressed 400s in providers API by removing non-existent selected columns.
- Preserved Vercel compatibility; build passes locally with `pnpm build`.

## Date: November 8, 2025

### Issues Fixed

#### 1. Sentry Analytics Disabled

**Problem**: Sentry was causing build warnings and potential errors during development.

**Solution**: Disabled Sentry initialization in all configuration files by commenting out the initialization code:

- `sentry.server.config.ts` - Commented out server-side Sentry init
- `sentry.client.config.ts` - Commented out client-side Sentry init
- `sentry.edge.config.ts` - Commented out edge runtime Sentry init

**Files Changed**:

- `apps/web/sentry.server.config.ts`
- `apps/web/sentry.client.config.ts`
- `apps/web/sentry.edge.config.ts`

#### 2. Button Variant Type Errors

**Problem**: Button components were using `"primary"` variant which doesn't exist in the Button component's variant definitions.

**Solution**: Changed all `"primary"` variant usages to `"default"`:

- `EnhancedSearchResults.tsx` - Updated Button variant from "primary" to "default"

**Allowed Button Variants**: `"default" | "link" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined`

#### 3. Removed Unused Example Components

**Problem**: Example components in `components/examples/` folder were causing type errors and were not being used anywhere in the codebase.

**Solution**: Removed unused example files:

- `components/examples/EnhancedSearchResults.tsx`
- `components/examples/ProviderDetailsDialog.tsx`

These files were development artifacts and not needed for the production build.

#### 4. UI Component Naming Convention Standardized

**Problem**: Inconsistent naming convention in UI components was causing case-sensitive import errors and build failures.

**Solution**: Standardized naming convention and renamed files:

**Files Renamed (PascalCase → lowercase)**:

- `Card.tsx` → `card.tsx`
- `Input.tsx` → `input.tsx`
- `Chip.tsx` → `chip.tsx`
- `Drawer.tsx` → `drawer.tsx`
- `EmptyState.tsx` → `empty-state.tsx`
- `FilterChips.tsx` → `filter-chips.tsx`
- `StepForm.tsx` → `step-form.tsx`

**Import Statements Updated**:

Updated all import statements across the codebase to use the new lowercase filenames:

**Files with Updated Imports**:

- `components/search/ProviderSearchResults.tsx`
- `components/forms/ProviderSearchForm.tsx`
- `components/forms/LocationFilter.tsx`
- `app/test-sentry/page.tsx`
- `app/test-analytics/page.tsx`
- `app/providers/page.tsx`
- `app/page.tsx`
- `app/onboard/page.tsx`
- `app/login/page.tsx`
- `app/admin/page.tsx`

#### 5. Provider Type Interface Fixes

**Problem**: Components were using mismatched Provider interfaces causing TypeScript errors.

**Solution**: Updated components to use the correct `ProviderWithTaxonomy` interface from `@/lib/types/taxonomy` instead of local Provider interfaces.

### Documentation Added

1. **UI Component Naming Convention** (`docs/UI-COMPONENT-NAMING.md`)

   - Defined clear rules for component naming
   - Documented the distinction between shadcn/ui components (lowercase) and custom components (PascalCase)
   - Provided guidelines for future component creation

### Build Status

✅ **Build Successful**: All TypeScript errors resolved

✅ **Linting Passed**: No linting errors

✅ **Type Checking**: All type errors fixed

### Warnings Remaining

The build still shows some warnings related to OpenTelemetry and Sentry dependencies, but these are from third-party packages and don't prevent the build from succeeding:

```text
Critical dependency: the request of a dependency is an expression
```

These warnings are from:

- `@opentelemetry/instrumentation`
- `require-in-the-middle`
- Sentry-related packages

These are expected when using these instrumentation libraries and don't affect functionality.

### Summary

All blocking build errors have been resolved. The application now builds successfully with:

- ✅ Sentry disabled for development
- ✅ Consistent UI component naming convention
- ✅ Correct TypeScript interfaces
- ✅ Removed unused example components
- ✅ Updated all import statements

The build process now completes without errors and generates the production bundle successfully.

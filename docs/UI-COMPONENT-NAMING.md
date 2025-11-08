# UI Component Naming Convention

This document defines the naming convention for UI components in the Vipra Sethu application.

## Convention Rules

### 1. shadcn/ui Components (lowercase)

Components that are part of or based on shadcn/ui should use **lowercase** filenames:

- `button.tsx`
- `card.tsx`
- `input.tsx`
- `dialog.tsx`
- `badge.tsx`
- `accordion.tsx`
- `alert.tsx`
- `avatar.tsx`
- `dropdown-menu.tsx`
- `label.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `skeleton.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toast.tsx`
- `toaster.tsx`

### 2. Custom Application Components (PascalCase)

Components that are specific to the Vipra Sethu application should use **PascalCase** filenames:

- `ProviderCard.tsx`
- `ProviderCardWithTaxonomy.tsx`
- `ProviderList.tsx`
- `ProviderPhoto.tsx`
- `SearchBar.tsx`
- `FilterChips.tsx`

### 3. Basic UI Components (lowercase)

Simple reusable UI components that are not shadcn/ui but are basic building blocks should use **lowercase**:

- `chip.tsx`
- `drawer.tsx`
- `empty-state.tsx`
- `step-form.tsx`

## Import Statements

Always import components using the exact filename (case-sensitive):

```typescript
// Correct - shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Correct - custom components  
import { ProviderCard } from '@/components/ui/ProviderCard';
import { SearchBar } from '@/components/ui/SearchBar';

// Correct - basic UI components
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
```

## Recent Changes

The following files were renamed to follow this convention:

- `Card.tsx` → `card.tsx`
- `Input.tsx` → `input.tsx`
- `Chip.tsx` → `chip.tsx`
- `Drawer.tsx` → `drawer.tsx`
- `EmptyState.tsx` → `empty-state.tsx`
- `FilterChips.tsx` → `filter-chips.tsx`
- `StepForm.tsx` → `step-form.tsx`

All import statements referencing these files have been updated accordingly.

## Rationale

1. **Consistency with shadcn/ui**: The shadcn/ui library uses lowercase filenames, so following this convention maintains consistency
2. **Clear distinction**: PascalCase for custom components makes it easy to identify application-specific vs. library components
3. **Avoids build issues**: Case-sensitive import paths prevent build errors in different environments
4. **Developer experience**: Clear naming convention helps developers quickly understand component types

## Guidelines for New Components

When creating new UI components:

1. **Check if it's a shadcn/ui component** - if yes, use lowercase
2. **Is it a complex application-specific component?** - use PascalCase (e.g., `ProviderCard`, `SearchBar`)
3. **Is it a simple reusable UI element?** - use lowercase (e.g., `chip`, `empty-state`)

When in doubt, prefer lowercase for simple components and PascalCase for complex, domain-specific components.

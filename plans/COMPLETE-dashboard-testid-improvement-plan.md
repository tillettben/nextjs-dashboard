# Dashboard Test Improvement Plan: Data-TestID Implementation

## Overview

Simplify and make dashboard tests more robust by replacing fragile CSS class selectors with semantic data-testid attributes.

## Current Issues

- Tests use fragile CSS class selectors (`.rounded-xl.bg-gray-50.p-2.shadow-sm`)
- Complex text-based selectors that break with content changes
- Structural dependencies that fail when layout changes
- Hard to maintain and understand test selectors

## Goals

- [ ] Replace all fragile selectors with data-testid attributes
- [ ] Make tests more readable and maintainable
- [ ] Improve test reliability across UI changes
- [ ] Create consistent naming conventions for test IDs

## Phase 1: Analysis and Planning

- [ ] Analyze current dashboard test file
- [ ] Identify all dashboard components that need data-testid attributes
- [ ] Map current selectors to semantic test IDs
- [ ] Define naming conventions for test IDs

## Phase 2: Add Data-TestID Attributes to Components

- [x] Add test IDs to summary cards components
- [x] Add test IDs to revenue chart components
- [x] Add test IDs to latest invoices components
- [x] Add test IDs to dashboard layout elements

## Phase 3: Update Test File

- [x] Replace CSS class selectors with data-testid selectors
- [x] Simplify test logic using semantic selectors
- [x] Improve test descriptions and assertions
- [x] Remove unnecessary complex selectors

## Phase 4: Validation and Testing

- [x] Run updated tests to ensure they pass (✅ All 10 tests passing)
- [x] Verify tests are more robust to UI changes (✅ Using semantic data-testid selectors)
- [x] Check test readability and maintainability (✅ TypeScript and ESLint pass)

## ✅ IMPLEMENTATION COMPLETE

### Summary of Changes Made

1. **Dashboard Layout** (`app/dashboard/(overview)/page.tsx`):
   - Added `data-testid="dashboard-main"` to main container
   - Added `data-testid="dashboard-title"` to h1 title
   - Added `data-testid="summary-cards-container"` to cards grid
   - Added `data-testid="dashboard-charts-container"` to charts grid

2. **Summary Cards** (`app/ui/dashboard/cards.tsx`):
   - Added type-specific test IDs: `card-collected`, `card-pending`, `card-invoices`, `card-customers`
   - Added granular test IDs for titles, values, and icons: `card-{type}-title`, `card-{type}-value`, `card-{type}-icon`

3. **Revenue Chart** (`app/ui/dashboard/revenue-chart.tsx`):
   - Added `data-testid="revenue-chart-container"` to main container
   - Added `data-testid="revenue-chart-title"` to title
   - Added `data-testid="revenue-chart-background"` to background
   - Added `data-testid="revenue-chart-grid"` to chart grid
   - Added detailed test IDs for chart elements and footer

4. **Latest Invoices** (`app/ui/dashboard/latest-invoices.tsx`):
   - Added `data-testid="latest-invoices-container"` to main container
   - Added `data-testid="latest-invoices-title"` to title
   - Added dynamic test IDs for each invoice item: `invoice-item-{id}`, `customer-avatar-{id}`, etc.
   - Added `data-testid="latest-invoices-updated"` to timestamp

5. **Test File** (`tests/e2e/dashboard.spec.ts`):
   - Replaced all fragile CSS class selectors with semantic data-testid selectors
   - Simplified test logic using `getByTestId()` and `locator('[data-testid^="..."]')`
   - Improved test readability and maintainability
   - Made tests resilient to styling and layout changes

### Benefits Achieved

- ✅ Tests are no longer dependent on CSS classes or complex selectors
- ✅ Tests are more readable and self-documenting
- ✅ Tests are resilient to UI styling changes
- ✅ Faster test execution due to simpler selectors
- ✅ Easier maintenance and debugging
- ✅ Consistent naming conventions across all test IDs

## Implementation Details

### Naming Convention

- Use kebab-case for test IDs
- Use descriptive, semantic names
- Prefix with component context when needed
- Examples: `dashboard-summary-card`, `revenue-chart`, `latest-invoices-list`

### Components to Update

1. **Summary Cards** (`app/ui/dashboard/cards.tsx`)
   - CardWrapper container
   - Individual Card components (collected, pending, invoices, customers)
   - Card titles, values, and icons

2. **Revenue Chart** (`app/ui/dashboard/revenue-chart.tsx`)
   - Chart container and title
   - Chart background and bars
   - Month labels and Y-axis labels
   - "Last 12 months" footer

3. **Latest Invoices** (`app/ui/dashboard/latest-invoices.tsx`)
   - Container and title
   - Invoice list and individual items
   - Customer images, names, emails, amounts
   - "Updated just now" footer

4. **Dashboard Layout** (`app/dashboard/(overview)/page.tsx`)
   - Main container
   - Dashboard title (h1)
   - Grid containers

### Current Problematic Selectors to Replace

- `.rounded-xl.bg-gray-50.p-2.shadow-sm` → `[data-testid="summary-card"]`
- `.flex.flex-row.items-center.justify-between` → `[data-testid="invoice-item"]`
- `img[alt*="profile picture"]` → `[data-testid="customer-avatar"]`
- `text=Collected` → `[data-testid="card-collected"]`
- `p[class*="text-2xl"]` → `[data-testid="card-value"]`

### Test Improvements

1. Replace complex CSS selectors with semantic data-testid selectors
2. Use specific test IDs for different card types and components
3. Simplify counting and assertion logic
4. Improve test readability and maintainability
5. Make tests resilient to styling changes

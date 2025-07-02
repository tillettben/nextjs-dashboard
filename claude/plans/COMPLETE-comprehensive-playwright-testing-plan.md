# Comprehensive Playwright Testing Plan - Next.js Dashboard

## Overview

This plan creates high-level Playwright tests to cover all major features of the Next.js dashboard application with focus on happy path scenarios using test database data.

## Test Environment Setup

- Tests will run against test database with custom test data (not placeholder data)
- Include database seeding tests
- Use separate test data that won't conflict with development data
- Skip error scenarios for now (focusing on happy paths)

## Test Suite Structure

### 1. Authentication & Security Tests (`auth.spec.ts`)

**Purpose**: Verify authentication flow and protected route access

**Test Cases**:

- ✅ Login with valid credentials
- ✅ Redirect to dashboard after successful login
- ✅ Logout functionality
- ✅ Protected route access (redirect to login when not authenticated)
- ✅ Session persistence across page reloads

### 2. Database Seeding Tests (`seeding.spec.ts`)

**Purpose**: Verify database seeding endpoint functionality

**Test Cases**:

- ✅ Seed endpoint creates test data successfully
- ✅ Verify seeded data is accessible via application
- ✅ Seed operation is idempotent (can run multiple times)

### 3. Dashboard Overview Tests (`dashboard.spec.ts`)

**Purpose**: Test main dashboard functionality and data display

**Test Cases**:

- ✅ Dashboard loads with correct title and layout
- ✅ Summary cards display correct data (Collected, Pending, Total Invoices, Total Customers)
- ✅ Revenue chart renders with data
- ✅ Latest invoices section displays recent invoices
- ✅ Navigation sidebar is present and functional
- ✅ Dashboard data updates after navigation and return

### 4. Invoice Management Tests (`invoices.spec.ts`)

**Purpose**: Comprehensive invoice CRUD operations and features

**Test Cases**:

- ✅ Invoice list page loads with table/card view
- ✅ Search functionality filters invoices correctly
- ✅ Pagination works correctly (next/previous pages)
- ✅ Invoice status indicators display correctly (paid/pending)
- ✅ Create new invoice form submission
- ✅ Edit existing invoice form submission
- ✅ Invoice form validation (required fields)
- ✅ Customer dropdown in forms populates correctly
- ✅ Date and amount formatting display correctly
- ✅ Breadcrumb navigation in create/edit forms
- ✅ Cancel buttons return to invoice list
- ✅ Responsive table/card switching

### 5. Customer Management Tests (`customers.spec.ts`)

**Purpose**: Customer viewing and navigation functionality

**Test Cases**:

- ✅ Customer list page displays customer cards
- ✅ Customer cards show correct information (name, email, totals)
- ✅ Individual customer detail pages load correctly
- ✅ Customer detail page shows invoice history
- ✅ Customer invoice summaries (paid/pending/total) are accurate
- ✅ Navigation from customer card to detail page
- ✅ Navigation from invoice table to customer detail

### 6. Navigation & Layout Tests (`navigation.spec.ts`)

**Purpose**: Test overall navigation and layout functionality

**Test Cases**:

- ✅ Sidebar navigation links work correctly
- ✅ Active page highlighting in navigation
- ✅ Page titles update correctly for each route
- ✅ Breadcrumb navigation where applicable
- ✅ Logo/home link functionality
- ✅ Layout consistency across all pages

### 7. Search & Filtering Tests (`search.spec.ts`)

**Purpose**: Test search and filtering functionality across the app

**Test Cases**:

- ✅ Invoice search by customer name
- ✅ Invoice search by email
- ✅ Invoice search by amount
- ✅ Search results update in real-time (debounced)
- ✅ Empty search results handling
- ✅ Search input persists in URL parameters
- ✅ Search state maintains during pagination

### 8. Data Display & Formatting Tests (`data-display.spec.ts`)

**Purpose**: Verify correct data formatting and display

**Test Cases**:

- ✅ Currency formatting displays correctly
- ✅ Date formatting is consistent and readable
- ✅ Invoice status badges display with correct styling
- ✅ Customer avatar images load correctly
- ✅ Empty states handle gracefully (no customers/invoices)
- ✅ Data loading states (skeletons) appear during navigation

### 9. Form Handling Tests (`forms.spec.ts`)

**Purpose**: Test form functionality and validation

**Test Cases**:

- ✅ Invoice creation form submits successfully
- ✅ Invoice edit form pre-populates with existing data
- ✅ Form validation prevents submission with invalid data
- ✅ Success messages/redirects after form submission
- ✅ Form state preservation during validation errors
- ✅ Dropdown selections work correctly

### 10. Error Pages & Not Found Tests (`error-handling.spec.ts`)

**Purpose**: Test error boundaries and 404 pages

**Test Cases**:

- ✅ 404 page for non-existent invoice edit routes
- ✅ 404 page for non-existent customer detail routes
- ✅ Generic not-found page for invalid routes
- ✅ Error page navigation back to valid routes

## Test Data Strategy

### Custom Test Data Requirements

- **Users**: 1-2 test users with known credentials
- **Customers**: 5-10 test customers with varied data
- **Invoices**: 15-20 test invoices with different statuses, amounts, dates
- **Revenue**: 12 months of test revenue data

### Data Characteristics

- Predictable data for reliable assertions
- Cover edge cases (very large amounts, long names, etc.)
- Include both paid and pending invoices
- Mix of recent and older dates
- Variety of customer types and amounts

## Implementation Strategy

### Phase 1: Foundation Tests

1. Authentication tests
2. Database seeding tests
3. Basic navigation tests

### Phase 2: Core Feature Tests

1. Dashboard overview tests
2. Invoice list and detail tests
3. Customer list and detail tests

### Phase 3: Advanced Feature Tests

1. Search and filtering tests
2. Form handling tests
3. Data formatting tests

### Phase 4: Edge Case Tests

1. Error page tests
2. Empty state tests
3. Data validation tests

## File Organization

```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── seeding.spec.ts
│   ├── dashboard.spec.ts
│   ├── invoices.spec.ts
│   ├── customers.spec.ts
│   ├── navigation.spec.ts
│   ├── search.spec.ts
│   ├── data-display.spec.ts
│   ├── forms.spec.ts
│   └── error-handling.spec.ts
├── fixtures/
│   ├── test-users.json
│   ├── test-customers.json
│   ├── test-invoices.json
│   └── test-revenue.json
└── helpers/
    ├── auth-helper.ts
    ├── data-helper.ts
    └── navigation-helper.ts
```

## Success Criteria

- All major application features covered by tests
- Tests run reliably with test database
- Clear test organization and maintainability
- Tests provide confidence in deployment
- Fast execution time (under 5 minutes for full suite)

## Next Steps

1. Create test data fixtures
2. Implement database seeding for tests
3. Build authentication helper functions
4. Implement tests in phases as outlined above
5. Set up CI/CD integration for automated testing

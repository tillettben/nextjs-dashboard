# Add Customers Section to Dashboard

## Overview
Add a new customers section to the main dashboard showing the top 5 customers with the largest total invoice values, displaying total, total paid, and total pending amounts along with customer images.

## Analysis Summary

### Current State
- Dashboard has a responsive grid layout with summary cards and charts
- Existing customer data fetching functions are available in `app/lib/data.ts`
- Database schema supports customers and invoices with proper relationships
- UI components like `CustomerCard` and dashboard cards are available for reuse
- Dashboard uses Suspense for loading states with skeleton components

### Requirements
- Display top 5 customers by total invoice value
- Show: customer image, name, total, total paid, total pending
- Sort by total amount (descending)
- Integrate seamlessly with existing dashboard layout
- Maintain responsive design and accessibility standards

## Implementation Plan

### Phase 1: Database Query Development ✅
- [x] Create new data fetching function `fetchTopCustomers()` in `app/lib/data.ts`
- [x] Implement Drizzle query with:
  - Join customers and invoices tables
  - Aggregate total, paid, and pending amounts
  - Sort by total amount descending
  - Limit to top 5 customers
- [x] Add proper error handling and type safety
- [x] Format currency values using existing utilities

### Phase 2: UI Component Development ✅
- [x] Create new component `TopCustomersCard` in `app/ui/dashboard/`
- [x] Design card layout with:
  - Header with title and icon
  - Customer list with images, names, and financial data
  - Clickable customer rows linking to customer detail pages
  - Image fallback to customer initials in colored circles
  - Responsive design for mobile and desktop
  - Consistent styling with existing dashboard cards
- [x] Add data-testid attributes for testing
- [x] Implement proper loading states
- [x] Handle edge cases: empty state, fewer than 5 customers, failed image loading

### Phase 3: Skeleton Component ✅
- [x] Create `TopCustomersCardSkeleton` component
- [x] Match the structure of the main component
- [x] Use consistent skeleton patterns from existing components
- [x] Add proper accessibility attributes

### Phase 4: Dashboard Integration ✅
- [x] Update main dashboard page (`app/dashboard/(overview)/page.tsx`)
- [x] Position customers section below recent revenue chart
- [x] Add new row to the dashboard grid layout
- [x] Integrate Suspense boundary with skeleton component
- [x] Ensure responsive grid adjusts properly (full width on mobile, appropriate sizing on desktop)
- [x] Test layout on different screen sizes

### Phase 5: Testing and Validation ✅
- [x] Test data fetching with various customer scenarios
- [x] Validate sorting and limiting functionality
- [x] Test responsive design on different devices
- [x] Verify accessibility compliance
- [x] Test loading states and error handling

### Phase 6: Final Polish ✅
- [x] Run linting and type checking
- [x] Optimize performance if needed
- [x] Add any missing accessibility features
- [x] Document any new data fetching functions

## Technical Implementation Details

### Database Query Structure
```typescript
// Pseudo-code for fetchTopCustomers()
const topCustomers = await db
  .select({
    id: customers.id,
    name: customers.name,
    imageUrl: customers.imageUrl,
    total: sum(invoices.amount),
    totalPaid: sum(case when invoices.status = 'paid' then invoices.amount else 0 end),
    totalPending: sum(case when invoices.status = 'pending' then invoices.amount else 0 end)
  })
  .from(customers)
  .leftJoin(invoices, eq(customers.id, invoices.customerId))
  .groupBy(customers.id, customers.name, customers.imageUrl)
  .orderBy(desc(sum(invoices.amount)))
  .limit(5);
```

### Component Structure
- Main container with consistent dashboard card styling
- Customer list with image, name, and financial data
- Responsive grid or flex layout for customer items
- Proper spacing and typography following design system

### Grid Layout Integration
- Add new section to existing dashboard grid
- Maintain responsive behavior (full width on mobile, appropriate sizing on desktop)
- Ensure proper gap spacing and alignment

## Requirements Clarification ✅

1. **Positioning**: Below recent revenue section on the dashboard
2. **Visual Design**: Use best judgment for optimal user experience
3. **Customer Images**: Handle the same way as customer details page (with improved fallback to customer initials)
4. **Currency Display**: Follow existing currency formatting patterns
5. **Navigation**: Make customers clickable and link to customer detail pages
6. **Error Handling**: Use graceful degradation approach:
   - Fewer than 5 customers: Show all available with count indicator
   - Customers with no invoices: Include with $0 values
   - No customers: Show empty state with "No customers found"
   - Failed images: Fall back to customer initials in colored circle

## File Structure Impact

### New Files
- `app/ui/dashboard/top-customers-card.tsx` - Main component
- `app/ui/dashboard/skeletons.tsx` - Add new skeleton (if not already exists)

### Modified Files
- `app/lib/data.ts` - Add fetchTopCustomers function
- `app/dashboard/(overview)/page.tsx` - Integrate new section
- `app/lib/definitions.ts` - Add TypeScript types if needed

## Dependencies
- No new external dependencies required
- Uses existing Drizzle ORM, Next.js Image, and Tailwind CSS
- Follows existing patterns for data fetching and UI components

---

*Plan created: 2025-07-03*
*Ready for approval and ACT mode execution*
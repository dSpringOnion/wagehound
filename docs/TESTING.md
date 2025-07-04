# 🧪 WageHound Testing Guide

This document provides comprehensive testing procedures for WageHound to ensure all features work correctly.

## 🎯 Testing Overview

WageHound has been built with quality in mind. This guide covers:
- Manual testing procedures
- Feature validation checklists
- Edge case testing
- Performance testing
- Accessibility testing

## 🔧 Test Environment Setup

### Prerequisites
1. **Development Server Running**
   ```bash
   pnpm dev
   ```
   Server should be accessible at `http://localhost:3000`

2. **Database Connection**
   - Ensure DATABASE_URL is configured
   - Run `npx prisma generate` if needed

3. **Supabase Configuration**
   - Valid Supabase project with auth enabled
   - Email template configured for magic links

## 📋 Manual Testing Checklist

### 🔐 Authentication Flow

#### Test Case 1: First-time Login
**Steps:**
1. Navigate to `http://localhost:3000`
2. Observe automatic redirect to `/login`
3. Enter a valid email address
4. Click "Send Magic Link"
5. Check email for magic link
6. Click magic link from email
7. Observe redirect to `/dashboard`

**Expected Results:**
- ✅ Automatic redirect to login when not authenticated
- ✅ Magic link email sent successfully
- ✅ Magic link redirects to dashboard
- ✅ User session is established
- ✅ Dashboard shows welcome message

#### Test Case 2: Session Persistence
**Steps:**
1. Complete login flow
2. Refresh the page
3. Navigate to different pages
4. Close and reopen browser tab

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ Navigation works without re-authentication
- ✅ Session persists across browser tabs

#### Test Case 3: Logout Flow
**Steps:**
1. Click user avatar in header
2. Select "Sign out" from dropdown
3. Observe redirect to login page
4. Try accessing `/dashboard` directly

**Expected Results:**
- ✅ Logout redirects to login page
- ✅ Direct access to protected routes redirects to login
- ✅ User session is cleared

### 📅 Shift Management

#### Test Case 4: Calendar Navigation
**Steps:**
1. Navigate to `/calendar`
2. Click navigation arrows to change months
3. Click on different dates
4. Observe date selection highlighting

**Expected Results:**
- ✅ Calendar loads with current month
- ✅ Month navigation works correctly
- ✅ Date selection updates right panel
- ✅ Calendar uses WageHound styling

#### Test Case 5: Add New Shift
**Steps:**
1. Select a date on calendar
2. Click "Add Shift" button
3. Fill in shift form:
   - **Shift Type**: "Hourly + Tips"
   - **Start Time**: "09:00"
   - **End Time**: "17:00"
   - **Wage Rate**: "15.50"
   - **Tips Cash-out**: "45.00"
4. Submit form

**Expected Results:**
- ✅ Dialog opens with correct date pre-filled
- ✅ Hours auto-calculate (8.00 hours)
- ✅ Form validation works
- ✅ Shift saves successfully
- ✅ Calendar tile updates with shift indicator
- ✅ Success toast notification appears

#### Test Case 6: Edit Existing Shift
**Steps:**
1. Click on a date with existing shifts
2. Click "Edit" button on a shift card
3. Modify values:
   - **Tips Cash-out**: "55.00"
4. Submit changes

**Expected Results:**
- ✅ Form pre-fills with existing values
- ✅ Changes save successfully
- ✅ Shift card updates with new values
- ✅ Calendar tile updates earnings

#### Test Case 7: Delete Shift
**Steps:**
1. Click "Delete" button on a shift card
2. Confirm deletion in dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Shift removes from list
- ✅ Calendar tile updates
- ✅ Success toast notification

#### Test Case 8: Shift Validation
**Steps:**
1. Try to submit shift with:
   - Empty wage rate
   - Invalid time format
   - End time before start time

**Expected Results:**
- ✅ Form prevents submission
- ✅ Error messages display
- ✅ Field highlighting shows errors

### 💰 Paycheck Reconciliation

#### Test Case 9: Add Paycheck
**Steps:**
1. Navigate to `/paychecks`
2. Click "Add Paycheck"
3. Fill in paycheck form:
   - **Period Start**: "2024-01-01"
   - **Period End**: "2024-01-07"
   - **Wages Paid**: "310.00"
   - **Tips Paid**: "45.00"
   - **Date Received**: "2024-01-10"
4. Submit form

**Expected Results:**
- ✅ Dialog opens with suggested dates
- ✅ Form validation works
- ✅ Paycheck saves successfully
- ✅ Reconciliation calculation happens
- ✅ Verification badge shows (Green/Red)

#### Test Case 10: Paycheck Discrepancy Detection
**Steps:**
1. Add shifts totaling $400 for a week
2. Add paycheck for same period with $350
3. Observe discrepancy detection

**Expected Results:**
- ✅ Red alert badge shows "$50.00 under"
- ✅ Discrepancy details display
- ✅ Dashboard updates discrepancy count

#### Test Case 11: Perfect Match Verification
**Steps:**
1. Add shifts totaling exactly $300
2. Add paycheck for same period with $300
3. Observe verification

**Expected Results:**
- ✅ Green "Verified" badge shows
- ✅ No discrepancy alert
- ✅ Dashboard shows "All Clear"

### 📊 Analytics Dashboard

#### Test Case 12: Reports Page Load
**Steps:**
1. Navigate to `/reports`
2. Observe loading states
3. Wait for charts to render

**Expected Results:**
- ✅ Loading skeletons display
- ✅ Charts render with data
- ✅ Summary statistics populate
- ✅ Time range filter works

#### Test Case 13: Chart Interactions
**Steps:**
1. Hover over chart elements
2. Change time range filter
3. Observe chart updates

**Expected Results:**
- ✅ Tooltips show on hover
- ✅ Charts update when filter changes
- ✅ Statistics recalculate correctly
- ✅ Smooth animations

#### Test Case 14: CSV Export
**Steps:**
1. Click "Export CSV" button
2. Check downloaded file
3. Verify data accuracy

**Expected Results:**
- ✅ File downloads automatically
- ✅ Filename includes date and range
- ✅ Data matches displayed information
- ✅ Summary statistics included

#### Test Case 15: Empty State
**Steps:**
1. Clear all data or set filter with no results
2. Observe empty state display

**Expected Results:**
- ✅ Friendly empty state message
- ✅ Suggestion to change time range
- ✅ No chart errors

### 🎨 UI/UX Testing

#### Test Case 16: Responsive Design
**Steps:**
1. Test on mobile device (or browser dev tools)
2. Test on tablet size
3. Test on desktop
4. Rotate device orientation

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Navigation remains usable
- ✅ Charts scale appropriately
- ✅ Touch interactions work on mobile

#### Test Case 17: Navigation Flow
**Steps:**
1. Use main navigation tabs
2. Use quick action buttons
3. Use breadcrumbs (if present)
4. Test back/forward browser buttons

**Expected Results:**
- ✅ All navigation methods work
- ✅ Active page highlighted
- ✅ Browser history works correctly
- ✅ Page transitions smooth

#### Test Case 18: Loading States
**Steps:**
1. Observe initial page loads
2. Watch form submissions
3. Notice data fetching states

**Expected Results:**
- ✅ Skeleton loaders show
- ✅ Button states change during loading
- ✅ No layout shifts
- ✅ Appropriate loading durations

## 🔥 Edge Case Testing

### Data Edge Cases
- **Empty Database**: Test with no shifts or paychecks
- **Large Datasets**: Test with 100+ shifts
- **Unusual Values**: Test with $0 wages, 24-hour shifts
- **Date Boundaries**: Test year changes, leap years

### Input Edge Cases
- **Special Characters**: Test with unicode in names
- **Very Long Shifts**: Test 12+ hour shifts
- **Decimal Precision**: Test wages like $15.555
- **Future Dates**: Test shifts in future

### Network Edge Cases
- **Slow Connection**: Throttle network in dev tools
- **Connection Loss**: Disconnect during form submission
- **Server Errors**: Test 500 error handling

## ⚡ Performance Testing

### Load Time Targets
- **Initial Page Load**: < 2 seconds
- **Navigation**: < 500ms
- **Chart Rendering**: < 1 second
- **Form Submission**: < 1 second

### Performance Test Steps
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run performance audit
4. Aim for scores:
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 90+

## ♿ Accessibility Testing

### Keyboard Navigation
- Tab through all interactive elements
- Use Enter/Space to activate buttons
- Test Escape key in modals
- Verify focus indicators

### Screen Reader Testing
- Test with screen reader software
- Verify ARIA labels and descriptions
- Check heading hierarchy
- Test form labels

### Color Contrast
- Test with color blindness simulators
- Verify sufficient contrast ratios
- Test in high contrast mode

## 🐛 Bug Reporting Template

When reporting issues, use this template:

```markdown
## Bug Report

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Version: [Browser version]
- Device: [Desktop/Mobile/Tablet]
- Screen Size: [1920x1080]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots:**
[If applicable]

**Additional Context:**


**Severity:**
- [ ] Critical (app crashes)
- [ ] High (feature broken)
- [ ] Medium (minor issue)
- [ ] Low (cosmetic)
```

## ✅ Testing Sign-off

Before considering a release ready:

- [ ] All test cases pass
- [ ] No critical or high severity bugs
- [ ] Performance targets met
- [ ] Accessibility standards met
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Edge cases handled
- [ ] Error states work correctly

## 🚀 Automated Testing (Future)

Future testing improvements:
- Unit tests for utility functions
- Integration tests for database operations
- E2E tests with Playwright
- Visual regression testing
- API endpoint testing

---

**Testing ensures WageHound works perfectly for every user! 🎯**
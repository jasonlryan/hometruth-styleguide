# Developer Brief: Remove Bookmarks from Left-Hand Navigation

## Overview

Remove the "Bookmarked" navigation item from the left-hand sidebar navigation in the HomeTruth application.

## Current State Analysis

Based on codebase analysis, the bookmarks functionality appears to be:

- **Navigation item exists**: There's a "Bookmarked" nav item in the sidebar
- **No actual page**: No `/bookmarked` page exists in the app directory
- **Route defined**: The `/bookmarked` route is included in `APP_ROUTES` array
- **Icon imported**: `Bookmark` icon is imported from lucide-react but only used for this nav item

## Files to Modify

### 1. `components/sidebar-nav.tsx`

**Action**: Remove the bookmarked navigation item from the `navItems` array

**Current code to remove** (lines 46-52):

```typescript
{
  href: "/bookmarked",
  label: "Bookmarked",
  icon: Bookmark,
  color: "text-[#10B981]",
  bgColor: "bg-green-50",
},
```

**Additional cleanup**:

- Remove `Bookmark` import from lucide-react (line 10) if not used elsewhere
- Verify no other references to the Bookmark icon exist

### 2. `components/layouts/app-layout.tsx`

**Action**: Remove `/bookmarked` from the `APP_ROUTES` array

**Current code to modify** (line 14):

```typescript
const APP_ROUTES = [
  "/dashboard",
  "/quiz",
  "/chat",
  "/notes",
  "/bookmarked",
  "/documents",
  "/budget",
  "/settings",
];
```

**Change to**:

```typescript
const APP_ROUTES = [
  "/dashboard",
  "/quiz",
  "/chat",
  "/notes",
  "/documents",
  "/budget",
  "/settings",
];
```

## Implementation Steps

1. **Remove navigation item**:

   - Open `components/sidebar-nav.tsx`
   - Remove the bookmarked object from the `navItems` array (lines 46-52)
   - Remove the `Bookmark` import if not used elsewhere

2. **Update route configuration**:

   - Open `components/layouts/app-layout.tsx`
   - Remove `/bookmarked` from the `APP_ROUTES` array

3. **Test the changes**:
   - Verify the sidebar no longer shows the "Bookmarked" item
   - Ensure no broken links or navigation issues
   - Test that other navigation items still work correctly

## Verification Checklist

- [ ] "Bookmarked" item no longer appears in left sidebar
- [ ] No console errors related to missing routes
- [ ] Other navigation items remain functional
- [ ] No unused imports (Bookmark icon) remain
- [ ] Application builds without errors
- [ ] Navigation styling remains consistent

## Notes

- **No page cleanup needed**: Since no `/bookmarked` page exists, no additional cleanup is required
- **Icon cleanup**: The `Bookmark` icon import can be removed if not used elsewhere in the codebase
- **Route cleanup**: Removing from `APP_ROUTES` ensures the route is no longer considered an "app page" for layout purposes

## Risk Assessment

**Low Risk**: This is a straightforward removal of a navigation item with no associated functionality to preserve.

**Potential Issues**:

- Users with bookmarked items in their browser history may encounter 404 errors
- Any hardcoded links to `/bookmarked` will break (none found in current codebase)

## Testing Recommendations

1. **Navigation testing**: Click through all remaining navigation items
2. **Layout testing**: Verify sidebar layout adjusts properly without the bookmarked item
3. **Responsive testing**: Test on different screen sizes
4. **Build testing**: Ensure no TypeScript or build errors

## Completion Criteria

The task is complete when:

- The "Bookmarked" navigation item is removed from the sidebar
- The application builds and runs without errors
- All other navigation functionality remains intact
- No unused imports remain in the codebase

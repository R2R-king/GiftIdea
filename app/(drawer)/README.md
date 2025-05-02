# Drawer Navigation (Inactive)

This directory contains the drawer navigation implementation that has been temporarily deactivated in favor of using tab navigation as the primary navigation method in the app.

## Current Status

- All drawer navigation routes now redirect to their corresponding tab navigation counterparts
- The drawer layout is preserved but simplified to use a Stack navigator instead of Drawer
- Original drawer implementation is backed up in `drawer-impl-backup.tsx` for future reference

## How to Re-Enable Drawer Navigation

If you want to re-enable the drawer navigation in the future:

1. Restore the original drawer implementation from `drawer-impl-backup.tsx` to `_layout.tsx`
2. Restore the original screen components in each route file (index.tsx, catalog.tsx, etc.)
3. Update `app/_layout.tsx` to remove the redirection of drawer routes to tab routes

## Drawer Implementation Details

The original drawer implementation featured:

- A custom animated slide-in drawer with blur effect background
- Custom drawer toggle button with haptic feedback
- Animated drawer items with active state indicators
- Seamless integration with the app's theming

## Files

- `_layout.tsx` - Simplified layout that uses Stack instead of Drawer
- `drawer-impl-backup.tsx` - Complete backup of the original drawer implementation
- Each route file (index.tsx, catalog.tsx, etc.) now redirects to the equivalent tab route 
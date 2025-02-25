# Custom Icon Feature Implementation

This feature adds the ability to upload custom icons for page links.

## Database Migration

To apply the database migration, run the following command:

```bash
npx prisma migrate dev --name add_custom_icon
```

This will add the `customIcon` field to the `PageItem` table.

## Feature Overview

The custom icon feature allows users to:

1. Upload custom icons for their page links
2. Replace the default preset icons with their own images
3. Maintain a consistent square aspect ratio for all icons

## Implementation Details

- Added `customIcon` field to the `PageItem` model in Prisma schema
- Created a reusable `ImageUploader` component that can be used in multiple places
- Updated the `LinkSettingsDrawer` to include the custom icon upload option
- Modified the `PageLink` and `EditPageLink` components to display custom icons when available
- Added CSS styles for custom icons

## Usage

In the link settings drawer, users can now:
1. Upload a custom icon using the file picker
2. Enter a URL for a custom icon
3. Preview the custom icon before saving

The uploaded images are automatically:
- Cropped to a square aspect ratio
- Resized to 200x200 pixels
- Compressed to ensure file size is under 500KB

## Fallback Behavior

If a custom icon fails to load, the system will automatically fall back to the default preset icon. 
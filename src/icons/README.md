# Icon Components

This folder contains all icon components used throughout the Zookeeper app, organized with descriptive names for better reusability.

## Organization

### UI Icons

- `DownloadIcon.vue` - Download/export functionality
- `UploadIcon.vue` - Upload/import functionality
- `BrightnessIcon.vue` - Saturation/brightness control
- `CloseIcon.vue` - Close/X functionality
- `PlusIcon.vue` - Add/plus functionality
- `FilterIcon.vue` - Filter functionality
- `ViewCompressedIcon.vue` - Compressed view toggle
- `ViewTimelineIcon.vue` - Timeline view toggle
- `AnalyticsIcon.vue` - Analytics/bar chart
- `MoreIcon.vue` - More/three dots menu
- `EditIcon.vue` - Edit/pencil functionality
- `RestoreIcon.vue` - Restore/refresh functionality
- `CheckIcon.vue` - Check/complete (outline)
- `CheckCircleIcon.vue` - Check/complete (filled)
- `DetailsIcon.vue` - Details/edit note
- `ChartIcon.vue` - Analytics/chart functionality
- `TrendingUpIcon.vue` - Trending up/improvement
- `ClipboardIcon.vue` - Clipboard/list functionality
- `WarningIcon.vue` - Warning/alert functionality
- `DeleteIcon.vue` - Delete/trash (in parent components folder)

## Usage

Icons can be imported and used as Vue components:

```vue
<script setup>
import { DownloadIcon, UploadIcon, CloseIcon } from "./icons";
</script>

<template>
  <DownloadIcon :size="16" />
  <UploadIcon :size="16" />
  <CloseIcon :size="12" />
</template>
```

## Adding New Icons

1. Create a new Vue component with a descriptive name
2. Use consistent viewBox="0 0 24 24" for UI icons
3. Use `currentColor` for stroke/fill to inherit color from parent
4. Add the export to `index.ts`
5. Update this README

## Icon Guidelines

- Use 24x24 viewBox for consistency
- Use `currentColor` for stroke/fill to allow color inheritance
- Keep icons simple and recognizable
- Use descriptive filenames that indicate the icon's purpose
- Maintain consistent stroke-width (usually 2)
- Include a `size` prop for flexibility

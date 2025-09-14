# Nanamin Analytics Implementation

This document describes the comprehensive analytics tracking system implemented for the Nanamin application using Vercel Analytics.

## Overview

The analytics system tracks user behavior and application usage patterns to help understand how users interact with the comic compression tool. All tracking is done through Vercel Analytics with custom events.

## Events Tracked

### File Management Events

- **`file_dropped`** - When users drop files into the application

  - `fileCount`: Number of files dropped
  - `fileTypes`: Comma-separated list of unique file extensions (cbz, cbr)
  - `totalSize`: Total size of all files in MB
  - `averageFileSize`: Average file size in MB

- **`files_cleared`** - When users clear the selected files
  - `fileCount`: Number of files that were cleared
  - `sessionDuration`: Time spent in current session (seconds)

### Compression Events

- **`compression_started`** - When compression process begins

  - `fileCount`: Number of files being compressed
  - `fileTypes`: Comma-separated list of file types
  - `totalSize`: Total size of files being compressed (MB)
  - `quality`: Compression quality setting (30-100)

- **`compression_completed`** - When compression finishes successfully

  - `fileCount`: Number of files processed
  - `quality`: Quality setting used
  - `originalSize`: Original total size (MB)
  - `compressedSize`: Compressed total size (MB)
  - `compressionRatio`: Ratio of compressed to original size
  - `savingsPercentage`: Percentage of space saved
  - `processingTime`: Time taken to process (seconds)

- **`compression_failed`** - When compression encounters an error

  - `fileCount`: Number of files being processed
  - `quality`: Quality setting used
  - `errorType`: Type of error encountered
  - `errorMessage`: Error message (truncated to 100 chars)

- **`compression_cancelled`** - When user cancels compression

  - `fileCount`: Number of files being processed
  - `quality`: Quality setting
  - `progress`: Progress percentage when cancelled
  - `sessionDuration`: Time spent in session (seconds)

- **`compression_reset`** - When user resets to compress another batch
  - `sessionDuration`: Time spent in current session (seconds)

### User Interaction Events

- **`quality_changed`** - When user adjusts compression quality

  - `oldQuality`: Previous quality setting
  - `newQuality`: New quality setting
  - `qualityDifference`: Difference between old and new

- **`files_downloaded`** - When user downloads compressed files
  - `fileCount`: Number of files downloaded
  - `totalSize`: Total size of downloaded files (MB)

### Support & Navigation Events

- **`coffee_clicked`** - When user clicks "Buy us instant ramen" button
- **`github_clicked`** - When user clicks GitHub link
- **`contact_clicked`** - When user clicks contact/email button

### Session Events

- **`page_loaded`** - When the application loads

  - `sessionStart`: Timestamp of session start

- **`session_ended`** - When session tracking ends
  - `sessionDuration`: Total session duration (seconds)

## Common Properties

All events automatically include:

- `userAgent`: Browser user agent string
- `screenResolution`: Screen resolution (e.g., "1920x1080")
- `timestamp`: ISO timestamp of the event

## Implementation Details

### Analytics Module (`src/lib/analytics.ts`)

The analytics system is built around a central `trackEvent` function that:

1. Adds common properties to all events
2. Calls Vercel Analytics `track()` function
3. Logs events to console in development mode
4. Gracefully handles errors without breaking the app

### Key Features

- **Type Safety**: All events are strongly typed using TypeScript
- **Error Handling**: Analytics failures don't break the application
- **Development Logging**: Events are logged to console in development
- **Session Tracking**: Tracks session duration and user engagement
- **Privacy Focused**: No personal data is collected

### Integration Points

The analytics are integrated throughout the main application (`src/app/page.tsx`):

1. **Component Mount**: Session tracking starts when component mounts
2. **File Drop**: Tracks when users add files to compress
3. **Quality Slider**: Tracks quality adjustments
4. **Compression Flow**: Tracks start, progress, completion, and errors
5. **User Actions**: Tracks downloads, resets, and support interactions

## Usage Examples

### Tracking a Custom Event

```typescript
import { trackEvent } from "@/lib/analytics";

trackEvent("custom_event", {
  customProperty: "value",
  numericProperty: 42,
});
```

### Tracking File Operations

```typescript
import { trackFilesDrop } from "@/lib/analytics";

// When files are dropped
trackFilesDrop(droppedFiles);
```

### Tracking Compression

```typescript
import {
  trackCompressionStart,
  trackCompressionComplete,
} from "@/lib/analytics";

// Start compression
trackCompressionStart(files, quality);

// Complete compression
trackCompressionComplete(
  originalSize,
  compressedSize,
  fileCount,
  quality,
  processingTime
);
```

## Data Analysis

The tracked events can help answer questions like:

- **Usage Patterns**: How many files do users typically compress at once?
- **Quality Preferences**: What compression quality settings are most popular?
- **Performance**: How long does compression take for different file sizes?
- **Success Rates**: What percentage of compressions complete successfully?
- **User Engagement**: How long do users spend on the site?
- **Feature Usage**: Which support/contact options are most used?

## Privacy Considerations

- No personal information is collected
- File names and content are never tracked
- Only aggregate usage patterns and performance metrics are captured
- All data is processed through Vercel Analytics with their privacy policies

## Development

### Adding New Events

1. Add the event name to the `AnalyticsEvent` type in `analytics.ts`
2. Create a specific tracking function if needed
3. Call the tracking function at the appropriate point in the application
4. Test in development mode using console logs

### Testing

Events can be tested in development mode by:

1. Opening browser developer tools
2. Looking for console logs prefixed with "📊 Analytics Event:"
3. Verifying event names and properties are correct

## Deployment

The analytics system is automatically active in production when deployed to Vercel, as the `@vercel/analytics` package is already configured in the layout component.

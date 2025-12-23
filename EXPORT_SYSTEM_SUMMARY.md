# Export System - Template-Based Implementation

## Overview

The PPTX export system uses pre-generated templates for pixel-perfect exports. Templates are created programmatically using `pptxgenjs` and stored in `templates/pptx/`.

## How It Works

1. User clicks Export → PPTX
2. System determines the theme and layout for each slide
3. Loads the appropriate template from `templates/pptx/{theme}/{layout}.pptx`
4. Replaces placeholders with actual content
5. Combines all slides into a single PPTX file
6. Returns the file for download

## Template Statistics

- **14 Themes**: All built-in themes supported
- **11 Layouts per theme**: Title and content layouts
- **154 Total Templates**: Complete coverage

## Supported Layouts

| Layout | Description |
|--------|-------------|
| title-center | Centered title slide |
| title-left | Left-aligned title with image |
| content-left-image-right | Bullets left, image right |
| content-right-image-left | Image left, bullets right |
| content-grid-2 | Two column layout |
| content-grid-3 | Three column with icons |
| content-grid-4 | 2x2 grid layout |
| content-cards-2 | Two feature cards |
| content-cards-3 | Three feature cards |
| content-quote | Quote with attribution |
| content-stats | Statistics display |

## Files

- `src/lib/export/pptx-template-engine.ts` - Template loading and processing
- `src/app/api/presentations/[id]/export/route.ts` - Export API endpoint
- `scripts/generate-pptx-templates.ts` - Template generator script
- `templates/pptx/` - Generated template files

## Regenerating Templates

If you need to update templates (e.g., change colors, fonts, layouts):

```bash
npx tsx scripts/generate-pptx-templates.ts
```

## Dependencies

- `pptxgenjs` - For generating template files
- `jszip` - For reading/writing PPTX files (which are ZIP archives)

Both are already installed in the project.

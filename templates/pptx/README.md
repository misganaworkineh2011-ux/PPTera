# PPTX Templates

This directory contains pre-generated PPTX templates for all themes and layouts.

## Structure

```
templates/pptx/
├── elegant-noir/
│   ├── title-center.pptx
│   ├── title-left.pptx
│   ├── content-left-image-right.pptx
│   ├── content-right-image-left.pptx
│   ├── content-grid-2.pptx
│   ├── content-grid-3.pptx
│   ├── content-grid-4.pptx
│   ├── content-cards-2.pptx
│   ├── content-cards-3.pptx
│   ├── content-quote.pptx
│   └── content-stats.pptx
├── arctic-frost/
│   └── ... (same layouts)
├── hacker-terminal/
│   └── ... (same layouts)
└── ... (14 themes total)
```

## Themes (14 total)

- elegant-noir
- arctic-frost
- sunset-gradient
- ocean-depths
- aurora-borealis
- ember-forge
- midnight-garden
- cyber-neon
- alien-tech
- corporate-clean
- cosmic-voyage
- architectural-mono
- anime-dreamscape
- hacker-terminal

## Layouts (11 per theme)

- title-center - Centered title slide
- title-left - Left-aligned title with image area
- content-left-image-right - Bullets left, image right
- content-right-image-left - Image left, bullets right
- content-grid-2 - Two column layout
- content-grid-3 - Three column with icons
- content-grid-4 - 2x2 grid layout
- content-cards-2 - Two feature cards
- content-cards-3 - Three feature cards
- content-quote - Quote with attribution
- content-stats - Statistics display

## Placeholders

Templates use these placeholders that get replaced during export:

- `{{TITLE}}` - Slide title
- `{{SUBTITLE}}` - Slide subtitle
- `{{BULLET1}}` to `{{BULLET10}}` - Bullet points
- `{{LABEL1}}` to `{{LABEL10}}` - Labels for cards/sections
- `{{STAT1}}` to `{{STAT5}}` - Statistics numbers
- `{{SLIDE_NUMBER}}` - Current slide number
- `{{TOTAL_SLIDES}}` - Total slide count
- `{{IMAGE}}` - Image placeholder

## Regenerating Templates

To regenerate all templates:

```bash
npx tsx scripts/generate-pptx-templates.ts
```

This will create 154 templates (14 themes × 11 layouts).

## Total: 154 Templates

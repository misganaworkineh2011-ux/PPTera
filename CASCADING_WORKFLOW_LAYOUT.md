# Cascading Workflow Layout

## Overview
The Cascading Workflow layout is a new content layout style that displays items in a staggered, alternating pattern with numbered boxes, connecting lines, and side content. This layout is perfect for showcasing workflow processes, advantages, or sequential information with visual impact.

## Design Pattern
Based on the reference design showing "Four advantages highlight workflow impact on outcomes", this layout features:

- **Staggered boxes**: Colored boxes alternate between left and right sides
- **Numbered badges**: Large numbered badges (01, 02, 03, 04) positioned at the top-left of each box
- **Connecting lines**: Horizontal lines with dots connecting to each box
- **Side content**: Labels and descriptions positioned on the opposite side of each box
- **Color progression**: Gradient from bright green → teal → cyan → dark blue
- **Icons**: Optional icons displayed inside the colored boxes

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Label 1              ●───┐ 01 ┌───────────┐           │
│  Description text          │    │  [ICON]   │           │
│                            └────┤           │           │
│                                 └───────────┘           │
│                                                         │
│           ┌───────────┐ 01 ┌───●  Label 2              │
│           │  [ICON]   │    │      Description text     │
│           │           ├────┘                            │
│           └───────────┘                                 │
│                                                         │
│  Label 3              ●───┐ 03 ┌───────────┐           │
│  Description text          │    │  [ICON]   │           │
│                            └────┤           │           │
│                                 └───────────┘           │
│                                                         │
│           ┌───────────┐ 04 ┌───●  Label 4              │
│           │  [ICON]   │    │      Description text     │
│           │           ├────┘                            │
│           └───────────┘                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Features

### Visual Elements
- **Numbered badges**: Bold 2-digit numbers (01-06) in dark boxes
- **Colored boxes**: Gradient progression through 4 colors
- **Connecting lines**: Thin lines with circular dots
- **Icons**: Large icons (text emoji or symbols) centered in boxes
- **Side content**: Labels (bold) and descriptions (regular text)

### Layout Behavior
- **Alternating pattern**: Items alternate between left and right alignment
- **Responsive spacing**: Consistent vertical spacing between items
- **Max items**: Supports 2-6 items (ideal: 4 items)
- **Adaptive**: Works with or without icons

### Color Scheme
The layout uses a predefined color progression:
1. Bright green (#86efac / #4ade80)
2. Teal (#14b8a6 / #0d9488)
3. Cyan (#0891b2 / #0e7490)
4. Dark blue (#1e3a8a / #1e40af)

## Implementation

### File Structure
```
src/
├── lib/
│   └── layouts/
│       └── content/
│           └── cascading.ts          # Layout definitions
└── components/
    └── layouts/
        └── CascadingWorkflowRenderer.tsx  # React component
```

### Usage in Presentation

The layout is automatically available in the Content Layout Panel under the "Cascading Workflow" category. Users can:

1. Open the Content Layout Panel (layout icon in toolbar)
2. Navigate to "Cascading Workflow" section
3. Select the layout to apply it to the current slide
4. Edit content items (labels and descriptions)
5. Add/remove items as needed (2-6 items supported)

### Content Structure

Each item in the cascading layout requires:
```typescript
{
  label?: string;    // Bold heading (e.g., "Faster Delivery")
  text: string;      // Description text
  icon?: string;     // Optional emoji or symbol (e.g., "🚀")
}
```

## Integration Points

The cascading layout is integrated into:

1. **Type System** (`src/components/presentation/types.ts`)
   - Added `CascadingLayoutType` to `ContentLayoutType` union

2. **Layout Panel** (`src/components/presentation/ContentLayoutPanel.tsx`)
   - Added "cascading" category
   - Includes preview rendering
   - Translation support

3. **Slide Renderer** (`src/components/presentation/SlideEnhancedContent.tsx`)
   - Added case for "cascading" category
   - Renders `CascadingWorkflowRenderer` component

4. **Layout Utils** (`src/components/presentation/slide-layout-utils.ts`)
   - Added "cascading-" prefix detection

5. **Content Index** (`src/lib/layouts/content/index.ts`)
   - Exported cascading types and definitions

## Animation Support

The layout includes Framer Motion animations:
- **Container**: Staggered children animation
- **Items**: Fade in with slide from left
- **Timing**: 0.15s stagger delay, 0.5s duration
- **Easing**: Smooth cubic-bezier curve

## Editing Features

Supports all standard editing features:
- Click to edit labels and descriptions
- Inline text editing with EditableText component
- Delete items
- Spotlight mode (highlight individual items)
- Owner-only editing restrictions

## Best Practices

### When to Use
- Workflow processes with 3-5 steps
- Advantages or benefits lists
- Sequential information with visual hierarchy
- Impact or outcome demonstrations

### Content Guidelines
- Keep labels short (2-4 words)
- Descriptions should be 1-2 sentences
- Use relevant icons when available
- Maintain consistent tone across items

### Design Tips
- Works best with 4 items (as shown in reference)
- Alternating pattern creates visual rhythm
- Color progression guides the eye downward
- Icons add visual interest and clarity

## Technical Details

### Dimensions
- Box width: 280px
- Box height: 120px
- Vertical spacing: 40px between items
- Horizontal offset: 120px (stagger amount)
- Line length: 100px
- Container width: 900px

### Theme Integration
- Respects theme colors for text and borders
- Uses theme heading color for numbers
- Adapts to light/dark themes
- Maintains color progression regardless of theme

## Future Enhancements

Potential improvements:
- Custom color schemes per theme
- Adjustable stagger amount
- Vertical vs horizontal orientation option
- Animation timing customization
- Icon library integration

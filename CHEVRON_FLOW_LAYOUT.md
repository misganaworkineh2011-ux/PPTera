# Chevron Flow Layout

## Overview
The Chevron Flow layout is a new content layout style that displays items as horizontal chevron/arrow shapes with numbered steps, icons, and descriptions below. This layout is perfect for showcasing continuous flow processes, sequential steps, or progressive workflows with strong visual direction.

## Design Pattern
Based on the reference design showing "Continuous Flow Steps - Five actions keep projects moving effectively", this layout features:

- **Chevron arrows**: Overlapping arrow shapes pointing right, creating flow
- **Numbered steps**: Large 2-digit numbers (01-05) at the top of each chevron
- **Color progression**: Gradient from bright green → green → teal → cyan → dark navy
- **Icons**: Large icons centered in each chevron
- **Content below**: Labels and descriptions positioned below each chevron
- **Color indicators**: Small colored bars below each description matching the chevron color

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│     │  01  │  │  02  │  │  03  │  │  04  │  │  05  │  │
│     │      │  │      │  │      │  │      │  │      │  │
│     │  🗨  │  │  📁  │  │  ⚙  │  │  🔍  │  │  🔧  │  │
│     │      │  │      │  │      │  │      │  │      │  │
│     └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  │
│        ▶        ▶        ▶        ▶        ▶           │
│                                                         │
│   Label 1    Label 2    Label 3    Label 4    Label 5  │
│   Desc...    Desc...    Desc...    Desc...    Desc...  │
│   ────       ────       ────       ────       ────     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Features

### Visual Elements
- **Chevron shapes**: SVG-based arrow shapes with white borders
- **Numbered badges**: Bold 2-digit numbers (01-06) at the top
- **Icons**: Large icons (text emoji or symbols) centered in chevrons
- **Overlapping**: Chevrons overlap slightly for continuous flow effect
- **Content cards**: Labels (bold) and descriptions below each chevron
- **Color bars**: Small colored indicators matching chevron colors

### Layout Behavior
- **Horizontal flow**: Items arranged left to right
- **Responsive spacing**: Consistent spacing and overlap
- **Max items**: Supports 3-6 items (ideal: 5 items)
- **Adaptive**: Works with or without icons

### Color Scheme
The layout uses a predefined color progression:
1. Bright green (#22c55e)
2. Green (#10b981)
3. Teal (#14b8a6)
4. Cyan (#0891b2)
5. Dark cyan (#0e7490)
6. Dark navy (#1e3a8a)

## Implementation

### File Structure
```
src/
├── lib/
│   └── layouts/
│       └── content/
│           └── chevron.ts          # Layout definitions
└── components/
    └── layouts/
        └── ChevronFlowRenderer.tsx  # React component
```

### Usage in Presentation

The layout is automatically available in the Content Layout Panel under the "Chevron Flow" category. Users can:

1. Open the Content Layout Panel (layout icon in toolbar)
2. Navigate to "Chevron Flow" section
3. Select the layout to apply it to the current slide
4. Edit content items (labels and descriptions)
5. Add/remove items as needed (3-6 items supported)

### Content Structure

Each item in the chevron layout requires:
```typescript
{
  label?: string;    // Bold heading (e.g., "Collect Input")
  text: string;      // Description text
  icon?: string;     // Optional emoji or symbol (e.g., "💬")
}
```

## Integration Points

The chevron layout is integrated into:

1. **Type System** (`src/components/presentation/types.ts`)
   - Added `ChevronLayoutType` to `ContentLayoutType` union

2. **Layout Panel** (`src/components/presentation/ContentLayoutPanel.tsx`)
   - Added "chevron" category
   - Includes preview rendering
   - Translation support

3. **Slide Renderer** (`src/components/presentation/SlideEnhancedContent.tsx`)
   - Added case for "chevron" category
   - Renders `ChevronFlowRenderer` component

4. **Layout Utils** (`src/components/presentation/slide-layout-utils.ts`)
   - Added "chevron-" prefix detection

5. **Content Index** (`src/lib/layouts/content/index.ts`)
   - Exported chevron types and definitions

## Animation Support

The layout includes Framer Motion animations:
- **Container**: Staggered children animation
- **Items**: Fade in with slide from left
- **Timing**: 0.1s stagger delay, 0.5s duration
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
- Sequential processes with 3-6 steps
- Workflow stages or phases
- Continuous flow demonstrations
- Progressive methodologies
- Action sequences

### Content Guidelines
- Keep labels short (2-4 words)
- Descriptions should be 1-2 sentences
- Use relevant icons when available
- Maintain consistent tone across items

### Design Tips
- Works best with 5 items (as shown in reference)
- Horizontal flow creates strong left-to-right reading pattern
- Color progression reinforces sequential nature
- Icons add visual interest and quick recognition

## Technical Details

### Dimensions
- Chevron width: 160px
- Chevron height: 180px
- Arrow width: 30px (triangular point)
- Overlap: 25px between chevrons
- Content max width: 140px per item

### SVG Path Generation
The chevron shape is generated using a custom SVG path:
- Rectangle body with triangular arrow on right
- Triangular indent on left (for overlap)
- White stroke for separation
- Filled with gradient color

### Theme Integration
- Respects theme colors for text
- Uses predefined color progression for chevrons
- White text on colored backgrounds
- Adapts to light/dark themes for content text

## Comparison with Similar Layouts

### vs. Cascading Workflow
- **Chevron**: Horizontal, overlapping arrows, content below
- **Cascading**: Vertical, alternating sides, content beside

### vs. Sequence Layouts
- **Chevron**: Filled arrow shapes, more visual impact
- **Sequence**: Lines and dots, more minimal

### vs. Steps Layouts
- **Chevron**: Continuous flow emphasis
- **Steps**: Individual discrete steps

## Future Enhancements

Potential improvements:
- Custom color schemes per theme
- Adjustable overlap amount
- Vertical orientation option
- Animation timing customization
- Icon library integration
- Adjustable chevron sizes
- Alternative arrow styles (rounded, sharp, etc.)

## Example Use Cases

1. **Agile Workflow**: Plan → Design → Develop → Test → Deploy
2. **Sales Process**: Prospect → Qualify → Present → Close → Deliver
3. **Content Creation**: Research → Write → Edit → Publish → Promote
4. **Project Phases**: Initiate → Plan → Execute → Monitor → Close
5. **Learning Path**: Discover → Learn → Practice → Master → Teach

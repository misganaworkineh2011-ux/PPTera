# Circular Focus Layout - Implementation Summary

## Overview
Added a new "Core Focus Areas" circular layout that matches the reference design with radiating segments from a center circle and numbered callout boxes positioned around the perimeter.

## Files Created/Modified

### 1. New Component
- **`src/components/layouts/CircularFocusRenderer.tsx`**
  - Radiating colored segments from center circle
  - Icons displayed within each segment
  - Center circle with customizable text (default: "Core Focus\nAreas")
  - Numbered callout boxes (01, 02, 03, 04) positioned around the circle
  - Connecting lines from segments to callouts
  - Full theme support with gradient segment colors
  - Animation support for presentations
  - Editable text for owners
  - Spotlight mode for highlighting areas

### 2. Layout Definition
- **`src/lib/layouts/content/circles.ts`**
  - Added `"circle-focus"` to `CircleLayoutType`
  - Added focus layout definition:
    - Name: "Core Focus Areas"
    - Description: "Radiating segments from center with numbered callout boxes"
    - Min items: 2
    - Max items: 4
    - Ideal items: 3
    - Supports icons: Yes

### 3. Renderer Integration
- **`src/components/layouts/CircleLayoutRenderer.tsx`**
  - Imported `CircularFocusRenderer`
  - Added conditional rendering for `"circle-focus"` layout type
  - Passes all props including editing, spotlight, and theme support

## Features

### Visual Design
- **Center circle**: White circle with customizable text (e.g., "Core Focus Areas")
- **Radiating segments**: 2-4 colored segments extending from center
  - Segment colors: Gradient based on theme (green → teal → blue → dark)
  - Icons displayed in white within each segment
  - Gaps between segments for visual separation
- **Connecting lines**: Thin lines from segment edges to callout boxes
- **Numbered callouts**: Positioned around the circle
  - Colored number badges (01, 02, 03, 04)
  - White content cards with title and description
  - Automatically positioned left or right based on segment angle
  - Shadow and border styling

### Layout Structure
```
        [01] Title
        Description
            ╱
    ┌─────────┐
    │  Segment │
    │  ╱   ╲  │
    │ Center  │──────── [02] Title
    │  ╲   ╱  │         Description
    │  Segment│
    └─────────┘
            ╲
        [03] Title
        Description
```

### Functionality
- **Responsive**: Adapts to 2-4 focus areas
- **Theme-aware**: Uses theme colors for segments, backgrounds, and text
- **Animated**: Smooth staggered animations in presentation mode
- **Editable**: Owners can edit labels and text inline
- **Spotlight**: Supports highlighting individual areas with arrow keys
- **Icons**: Optional icon support for each focus area (displayed in segments)
- **Smart positioning**: Callouts automatically position left/right to avoid overlap

## Usage

The layout is now available in the Content Layout Panel under "Circular Layouts" category. Users can:

1. Open the Content Layout Panel (Layout icon in editor)
2. Navigate to "Circular Layouts" section
3. Select "Core Focus Areas" layout
4. The layout will automatically apply to the current slide

## Data Structure

Each focus area item requires:
```typescript
{
  label?: string;  // Optional area title (e.g., "Collaboration")
  text: string;    // Area description (required)
  icon?: string;   // Optional emoji or icon (displayed in segment)
}
```

## Customization

The layout supports:
- Custom accent colors
- Theme-based styling
- Custom center text
- 2-4 focus areas
- Optional icons for each area
- Automatic color gradients

## Design Specifications

### Dimensions
- Center circle radius: 100px
- Segment inner radius: 130px
- Segment outer radius: 240px
- SVG canvas: 600x600px
- Callout distance: 340px from center
- Gap between segments: 8 degrees

### Colors
Default segment colors (can be overridden by theme):
1. Green (#10b981)
2. Teal (#14b8a6)
3. Blue (#0ea5e9)
4. Dark (#1e293b)

### Typography
- Center text: 20px, bold
- Callout title: 16px, semibold
- Callout description: 14px, regular
- Number badge: 18px, bold
- Icon size: 36px

## Example Use Cases
- Core business values
- Key focus areas
- Strategic pillars
- Team priorities
- Product features
- Service offerings
- Company principles
- Project objectives

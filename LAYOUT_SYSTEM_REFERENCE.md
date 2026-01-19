# Complete Layout System Reference

## Overview
This document provides a comprehensive reference for all layout styles in the presentation system, including content layouts (how content is structured) and slide layouts (image positioning), along with compatibility rules and use cases.

---

## Slide Layouts (Image Positioning)

Slide layouts control where images appear on the slide relative to content.

### Available Slide Layouts:
1. **no-image** - Content only, no image
2. **image-left** - Image on left side (30-60% width), content on right
3. **image-right** - Image on right side (30-60% width), content on left
4. **image-top** - Image on top (25-55% height), content below
5. **image-bottom** - Image on bottom (25-55% height), content above
6. **image-background** - Full-bleed background image with content overlay
7. **image-full** - Full-bleed image only, no text content

### Image Sizes:
- **small**: 25-30% of slide dimension
- **medium**: 35-40% of slide dimension
- **large**: 45-50% of slide dimension
- **full**: 55-60% of slide dimension

### Image Shapes:
- **rectangle**: Straight edges, no curves
- **arc**: Curved edge facing content (inward arc)
- **rounded**: Smooth rounded curve facing content
- **wave**: Wavy edge effect facing content

---

## Content Layout Categories

Content layouts control how text/data is structured within the content area of the slide.

---

## 1. BOXES (Card-Based Layouts)

**Category ID**: `boxes`  
**Description**: Content organized in card/box containers with headings and descriptions  
**Best For**: Distinct concepts, features, benefits, categories that deserve equal visual weight

### Subcategories:

#### box-style-1: Side Accent
- **Design**: Clean card with colored accent bar on the left edge
- **Items**: 1-6 (ideal: 3)
- **Grid**: Adaptive (1-3 columns based on count)
- **Icons**: No
- **Use Cases**:
  - Feature lists with equal importance
  - Benefits or advantages
  - Service offerings
  - Key points that need visual separation
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom` (full width for cards)
  - ✅ **GOOD**: `image-left`, `image-right` (2-column grid works)
  - ❌ **AVOID**: `image-background`, `image-full` (cards need clear background)

#### box-style-2: Minimal
- **Design**: Simple, elegant card with centered text, no decorations
- **Items**: 1-6 (ideal: 3)
- **Grid**: Adaptive (1-3 columns based on count)
- **Icons**: No
- **Use Cases**:
  - Clean, professional presentations
  - Minimalist design aesthetic
  - Text-focused content without distractions
  - Corporate/formal presentations
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ✅ **GOOD**: `image-left`, `image-right`
  - ❌ **AVOID**: `image-background`, `image-full`

#### box-style-3: Icon Focus
- **Design**: Card with centered icon in a circle above the title
- **Items**: 1-6 (ideal: 3)
- **Grid**: Adaptive (1-3 columns based on count)
- **Icons**: Yes (required)
- **Use Cases**:
  - Feature highlights with visual icons
  - Service categories with symbols
  - Process steps with icon representation
  - Benefits with visual metaphors
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ✅ **GOOD**: `image-left`, `image-right`
  - ⚠️ **CAUTION**: Icons need space, avoid small image sizes
  - ❌ **AVOID**: `image-background`, `image-full`

#### box-style-4: Header Accent
- **Design**: Card with top accent bar and overlapping icon
- **Items**: 1-6 (ideal: 3)
- **Grid**: Adaptive (1-3 columns based on count)
- **Icons**: Yes (optional)
- **Use Cases**:
  - Premium/highlighted features
  - Important categories with emphasis
  - Branded content sections
  - Key differentiators
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ✅ **GOOD**: `image-left`, `image-right`
  - ❌ **AVOID**: `image-background`, `image-full`

---

## 2. BULLETS (Traditional Lists)

**Category ID**: `bullets`  
**Description**: Traditional bullet point lists with various bullet styles  
**Best For**: Lists, supporting details, hierarchical content, sequential information

### Subcategories:

#### bullet-style-1: Card Bullets
- **Design**: Bullet points in rounded cards arranged in a grid
- **Items**: 1-6 (ideal: 3)
- **Bullet Style**: Filled circle
- **Arrangement**: Grid
- **Use Cases**:
  - Short, punchy bullet points
  - Key takeaways in card format
  - Visually separated list items
  - Modern, card-based design aesthetic
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ✅ **GOOD**: `image-left`, `image-right` (2-column grid)
  - ❌ **AVOID**: `image-background` (cards need clear background)

#### bullet-style-2: Simple Bullets
- **Design**: Clean bullet points without cards, arranged in columns
- **Items**: 1-8 (ideal: 3)
- **Bullet Style**: Filled circle
- **Arrangement**: Columns
- **Use Cases**:
  - Traditional bullet lists
  - Supporting details
  - Multiple related points
  - Text-heavy content
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-left`, `image-right`, `image-top`, `image-bottom`
  - ✅ **GOOD**: All slide layouts (most flexible)
  - ⚠️ **CAUTION**: With `image-background`, ensure text contrast

#### bullet-style-3: Checklist
- **Design**: Checkmark bullets in cards for task-like content
- **Items**: 1-6 (ideal: 3)
- **Bullet Style**: Checkmark
- **Arrangement**: Grid
- **Use Cases**:
  - Task lists or to-do items
  - Requirements or criteria
  - Completed items or achievements
  - Action items
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ✅ **GOOD**: `image-left`, `image-right`
  - ❌ **AVOID**: `image-background`

#### bullet-style-4: Arrow List
- **Design**: Arrow bullets with minimal styling in a vertical list
- **Items**: 1-8 (ideal: 4)
- **Bullet Style**: Arrow
- **Arrangement**: Vertical list
- **Use Cases**:
  - Sequential points with flow
  - Directional or progressive content
  - Cause and effect relationships
  - Step-by-step without numbers
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-left`, `image-right`
  - ✅ **GOOD**: `image-top`, `image-bottom`
  - ⚠️ **CAUTION**: Vertical layout works best with side images

---

## 3. SEQUENCE (Timelines & Processes)

**Category ID**: `sequence`  
**Description**: Sequential processes, timelines, chronological flows where order matters  
**Best For**: Processes, timelines, chronological events, sequential steps

### Subcategories:

#### sequence-style-1: Process Flow
- **Design**: Horizontal sequence with connecting line at the top
- **Items**: 2-5 (ideal: 4)
- **Orientation**: Horizontal
- **Icons**: Yes (dots/numbers)
- **Use Cases**:
  - Business processes
  - Workflow diagrams
  - Project phases
  - Sequential stages
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ⚠️ **CAUTION**: `image-left`, `image-right` (horizontal layout needs width)
  - ❌ **AVOID**: Narrow spaces (needs horizontal room)

#### sequence-style-2: Timeline
- **Design**: Horizontal timeline with centered nodes
- **Items**: 2-5 (ideal: 4)
- **Orientation**: Horizontal
- **Icons**: Yes (dots/markers)
- **Use Cases**:
  - Historical timelines
  - Project milestones
  - Event chronology
  - Development roadmap
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ⚠️ **CAUTION**: `image-left`, `image-right` (needs horizontal space)
  - ❌ **AVOID**: Narrow spaces

#### sequence-style-3: Vertical Steps
- **Design**: Vertical sequence list with line on the left
- **Items**: 2-8 (ideal: 5)
- **Orientation**: Vertical
- **Icons**: Yes (dots/numbers)
- **Use Cases**:
  - Vertical timelines
  - Sequential instructions
  - Chronological events (many items)
  - Process flows with descriptions
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-left`, `image-right`
  - ✅ **GOOD**: All slide layouts (vertical is flexible)
  - ⚠️ **CAUTION**: `image-top`, `image-bottom` (vertical layout needs height)

#### sequence-style-4: Vertical Journey
- **Design**: Vertical timeline with alternating content
- **Items**: 2-8 (ideal: 5)
- **Orientation**: Vertical
- **Icons**: Yes (dots/markers)
- **Use Cases**:
  - Story-based timelines
  - Journey maps
  - Evolution or progression
  - Narrative sequences
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-left`, `image-right`
  - ✅ **GOOD**: All slide layouts
  - ⚠️ **CAUTION**: `image-top`, `image-bottom` (needs vertical space)

---

## 4. STEPS (Step-by-Step Guides)

**Category ID**: `steps`  
**Description**: Step-by-step instructions, procedural guides, numbered processes  
**Best For**: How-to guides, tutorials, procedural instructions, numbered steps

### Subcategories:

#### steps-pyramid: Pyramid Steps
- **Design**: Inverted pyramid with numbered steps expanding downward
- **Items**: 2-5 (ideal: 3)
- **Orientation**: Vertical
- **Numbers**: Yes
- **Use Cases**:
  - Hierarchical processes (broad to specific)
  - Funnel-style workflows
  - Progressive expansion
  - Building complexity
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`
  - ⚠️ **CAUTION**: `image-left`, `image-right` (pyramid needs width)
  - ❌ **AVOID**: `image-top`, `image-bottom`, `image-background` (pyramid shape conflicts)

#### steps-arrows: Arrow Flow
- **Design**: Vertical flow with arrows pointing down between steps
- **Items**: 2-6 (ideal: 3)
- **Orientation**: Vertical
- **Numbers**: No (uses arrows)
- **Use Cases**:
  - Sequential processes with flow
  - Cause and effect chains
  - Transformation processes
  - Progressive steps
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-left`, `image-right`
  - ⚠️ **CAUTION**: `image-top`, `image-bottom` (vertical flow needs height)
  - ❌ **AVOID**: `image-background` (arrows need clear visibility)

#### steps-cards: Step Cards
- **Design**: Simple cards in a horizontal row with left border accent
- **Items**: 2-4 (ideal: 3)
- **Orientation**: Horizontal
- **Numbers**: No
- **Use Cases**:
  - Simple 3-step processes
  - Quick how-to guides
  - Short procedural instructions
  - Compact step displays
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-top`, `image-bottom`
  - ⚠️ **CAUTION**: `image-left`, `image-right` (horizontal layout needs width)
  - ❌ **AVOID**: Narrow spaces

#### steps-bars: Numbered Bars
- **Design**: Horizontal bars with step numbers on the left side
- **Items**: 2-6 (ideal: 3)
- **Orientation**: Vertical (stacked bars)
- **Numbers**: Yes
- **Use Cases**:
  - Numbered instructions
  - Sequential procedures
  - Ordered processes
  - Step-by-step guides
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`, `image-left`, `image-right`
  - ✅ **GOOD**: All slide layouts (bars are flexible)
  - ⚠️ **CAUTION**: `image-top`, `image-bottom` (bars need vertical space)

---

## 5. QUOTES (Testimonials & Statements)

**Category ID**: `quotes`  
**Description**: Quote displays, testimonials, statements, expert opinions  
**Best For**: Testimonials, quotes, customer feedback, expert statements

### Subcategories:

#### quote-bubble: Thought Bubble
- **Design**: Speech bubble style cards with directional tails
- **Items**: 1-6 (ideal: 3)
- **Style**: Bubble with tail
- **Quotation Marks**: No
- **Use Cases**:
  - Customer testimonials
  - User feedback
  - Conversational quotes
  - Informal statements
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`
  - ⚠️ **CAUTION**: `image-top`, `image-bottom` (bubbles need space)
  - ❌ **AVOID**: `image-left`, `image-right`, `image-background` (bubbles are full-width design)

#### quote-marks: Quote Cards
- **Design**: Elegant cards with quotation marks at corners
- **Items**: 1-6 (ideal: 3)
- **Style**: Card with quote marks
- **Quotation Marks**: Yes
- **Use Cases**:
  - Formal quotes
  - Expert opinions
  - Professional testimonials
  - Cited statements
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`
  - ⚠️ **CAUTION**: `image-top`, `image-bottom`
  - ❌ **AVOID**: `image-left`, `image-right`, `image-background` (quote cards are full-width)

---

## 6. CIRCLES (Circular Arrangements)

**Category ID**: `circles`  
**Description**: Circular arrangements, cycles, interconnected concepts  
**Best For**: Cycles, circular relationships, interconnected concepts, continuous processes

### Subcategories:

#### circle-arc: Arc Flow
- **Design**: Dynamic curved segments in an arc with content around edges
- **Items**: 1-8 (ideal: 3)
- **Shape**: Arc (semi-circle)
- **Icons**: Yes (optional)
- **Use Cases**:
  - Partial cycles or phases
  - Progressive stages (not full circle)
  - Semi-circular relationships
  - Curved flow diagrams
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`
  - ❌ **AVOID**: ALL image layouts (circular design takes full slide space)
  - ❌ **CRITICAL**: Circles category is NEVER compatible with images

#### circle-ring: Ring Cycle
- **Design**: Dynamic segments forming a ring with content distributed around
- **Items**: 1-8 (ideal: 3)
- **Shape**: Ring (full circle)
- **Icons**: Yes (optional)
- **Use Cases**:
  - Complete cycles
  - Continuous processes
  - Circular relationships
  - Interconnected concepts
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image`
  - ❌ **AVOID**: ALL image layouts (circular design takes full slide space)
  - ❌ **CRITICAL**: Circles category is NEVER compatible with images

---

## 7. IMAGES (Image Galleries)

**Category ID**: `images`  
**Description**: Image gallery or grid layouts for visual content  
**Best For**: Photo galleries, visual showcases, image-heavy content, portfolios

### Subcategories:

#### image-style-1: Compact Gallery
- **Design**: Small rounded images on left with title/description on right
- **Items**: 1-6 (ideal: 3)
- **Image Shape**: Small rounded square
- **Arrangement**: Horizontal (image left, text right)
- **Use Cases**:
  - Product showcases with descriptions
  - Team member profiles
  - Portfolio items with details
  - Feature highlights with images
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image` (uses multiple content images)
  - ❌ **AVOID**: ALL slide image layouts (this layout provides its own images)
  - ❌ **CRITICAL**: Images category ALWAYS requires images and provides its own layout

#### image-style-2: Card Gallery
- **Design**: Larger rounded square images on top with text below
- **Items**: 1-6 (ideal: 3)
- **Image Shape**: Large rounded square
- **Arrangement**: Vertical (image top, text below)
- **Use Cases**:
  - Photo galleries
  - Product grids
  - Portfolio showcases
  - Visual catalogs
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image` (uses multiple content images)
  - ❌ **AVOID**: ALL slide image layouts
  - ❌ **CRITICAL**: Images category ALWAYS requires images

#### image-style-3: Circle Gallery
- **Design**: Large circular images on top with centered text below
- **Items**: 1-6 (ideal: 3)
- **Image Shape**: Circle
- **Arrangement**: Vertical (image top, text below)
- **Use Cases**:
  - Team member photos
  - Profile showcases
  - People-focused galleries
  - Avatar-style displays
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image` (uses multiple content images)
  - ❌ **AVOID**: ALL slide image layouts
  - ❌ **CRITICAL**: Images category ALWAYS requires images

#### image-style-4: Feature Gallery
- **Design**: Large rounded rectangle images on top with centered text below
- **Items**: 1-6 (ideal: 3)
- **Image Shape**: Rounded rectangle
- **Arrangement**: Vertical (image top, text below)
- **Use Cases**:
  - Featured content
  - Hero image galleries
  - Landscape photo showcases
  - Visual storytelling
- **Slide Layout Compatibility**:
  - ✅ **BEST**: `no-image` (uses multiple content images)
  - ❌ **AVOID**: ALL slide image layouts
  - ❌ **CRITICAL**: Images category ALWAYS requires images

---

## Layout Compatibility Matrix

### Content Layouts vs Slide Layouts

| Content Layout | no-image | image-left | image-right | image-top | image-bottom | image-background | image-full |
|----------------|----------|------------|-------------|-----------|--------------|------------------|------------|
| **boxes** (all styles) | ✅ BEST | ✅ GOOD | ✅ GOOD | ✅ BEST | ✅ BEST | ❌ AVOID | ❌ AVOID |
| **bullets** (all styles) | ✅ BEST | ✅ BEST | ✅ BEST | ✅ BEST | ✅ BEST | ⚠️ CAUTION | ❌ AVOID |
| **sequence-style-1/2** (horizontal) | ✅ BEST | ⚠️ CAUTION | ⚠️ CAUTION | ✅ BEST | ✅ BEST | ❌ AVOID | ❌ AVOID |
| **sequence-style-3/4** (vertical) | ✅ BEST | ✅ BEST | ✅ BEST | ⚠️ CAUTION | ⚠️ CAUTION | ❌ AVOID | ❌ AVOID |
| **steps-pyramid** | ✅ BEST | ⚠️ CAUTION | ⚠️ CAUTION | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID |
| **steps-arrows** | ✅ BEST | ✅ BEST | ✅ BEST | ⚠️ CAUTION | ⚠️ CAUTION | ❌ AVOID | ❌ AVOID |
| **steps-cards** | ✅ BEST | ⚠️ CAUTION | ⚠️ CAUTION | ✅ BEST | ✅ BEST | ❌ AVOID | ❌ AVOID |
| **steps-bars** | ✅ BEST | ✅ BEST | ✅ BEST | ⚠️ CAUTION | ⚠️ CAUTION | ❌ AVOID | ❌ AVOID |
| **quotes** (all styles) | ✅ BEST | ❌ AVOID | ❌ AVOID | ⚠️ CAUTION | ⚠️ CAUTION | ❌ AVOID | ❌ AVOID |
| **circles** (all styles) | ✅ BEST | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID |
| **images** (all styles) | ✅ BEST | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID | ❌ AVOID |

### Legend:
- ✅ **BEST**: Optimal combination, recommended
- ✅ **GOOD**: Works well, acceptable
- ⚠️ **CAUTION**: Works but may have layout constraints or reduced effectiveness
- ❌ **AVOID**: Poor combination, not recommended or incompatible

---

## Critical Compatibility Rules

### 1. CIRCLES Category
- **NEVER compatible with ANY slide image layouts**
- Circular designs require full slide space
- Always use `slideLayout: "no-image"`
- Reason: Arc/ring segments take up the entire slide area

### 2. QUOTES Category
- **NEVER compatible with `image-left` or `image-right`**
- Quote layouts are full-width designs
- Best with `no-image`, acceptable with `image-top`/`image-bottom`
- Reason: Quote cards/bubbles need horizontal space

### 3. IMAGES Category
- **ALWAYS requires images** (2-3 images per slide)
- **NEVER compatible with slide image layouts** (provides its own images)
- Always use `slideLayout: "no-image"`
- Reason: This category IS the image layout

### 4. Horizontal Layouts (sequence-style-1/2, steps-cards)
- **Avoid `image-left` and `image-right`** when possible
- Horizontal layouts need width
- Best with `no-image`, `image-top`, or `image-bottom`

### 5. Vertical Layouts (sequence-style-3/4, steps-arrows, steps-bars)
- **Avoid `image-top` and `image-bottom`** when possible
- Vertical layouts need height
- Best with `no-image`, `image-left`, or `image-right`

### 6. Pyramid Layout (steps-pyramid)
- **Highly restrictive** - only works well with `no-image`
- Pyramid shape conflicts with most image positions
- Needs full slide width and specific vertical space

---

## Selection Engine Rules

### Rule 1: Image Requirement Check
```
IF contentLayoutCategory === "images" THEN
  slideLayout = "no-image"
  REQUIRE 2-3 images for content
END IF
```

### Rule 2: Circle Exclusion
```
IF contentLayoutCategory === "circles" THEN
  slideLayout = "no-image"
  REJECT all image slide layouts
END IF
```

### Rule 3: Quote Restriction
```
IF contentLayoutCategory === "quotes" THEN
  IF slideLayout IN ["image-left", "image-right"] THEN
    REJECT or CHANGE to "no-image" or "image-top"
  END IF
END IF
```

### Rule 4: Horizontal Layout Optimization
```
IF contentLayout IN ["sequence-style-1", "sequence-style-2", "steps-cards"] THEN
  PREFER slideLayout IN ["no-image", "image-top", "image-bottom"]
  AVOID slideLayout IN ["image-left", "image-right"]
END IF
```

### Rule 5: Vertical Layout Optimization
```
IF contentLayout IN ["sequence-style-3", "sequence-style-4", "steps-arrows", "steps-bars"] THEN
  PREFER slideLayout IN ["no-image", "image-left", "image-right"]
  AVOID slideLayout IN ["image-top", "image-bottom"]
END IF
```

### Rule 6: Pyramid Special Case
```
IF contentLayout === "steps-pyramid" THEN
  slideLayout = "no-image"
  REJECT all image slide layouts
END IF
```

---

## Summary Statistics

### Total Layouts:
- **8 Content Layout Categories**
- **26 Content Layout Styles** (subcategories)
- **7 Slide Layout Types** (image positions)
- **4 Image Sizes** (small, medium, large, full)
- **4 Image Shapes** (rectangle, arc, rounded, wave)

### Compatibility:
- **3 categories** are image-incompatible: circles, quotes, images
- **5 categories** are image-compatible: boxes, bullets, sequence, steps
- **Horizontal layouts** (3 styles) prefer top/bottom images
- **Vertical layouts** (4 styles) prefer left/right images
- **Flexible layouts** (bullets, boxes) work with all image positions

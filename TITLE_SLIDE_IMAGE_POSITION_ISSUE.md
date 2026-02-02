# Title Slide Image Position Issue

## Problem
User reports that when the image is positioned on the left or right of a title slide, the description (subtitle) is hidden and not shown.

## Root Cause Analysis

After reviewing the code in `src/app/presentation/[slug]/components/PresentationSlide.tsx` and `src/app/presentation/[slug]/components/TitleSlide.tsx`, I found:

1. **Current Implementation**: Title slides with images ALWAYS use the image as a full-screen background:
   ```tsx
   {isTitle && !slide.slideLayout && hasImage && slide.image?.url && (
     <img
       src={slide.image.url}
       alt={slide.title}
       className="absolute inset-0 w-full h-full object-cover"
     />
   )}
   ```

2. **No Position Handling**: The TitleSlide component does NOT have any logic to handle different image positions (left/right/center). All title slides render text centered over the background image.

3. **Missing Feature**: There is NO implementation for title slides with side-by-side layouts (image on left/right, text on opposite side).

## Current Behavior
- Title slides with images: Image is ALWAYS full background
- Text (title + subtitle) is ALWAYS centered over the image
- Subtitle is ALWAYS rendered when it exists
- No option for left/right image positioning

## What User Expects
User expects title slides to support layouts like:
- **Image Left**: Image on left 50%, text (title + subtitle) on right 50%
- **Image Right**: Image on right 50%, text (title + subtitle) on left 50%
- **Image Background** (current): Full background image with centered text overlay

## Solution Required

Need to implement side-by-side title slide layouts. This requires:

### 1. Update TitleSlide Component
Add support for `imagePosition` prop with values: `"background"`, `"left"`, `"right"`

### 2. Create New Layout Variants
For each theme variant (Dark, Light, Sunset, etc.), add conditional rendering:

```tsx
function DarkTitleSlide({ slide, imagePosition, ... }) {
  if (imagePosition === "left") {
    return (
      <div className="h-full flex">
        {/* Left: Image */}
        <div className="w-1/2">
          <img src={slide.image.url} className="w-full h-full object-cover" />
        </div>
        {/* Right: Text */}
        <div className="w-1/2 flex flex-col justify-center p-12">
          <h1>{slide.title}</h1>
          {slide.subtitle && <p>{slide.subtitle}</p>}
        </div>
      </div>
    );
  }
  
  if (imagePosition === "right") {
    return (
      <div className="h-full flex">
        {/* Left: Text */}
        <div className="w-1/2 flex flex-col justify-center p-12">
          <h1>{slide.title}</h1>
          {slide.subtitle && <p>{slide.subtitle}</p>}
        </div>
        {/* Right: Image */}
        <div className="w-1/2">
          <img src={slide.image.url} className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }
  
  // Default: background (current implementation)
  return (
    <div className="h-full relative">
      {/* Background image with centered text */}
    </div>
  );
}
```

### 3. Update PresentationSlide Component
Pass `imagePosition` prop to TitleSlide based on `slide.slideLayout` or a new `slide.imagePosition` field.

### 4. Update Slide Data Type
Add `imagePosition?: "background" | "left" | "right"` to SlideData type.

## Recommendation

The user's issue suggests they're trying to use a feature that doesn't exist yet. The subtitle is NOT hidden - it's just that there's no side-by-side layout option for title slides.

**Immediate Fix**: Clarify to user that title slides currently only support background images with centered text. Side-by-side layouts are not implemented.

**Long-term Fix**: Implement the side-by-side title slide layouts as described above.

## Status
- ❌ Side-by-side title slide layouts NOT implemented
- ✅ Subtitle rendering works correctly for background image layout
- ⚠️ User expects feature that doesn't exist

## Next Steps
1. Confirm with user if they want side-by-side title slide layouts implemented
2. If yes, implement the solution outlined above
3. Add UI controls to let users choose image position for title slides

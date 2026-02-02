# Title Slide Subtitle Fix for Side Layouts - Complete

## Problem
When title slides used image-left or image-right layouts (side-by-side layouts), the subtitle/description was not showing, even though it displayed correctly with background image layouts.

## Root Cause
Two issues were preventing the subtitle from showing:

### Issue 1: SlideSideImageLayouts Component
**File**: `src/components/presentation/SlideSideImageLayouts.tsx`

The component had conditions that prevented rendering descriptions for title slides:
```tsx
{!isTitleSlide && renderDescription ? renderDescription() : null}
```

This explicitly blocked description rendering when `isTitleSlide` was true.

### Issue 2: SlideDescriptionBlock Component  
**File**: `src/components/presentation/SlideTextBlocks.tsx`

The component only looked for `slide.slideDescription`, but title slides store their description in `slide.subtitle`:
```tsx
if (!slide.slideDescription) return null;
```

This meant even when `renderDescription()` was called, it returned null for title slides.

## Solution

### Fix 1: SlideSideImageLayouts.tsx
Removed the `!isTitleSlide` condition from both layout branches (lines 97 and 183):

**Before:**
```tsx
{!isTitleSlide && renderDescription ? renderDescription() : null}
```

**After:**
```tsx
{renderDescription ? renderDescription() : null}
```

### Fix 2: SlideTextBlocks.tsx
Modified `SlideDescriptionBlock` to check for `slide.subtitle` when it's a title slide:

**Before:**
```tsx
if (!slide.slideDescription) return null;
return (
  <EditableText
    value={slide.slideDescription}
    isEditing={isEditing && editingText?.field === "slideDescription"}
    onStartEdit={() => onStartEditing(index, "slideDescription")}
    // ...
  />
);
```

**After:**
```tsx
// For title slides, use subtitle; for content slides, use slideDescription
const description = isTitleSlide ? slide.subtitle : slide.slideDescription;
const fieldName = isTitleSlide ? "subtitle" : "slideDescription";

if (!description) return null;

return (
  <EditableText
    value={description}
    isEditing={isEditing && editingText?.field === fieldName}
    onStartEdit={() => onStartEditing(index, fieldName)}
    // ...
  />
);
```

## Result
✅ Title slides with image-left layout now show subtitle
✅ Title slides with image-right layout now show subtitle  
✅ Title slides with background image layout continue to work correctly
✅ Content slides with slideDescription continue to work correctly
✅ Editing works correctly for both subtitle (title slides) and slideDescription (content slides)

## Files Modified
1. `src/components/presentation/SlideSideImageLayouts.tsx` - Removed title slide blocking condition
2. `src/components/presentation/SlideTextBlocks.tsx` - Added logic to use subtitle for title slides

## Testing Recommendations
1. Create a title slide with subtitle
2. Add an image and set layout to "image-left"
3. Verify subtitle appears on the right side with the title
4. Change layout to "image-right"
5. Verify subtitle appears on the left side with the title
6. Verify editing the subtitle works correctly
7. Test with different themes to ensure styling is correct

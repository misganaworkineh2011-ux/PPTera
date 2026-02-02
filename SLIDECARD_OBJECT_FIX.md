# SlideCard Object Rendering Fix

## Issue
Runtime error when rendering slides during outline generation:
```
Objects are not valid as a React child (found: object with keys {label, description})
```

## Root Cause
The AI generation system can now produce bullet points as objects (with `label` and `description` properties) for certain layout types like:
- Comparison layouts
- Pros/Cons layouts
- Before/After layouts
- Other structured layouts

However, the `SlideCard` component expected `bulletPoints` to always be an array of strings and tried to render them directly, causing React to throw an error when encountering objects.

## Solution
Updated `SlideCard.tsx` to handle both string and object bullet points gracefully.

### Changes Made

#### 1. Added Helper Function
```typescript
const getBulletText = (bullet: any): string => {
  if (typeof bullet === 'string') return bullet;
  if (typeof bullet === 'object' && bullet !== null) {
    return bullet.text || bullet.label || bullet.description || JSON.stringify(bullet);
  }
  return String(bullet);
};
```

This function:
- Returns strings as-is
- Extracts text from objects (tries `text`, `label`, `description` properties)
- Falls back to JSON.stringify for complex objects
- Converts other types to strings

#### 2. Updated State Initialization
```typescript
const [editedBullets, setEditedBullets] = useState(
  slide.bulletPoints?.map(getBulletText).join("\n") || ""
);
```

Now converts all bullet points to strings before joining.

#### 3. Updated Rendering Logic
```typescript
{slide.bulletPoints.map((bullet, i) => {
  const bulletText = typeof bullet === 'string' 
    ? bullet 
    : typeof bullet === 'object' && bullet !== null
      ? (bullet as any).text || (bullet as any).label || (bullet as any).description || JSON.stringify(bullet)
      : String(bullet);
  
  return (
    <li key={i} className="flex gap-2 leading-relaxed">
      <span className="text-[#06b6d4] flex-shrink-0">•</span>
      <span>{bulletText}</span>
    </li>
  );
})}
```

Safely extracts text from each bullet point before rendering.

#### 4. Updated Cancel Handler
```typescript
const handleCancel = () => {
  setEditedTitle(slide.title);
  setEditedBullets(slide.bulletPoints?.map(getBulletText).join("\n") || "");
  setIsEditing(false);
};
```

Ensures consistency when canceling edits.

## Backward Compatibility
The fix is fully backward compatible:
- ✅ String bullet points work as before
- ✅ Object bullet points are now handled gracefully
- ✅ No breaking changes to existing functionality
- ✅ Editing still works correctly

## Why This Happened
When we integrated the new layouts (comparison, proscons, beforeafter, etc.), the AI prompt instructions included examples with structured bullet points as objects. During streaming, the raw AI output might include these objects before they're normalized to strings.

## Prevention
To prevent this in the future:

### Option 1: Normalize in Stream Handler
Add normalization in `useOutlineStream` to convert all bullet points to strings:
```typescript
const normalizedSlide = {
  ...slide,
  bulletPoints: slide.bulletPoints?.map(b => 
    typeof b === 'string' ? b : b.text || b.label || b.description || JSON.stringify(b)
  )
};
```

### Option 2: Update Type Definition
Update the `Slide` interface to explicitly allow objects:
```typescript
export interface Slide {
  bulletPoints?: (string | { text?: string; label?: string; description?: string })[];
  // ...
}
```

### Option 3: AI Prompt Clarification
Update AI prompts to explicitly state bullet points should be strings:
```
"bulletPoints": ["string 1", "string 2", "string 3"]
NOT: ["bulletPoints": [{"label": "...", "description": "..."}]]
```

## Recommendation
The current fix (handling both types in SlideCard) is the most robust solution because:
1. It handles edge cases gracefully
2. It doesn't break if AI output format changes
3. It's defensive programming - handles unexpected data
4. It maintains backward compatibility

## Testing
Test cases to verify:
- [x] String bullet points render correctly
- [x] Object bullet points render correctly
- [x] Editing works with both types
- [x] Cancel works with both types
- [x] No React errors during streaming
- [x] Completed slides display properly

## Status
✅ **FIXED** - SlideCard now handles both string and object bullet points safely.

# Content Validation Usage Guide

## Overview
The content validation system enforces word count and item limits for all layout types. This ensures AI-generated content fits properly within each layout's visual constraints.

## Validation Functions

### 1. Word Counting
```typescript
import { countWords } from "~/lib/layouts/content/validation";

const text = "This is a sample text";
const wordCount = countWords(text); // Returns: 5
```

### 2. Get Layout Constraints
```typescript
import { getLayoutConstraints } from "~/lib/layouts/content/validation";

const constraints = getLayoutConstraints("circle-workflow");
// Returns: { maxPoints: 5, maxLabelWords: 5, maxDescriptionWords: 20 }
```

### 3. Validate Content Items
```typescript
import { validateContentItems } from "~/lib/layouts/content/validation";

const items = [
  { label: "Innovation", text: "Drive breakthrough solutions" },
  { label: "Collaboration", text: "Foster teamwork across departments" },
];

const result = validateContentItems(items, "circle-workflow");
// Returns: { isValid: true, errors: [], warnings: [] }
```

### 4. Auto-Fix Content
```typescript
import { fixContentItems } from "~/lib/layouts/content/validation";

const items = [
  { 
    label: "This is a very long label that exceeds the limit", 
    text: "This is a very long description that goes on and on and exceeds the maximum word count allowed for this layout type"
  },
];

const fixed = fixContentItems(items, "proscons-split");
// Returns truncated content that meets constraints
```

### 5. Get AI Prompt Instructions
```typescript
import { getAIPromptInstructions } from "~/lib/layouts/content/validation";

const instructions = getAIPromptInstructions("cascading-workflow");
// Returns formatted instructions for AI prompts
```

## Integration Examples

### Example 1: Validate Before Saving
```typescript
import { validateContentItems } from "~/lib/layouts/content/validation";

function saveSlideContent(items: ContentItem[], layoutId: ContentLayoutType) {
  const validation = validateContentItems(items, layoutId);
  
  if (!validation.isValid) {
    console.error("Validation errors:", validation.errors);
    // Show error to user
    return false;
  }
  
  // Proceed with save
  return true;
}
```

### Example 2: Auto-Fix on Import
```typescript
import { fixContentItems } from "~/lib/layouts/content/validation";

function importSlideContent(items: ContentItem[], layoutId: ContentLayoutType) {
  // Automatically fix content to meet constraints
  const fixedItems = fixContentItems(items, layoutId);
  
  // Save fixed content
  return saveContent(fixedItems);
}
```

### Example 3: Show Constraints in UI
```typescript
import { getConstraintsSummary } from "~/lib/layouts/content/validation";

function LayoutSelector({ layoutId }: { layoutId: ContentLayoutType }) {
  const summary = getConstraintsSummary(layoutId);
  
  return (
    <div>
      <h3>{layoutId}</h3>
      <p className="text-xs text-gray-500">{summary}</p>
    </div>
  );
}
```

### Example 4: AI Content Generation
```typescript
import { getAIPromptInstructions, validateContentItems } from "~/lib/layouts/content/validation";

async function generateContent(topic: string, layoutId: ContentLayoutType) {
  // Get layout-specific instructions
  const instructions = getAIPromptInstructions(layoutId);
  
  // Include in AI prompt
  const prompt = `
    Generate content about: ${topic}
    
    ${instructions}
    
    Return as JSON array of items with 'label' and 'text' fields.
  `;
  
  const response = await callAI(prompt);
  const items = JSON.parse(response);
  
  // Validate generated content
  const validation = validateContentItems(items, layoutId);
  
  if (!validation.isValid) {
    console.warn("AI generated invalid content:", validation.errors);
    // Could retry or auto-fix
  }
  
  return items;
}
```

## Constraint Reference

| Layout | Max Items | Label Words | Description Words |
|--------|-----------|-------------|-------------------|
| Circle | 5 | 5 | 20 |
| Cascading | 4 | 5 | 20 |
| Chevron | 4 | 5 | 20 |
| Funnel | 6 | 5 | 15 |
| Pros/Cons | 12 (6/side) | 4 | 4 |
| Comparison | 12 (6/side) | 4 | 10 |
| Before/After | 12 (6/side) | 6 | N/A |

## Error Messages

The validation system provides clear error messages:

```typescript
{
  isValid: false,
  errors: [
    "Too many items: 8 (max 5 for circle-workflow)",
    "Item 1 label exceeds 5 words (has 8)",
    "Item 2 description exceeds 20 words (has 25)"
  ],
  warnings: []
}
```

## Best Practices

### 1. Validate Early
Validate content as soon as it's generated or imported:
```typescript
const validation = validateContentItems(items, layoutId);
if (!validation.isValid) {
  // Handle errors immediately
}
```

### 2. Show Constraints to Users
Display word count limits in the UI:
```typescript
<input 
  maxLength={constraints.maxLabelWords * 6} // Rough character estimate
  placeholder={`Max ${constraints.maxLabelWords} words`}
/>
```

### 3. Auto-Fix When Possible
For imports or AI generation, auto-fix content:
```typescript
const fixedItems = fixContentItems(items, layoutId);
```

### 4. Include in AI Prompts
Always include constraints in AI generation prompts:
```typescript
const instructions = getAIPromptInstructions(layoutId);
const prompt = `${userPrompt}\n\n${instructions}`;
```

### 5. Log Validation Issues
Track validation failures for debugging:
```typescript
if (!validation.isValid) {
  console.error("Validation failed:", {
    layoutId,
    itemCount: items.length,
    errors: validation.errors,
  });
}
```

## Testing

### Unit Test Example
```typescript
import { validateContentItems, countWords } from "~/lib/layouts/content/validation";

describe("Content Validation", () => {
  it("should count words correctly", () => {
    expect(countWords("Hello world")).toBe(2);
    expect(countWords("  Multiple   spaces  ")).toBe(2);
  });
  
  it("should validate circular layout", () => {
    const items = Array(6).fill({ label: "Test", text: "Description" });
    const result = validateContentItems(items, "circle-workflow");
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Too many items: 6 (max 5 for circle-workflow)");
  });
  
  it("should validate word counts", () => {
    const items = [{
      label: "This label has way too many words",
      text: "Short text"
    }];
    
    const result = validateContentItems(items, "proscons-split");
    expect(result.isValid).toBe(false);
  });
});
```

## Status
**ACTIVE** - Use these validation functions in all content generation and import flows.

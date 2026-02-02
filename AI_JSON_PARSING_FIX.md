# AI JSON Parsing Fix

## Problem
The AI agent was failing with "Failed to parse AI response" errors. This happened because:

1. **Gemini** sometimes wraps JSON responses in markdown code fences: ` ```json ... ``` `
2. **Gemini** sometimes adds explanatory text before or after the JSON
3. The code was using simple `JSON.parse()` which fails on these formats

## Solution
Added a robust `parseAIJson()` helper function that:

1. **Removes markdown code fences** - Strips ` ```json ` and ` ``` ` wrappers
2. **Extracts JSON** - Finds content between first `{` and last `}` 
3. **Handles extra text** - Ignores any text before/after the JSON object
4. **Logs errors** - Provides detailed error messages with the actual response for debugging

## Implementation

### Helper Function
```typescript
function parseAIJson<T>(responseText: string): T {
  let jsonText = responseText.trim();
  
  // Remove markdown code fences if present (```json ... ``` or ``` ... ```)
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  
  // Extract JSON from first { to last } (handles extra text before/after)
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(jsonText);
}
```

### Updated Error Handling
```typescript
try {
  result = parseAIJson<ResultType>(responseText);
} catch (parseError) {
  console.error("Failed to parse AI response:", parseError, "Response:", responseText);
  return NextResponse.json(
    { error: "Failed to parse AI response" },
    { status: 500 }
  );
}
```

## Files Updated

1. ✅ `src/app/api/ai/edit-slide/route.ts`
2. ✅ `src/app/api/ai/generate-slide/route.ts`
3. ✅ `src/app/api/ai/edit-presentation/route.ts`
4. ✅ `src/app/api/ai/edit-presentation-stream/route.ts`

## Benefits

### Reliability
- Handles Gemini's markdown-wrapped responses
- Handles responses with extra text
- More robust than simple `JSON.parse()`

### Debugging
- Logs the actual response text when parsing fails
- Logs the parse error details
- Makes it easier to diagnose issues

### Compatibility
- Works with both Gemini and OpenAI responses
- Handles various response formats gracefully
- No breaking changes to existing functionality

## Testing

Test cases the parser handles:

1. **Clean JSON**: `{"title": "Test"}`
2. **Markdown fenced**: ` ```json\n{"title": "Test"}\n``` `
3. **With language tag**: ` ```json\n{"title": "Test"}\n``` `
4. **With extra text**: `Here's the result:\n{"title": "Test"}\nDone!`
5. **Mixed**: ` ```json\nHere's the JSON:\n{"title": "Test"}\n``` `

## Status
✅ **COMPLETE** - All AI agent routes now use robust JSON parsing that handles Gemini's response formats.

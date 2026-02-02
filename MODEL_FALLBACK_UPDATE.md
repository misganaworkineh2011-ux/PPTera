# AI Model Fallback Order Update

## Summary
Updated ALL AI endpoints to use **Gemini first**, then **OpenAI GPT-4o-mini** as fallback (changed from GPT-4o to GPT-4o-mini for cost efficiency).

## Changes Made

### 1. Outline Generation (src/app/api/generate-outline/stream/route.ts)
**Primary Generation Route (Streaming)**

#### Before:
- Primary: OpenAI GPT-4o (with web search)
- Fallback: Gemini Flash

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini** (with web search)

### 2. Content Transformation (src/lib/presentation/transform-outline-to-presentation.ts)
**Slide Content Generation**

#### Before:
- Primary: OpenAI GPT-4o-mini
- Fallback: Gemini Flash

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini**

### 3. AI Agent - Edit Slide (src/app/api/ai/edit-slide/route.ts)
**Single Slide Editing**

#### Before:
- Only OpenAI GPT-4o-mini (no fallback)

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini**

### 4. AI Agent - Generate Slide (src/app/api/ai/generate-slide/route.ts)
**Create New Slide**

#### Before:
- Only OpenAI GPT-4o-mini (no fallback)

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini**

### 5. AI Agent - Edit Presentation (src/app/api/ai/edit-presentation/route.ts)
**Bulk Presentation Editing**

#### Before:
- Only OpenAI GPT-4o-mini (no fallback)

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini**

### 6. AI Agent - Edit Presentation Stream (src/app/api/ai/edit-presentation-stream/route.ts)
**Streaming Presentation Editing**

#### Before:
- Only OpenAI GPT-4o-mini (no fallback)

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini**

### 7. AI Agent - Enhance Text (src/app/api/ai/enhance-text/route.ts)
**Text Enhancement (Improve, Shorten, Expand, etc.)**

#### Before:
- Only OpenAI GPT-4o-mini (no fallback)

#### After:
- Primary: **Gemini Flash** (gemini-flash-latest)
- Fallback: **OpenAI GPT-4o-mini**

## Implementation Details

All routes now follow this pattern:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

// Try Gemini first
if (gemini) {
  try {
    console.log("[route-name] Using Gemini API...");
    const model = gemini.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    });
    // ... use Gemini
  } catch (geminiError) {
    console.warn("[route-name] Gemini failed, falling back to OpenAI:", geminiError);
    // Fallback to OpenAI GPT-4o-mini
  }
} else {
  // No Gemini configured, use OpenAI
}
```

## Benefits

### Cost Savings
- Gemini Flash is more cost-effective than GPT-4o/4o-mini
- Reduces API costs across ALL AI features
- Better ROI on AI generation

### Performance
- Gemini Flash has higher token limits (14,000 vs 12,000)
- Faster response times in many cases
- Better for longer presentations and complex edits

### Reliability
- Maintains OpenAI as fallback for redundancy
- Using 4o-mini instead of 4o for fallback reduces costs
- Graceful degradation if Gemini fails

### Coverage
- **7 routes updated** (previously only 2 had Gemini support)
- All AI agent features now use Gemini first
- Consistent model priority across entire application

## Model Specifications

### Primary: Gemini Flash
- Model: `gemini-flash-latest`
- Max Output Tokens: 2,000-14,000 (depending on use case)
- Temperature: 0.7-1.0
- Response Format: JSON
- Cost: Lower than OpenAI

### Fallback: OpenAI GPT-4o-mini
- Model: `gpt-4o-mini`
- Max Output Tokens: 1,000-12,000 (depending on use case)
- Temperature: 0.7-1.0
- Features: Web search enabled (outline generation only)
- Cost: Lower than GPT-4o

## Testing Checklist

- [ ] Test outline generation with Gemini
- [ ] Test content transformation with Gemini
- [ ] Test slide editing with Gemini
- [ ] Test slide generation with Gemini
- [ ] Test presentation editing with Gemini
- [ ] Test streaming presentation editing with Gemini
- [ ] Test text enhancement with Gemini
- [ ] Verify fallback to OpenAI when Gemini fails
- [ ] Check cost metrics after deployment
- [ ] Monitor error rates for both providers

## Files Updated

1. ✅ `src/app/api/generate-outline/stream/route.ts`
2. ✅ `src/lib/presentation/transform-outline-to-presentation.ts`
3. ✅ `src/app/api/ai/edit-slide/route.ts`
4. ✅ `src/app/api/ai/generate-slide/route.ts`
5. ✅ `src/app/api/ai/edit-presentation/route.ts`
6. ✅ `src/app/api/ai/edit-presentation-stream/route.ts`
7. ✅ `src/app/api/ai/enhance-text/route.ts`

## Status
✅ **COMPLETE** - All AI endpoints now use Gemini first, OpenAI GPT-4o-mini as fallback.

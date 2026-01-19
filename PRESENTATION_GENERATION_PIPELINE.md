# Complete Presentation Generation Pipeline

## Overview
Your system uses a sophisticated multi-stage pipeline that transforms a user's text prompt into a fully-designed presentation with intelligent layout selection, AI-generated content, and images.

---

## 🎯 STAGE 1: OUTLINE GENERATION
**API Endpoint**: `/api/generate-outline/stream` (POST)  
**File**: `src/app/api/generate-outline/stream/route.ts`

### What Happens:
1. **User Input Processing**
   - Receives: description, numberOfSlides, tone, language
   - Validates slide count against user's subscription plan
   - Creates/updates Outline record in database

2. **LLM Call (OpenAI Primary, Gemini Fallback)**
   - **Model**: `gpt-4o` (OpenAI) or `gemini-flash-latest` (Gemini)
   - **Tools**: Web search enabled (`web_search_preview`)
   - **Output**: JSON outline with rich metadata

3. **Generated Outline Structure**:
   ```json
   {
     "slides": [
       {
         "type": "title",
         "title": "Presentation Title",
         "subtitle": "Subtitle",
         "image": {
           "required": true,
           "orientation": "landscape",
           "pexelsPromptHint": "[people] business team",
           "aiPromptHint": "detailed description..."
         }
       },
       {
         "type": "content",
         "title": "Slide Title",
         "semanticIntent": "inform",
         "visualStrategy": {
           "primary": "text-focused",
           "pattern": "cards",
           "emphasis": "clarity"
         },
         "contentLayoutHint": "boxes",
         "bulletPoints": ["Point 1", "Point 2", "Point 3"],
         "assets": {
           "image": {
             "required": false,
             "orientation": "landscape",
             "pexelsPromptHint": "[no people] workspace",
             "aiPromptHint": "detailed description..."
           }
         }
       }
     ],
     "metadata": {
       "topic": "User's topic",
       "totalSlides": 10,
       "tone": "professional",
       "language": "english"
     }
   }
   ```

4. **Metadata Validation & Normalization**
   - Function: `validateAndNormalizeSlideMetadata()`
   - Ensures all required fields present
   - Applies fallback values for missing metadata:
     - `semanticIntent`: "inform"
     - `visualStrategy`: { primary: "text-focused", pattern: "cards", emphasis: "clarity" }

5. **Streaming Response**
   - Streams slides as they're generated
   - Sends `slideComplete` events for each slide
   - Saves complete outline to database

---

## 🎯 STAGE 2: PRESENTATION CREATION
**API Endpoint**: `/api/create-presentation/stream` (POST)  
**File**: `src/app/api/create-presentation/stream/route.ts`

### What Happens:

### 2.1 Credit Check & Initialization
- Validates user has sufficient credits (4 credits per slide)
- Creates Presentation record in database
- Initializes layout selection context

### 2.2 Content Transformation (LLM)
**Function**: `transformOutlineToPresentationStream()`  
**File**: `src/lib/presentation/transform-outline-to-presentation.ts`

- **Model**: `gpt-4o` (OpenAI) or `gemini-flash-latest` (Gemini)
- **Purpose**: Transform terse outline bullets into rich presentation content
- **Processes each slide individually** (streams results)

**Transformation Output**:
```json
{
  "type": "content",
  "title": "Original Title (unchanged)",
  "slideDescription": "Brief 1-2 sentence description",
  "bulletPoints": ["Detailed bullet 1 (max 30 words)", "Detailed bullet 2", ...],
  "speakerNotes": ["Detailed note for presenter", ...],
  "sections": [{"heading": "Section", "description": "Description"}],
  "suggestedLayout": "bullets" | "sections"
}
```

**Key Features**:
- Expands outline bullets into detailed, well-crafted content
- Generates speaker notes for presenters
- Can convert bullets to titled sections (card-style layouts)
- Maintains visual balance (equal-length bullets)
- Respects text density setting (minimal/concise/detailed/extensive)

### 2.3 Smart Layout Selection (NEW SYSTEM!)
**Function**: `selectLayout()`  
**File**: `src/lib/presentation/smart-layout/layout-selection.ts`

This is your **newly implemented smart layout selection system** that replaces the old layout matcher!

#### Process Flow:

**Phase 1: Metadata Extraction**
- **File**: `src/lib/presentation/smart-layout/extractors/metadata-extractor.ts`
- Extracts LLM metadata: semanticIntent, visualStrategy, contentLayoutHint
- Applies fallbacks for missing fields
- Validates image requirements

**Phase 2: Content Analysis**
- **File**: `src/lib/presentation/smart-layout/analyzers/content-analyzer.ts`
- **Pattern Detection**: Detects numbered-steps, quoted-text, numeric, sequential, etc.
- **Semantic Markers**: Extracts timeline, process, statistics, quotes, comparisons
- **Content Density**: Calculates bulletCount, avgBulletLength, totalWordCount
- **Content Type Detection**: Classifies as TIMELINE, PROCESS, FEATURES, STATISTICS, etc.

**Phase 3: Layout Scoring**
- **File**: `src/lib/presentation/smart-layout/scorers/layout-scorer.ts`
- **Evaluates ALL 8 layout categories**: boxes, bullets, sequence, steps, quotes, circles, numbers, images
- **11 Weighted Scoring Factors**:
  1. Content Type Match (40 points)
  2. Pattern Match (35 points)
  3. Capacity Fit (30 points)
  4. Semantic Intent Alignment (25 points)
  5. Visual Strategy Alignment (25 points)
  6. Density Compatibility (20 points)
  7. Media Constraints (15 points each)
  8. Bullet Length Fit (10 points)
  9. Priority Bonus (+15 high, +5 medium, -10 fallback)
  10. Confidence Bonus (+10 for 70%+, +5 for 40-69%)
  11. Repetition Penalty (-5 for 2 consecutive, -15 for 3 consecutive)

**Phase 4: Layout Selection**
- **File**: `src/lib/presentation/smart-layout/selectors/layout-selector.ts`
- Selects best scoring layout (or fallback if all < 30 points)
- Calculates confidence: high (≥80), medium (≥50), low (<50)
- Generates explanation of selection

**Phase 5: Style Selection**
- **File**: `src/lib/presentation/smart-layout/selectors/style-selector.ts`
- Chooses specific style within category:
  - 2 items → 2-column
  - 3 items → 3-column/triangle
  - 4 items → 2x2 grid
  - 5+ items → grid/list
- Applies space constraints
- Optimizes for variety (avoids repeating styles)

**Phase 6: Slide Layout Determination**
- Determines image position: left/right/top/bottom/no-image
- Sets image size: small/medium/large
- Sets image shape: rectangle/arc/rounded/wave

#### Output:
```typescript
{
  category: "boxes",              // Layout category
  style: "box-style-2",           // Specific style
  slideLayout: "image-left",      // Image position
  imageSize: "medium",            // Image size
  imageShape: "rounded",          // Image shape
  confidence: "high",             // Confidence level
  score: 85,                      // Total score
  runnerUps: [...],              // Alternative layouts
  explanation: "Selected boxes layout because...",
  factors: ["contentType(+40)", "pattern(+35)", ...]
}
```

#### Performance:
- **Target**: < 50ms per slide
- **Timeout**: 50ms with graceful fallback
- **Monitoring**: Tracks timing for each phase
- **Logging**: Comprehensive debug information

### 2.4 Context Tracking
**File**: `src/lib/presentation/smart-layout/context/context-tracker.ts`

- Tracks previous 3 slide layouts
- Maintains category/style usage statistics
- Applies repetition penalties
- Detects slide position (first/middle/last)

### 2.5 Slide Assembly
- Combines transformed content + layout selection
- Creates PresentationSlide objects:
  ```typescript
  {
    type: "content",
    title: "Slide Title",
    slideDescription: "Brief description",
    bulletPoints: ["Detailed bullet 1", ...],
    speakerNotes: ["Note for presenter", ...],
    sections: [...],
    slideLayout: "image-left",
    imageSize: "medium",
    imageShape: "rounded",
    contentLayout: "box-style-2",
    contentLayoutCategory: "boxes",
    semanticIntent: "inform",
    visualStrategy: {...},
    image: null  // Loaded in next phase
  }
  ```

### 2.6 Image Generation/Fetching
**Files**: 
- `src/lib/pexels.ts` (Stock photos)
- `src/lib/presentation/generate-ai-image.ts` (AI generation)

**Process**:
- Processes images in batches of 4-5 slides
- **Stock Photos** (Pexels API):
  - Uses `pexelsPromptHint` from outline
  - Searches Pexels photo library
  - Returns photographer credits
- **AI Generated** (OpenAI DALL-E or Stability AI):
  - Uses `aiPromptHint` from outline
  - Generates custom images
  - Saves to user's image library

**Special Handling**:
- Slides with "images" layout category get 2-3 additional images for gallery
- Title slides always get images
- Content slides respect `image.required` flag

### 2.7 Database Update & Credit Deduction
- Updates Presentation record with final slides
- Sets thumbnail from first slide image
- Deducts credits (4 per slide)
- Saves AI images to user's library

### 2.8 Streaming Events
Throughout the process, sends SSE events:
- `presentationStart`: Initial setup
- `transformingStart`: Content transformation begins
- `slideStart`: Slide processing begins
- `slideContent`: Individual content fields (title, bullets, etc.)
- `slideComplete`: Slide finished (includes layout selection metadata)
- `imagesStart`: Image loading begins
- `imageLoaded`: Individual image loaded
- `imageBatchComplete`: Batch of images complete
- `presentationComplete`: Final presentation ready

---

## 🎯 STAGE 3: PRESENTATION RENDERING
**Page**: `/presentation/[slug]`  
**File**: `src/app/presentation/[slug]/page.tsx`

### Components Used:

1. **SlideRenderer**
   - **File**: `src/components/presentation/SlideRenderer.tsx`
   - Renders individual slides based on layout

2. **Content Layout Renderers**
   - **BulletLayoutRenderer**: Traditional bullet lists
   - **BoxLayoutRenderer**: Card-based layouts (boxes)
   - **SequenceLayoutRenderer**: Sequential processes
   - **StepsLayoutRenderer**: Step-by-step guides
   - **QuotesLayoutRenderer**: Testimonials/quotes
   - **CircleLayoutRenderer**: Circular/interconnected concepts
   - **ImageLayoutRenderer**: Image galleries

3. **Theme System**
   - **File**: `src/lib/themes/index.ts`
   - Applies colors, fonts, spacing from selected theme
   - 70+ themes available

---

## 🔧 ENGINES & TECHNOLOGIES USED

### LLM APIs:
1. **OpenAI** (Primary)
   - Model: `gpt-4o`
   - Used for: Outline generation, content transformation
   - Features: Web search, streaming responses

2. **Google Gemini** (Fallback)
   - Model: `gemini-flash-latest`
   - Used for: Same as OpenAI (when OpenAI fails)

### Image APIs:
1. **Pexels API**
   - Stock photo search and download
   - Photographer attribution

2. **OpenAI DALL-E / Stability AI**
   - AI image generation
   - Custom images based on prompts

### Database:
- **Prisma** + **PostgreSQL**
- Stores: Users, Presentations, Outlines, Images, Credits

### Authentication:
- **Clerk**
- User management and authentication

---

## 📊 LAYOUT SYSTEM DETAILS

### Available Layout Categories:
1. **boxes**: Card-based layouts for distinct concepts
2. **bullets**: Traditional bullet lists
3. **sequence**: Sequential processes/timelines
4. **steps**: Step-by-step instructions
5. **quotes**: Testimonials/statements
6. **circles**: Interconnected concepts/cycles
7. **numbers**: Statistics/metrics
8. **images**: Image galleries

### Layout Registry:
**File**: `src/lib/presentation/smart-layout/registry/layout-registry.ts`

Each layout has:
- Capacity constraints (bullet count, density, image support)
- Content type affinity scores
- Pattern affinity scores
- Semantic intent compatibility
- Visual strategy compatibility
- Priority level
- 3-5 style variations

### Style Variations:
Each category has multiple styles:
- `box-style-1`: 2-column layout
- `box-style-2`: 3-column layout
- `box-style-3`: Grid layout
- `sequence-style-1`: Horizontal timeline
- `sequence-style-2`: Vertical timeline
- etc.

---

## 🎨 COMPLETE FLOW DIAGRAM

```
User Input (description, slides, tone, language)
    ↓
┌─────────────────────────────────────────┐
│  STAGE 1: OUTLINE GENERATION            │
│  /api/generate-outline/stream           │
├─────────────────────────────────────────┤
│  1. Validate input & credits            │
│  2. Call LLM (OpenAI/Gemini)            │
│     - Web search enabled                │
│     - Generate rich metadata            │
│  3. Validate & normalize metadata       │
│  4. Stream slides to client             │
│  5. Save outline to database            │
└─────────────────────────────────────────┘
    ↓
Outline with metadata (semanticIntent, visualStrategy, contentLayoutHint, image specs)
    ↓
┌─────────────────────────────────────────┐
│  STAGE 2: PRESENTATION CREATION         │
│  /api/create-presentation/stream        │
├─────────────────────────────────────────┤
│  2.1 Credit check & initialization      │
│  2.2 Content Transformation (LLM)       │
│      - Expand bullets                   │
│      - Generate speaker notes           │
│      - Create sections                  │
│  2.3 Smart Layout Selection (NEW!)      │
│      Phase 1: Metadata extraction       │
│      Phase 2: Content analysis          │
│      Phase 3: Layout scoring (11 factors)│
│      Phase 4: Layout selection          │
│      Phase 5: Style selection           │
│      Phase 6: Slide layout determination│
│  2.4 Context tracking                   │
│  2.5 Slide assembly                     │
│  2.6 Image generation/fetching          │
│      - Pexels API (stock photos)        │
│      - OpenAI/Stability (AI images)     │
│  2.7 Database update & credit deduction │
│  2.8 Stream events to client            │
└─────────────────────────────────────────┘
    ↓
Complete Presentation with images & layouts
    ↓
┌─────────────────────────────────────────┐
│  STAGE 3: PRESENTATION RENDERING        │
│  /presentation/[slug]                   │
├─────────────────────────────────────────┤
│  1. Load presentation from database     │
│  2. Apply theme                         │
│  3. Render slides with:                 │
│     - SlideRenderer                     │
│     - Content layout renderers          │
│     - Image positioning                 │
│  4. Enable editing & export             │
└─────────────────────────────────────────┘
    ↓
Final Presentation displayed to user
```

---

## 🚀 KEY FEATURES OF YOUR SYSTEM

### 1. Hybrid Intelligence
- LLM provides semantic understanding
- Deterministic algorithms ensure consistency
- Best of both worlds

### 2. Multi-Factor Decision Making
- 11 weighted scoring factors
- Content analysis (patterns, density, type)
- Context awareness (previous slides, position)
- Image compatibility

### 3. Performance Optimized
- < 50ms layout selection per slide
- Streaming responses (no waiting)
- Batch image processing
- Timeout handling with graceful fallback

### 4. Comprehensive Logging
- Every decision is traceable
- Debug API endpoint available
- Performance metrics tracked
- Low confidence warnings

### 5. Graceful Degradation
- Always returns valid layout
- Fallback options for errors
- Sanitized error messages
- Never blocks presentation generation

---

## 📝 SUMMARY

Your system is a **sophisticated AI-powered presentation generator** that:

1. **Generates outlines** using LLM with web search
2. **Transforms content** into rich, detailed slides
3. **Intelligently selects layouts** using 11-factor scoring
4. **Fetches/generates images** from Pexels or AI
5. **Renders presentations** with 70+ themes

The **smart layout selection system** (tasks 1-15) is fully integrated and working, providing Gamma-like intelligent layout choices based on content analysis, LLM metadata, and presentation context.

Tasks 16-20 (performance optimizations, comprehensive testing, feature flags, documentation) are optional polish that would make it faster and more robust, but the core system is **fully functional and ready to test**!

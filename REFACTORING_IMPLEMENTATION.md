# Refactoring Implementation Guide

This guide provides step-by-step instructions for executing the refactoring plan.

## Quick Start Checklist

Before starting Phase 1:
- [ ] Read and understand `REFACTORING_PLAN.md`
- [ ] Create a new branch: `git checkout -b refactor/phase1-presentation-viewer`
- [ ] Backup current state: `git stash`
- [ ] Ensure all tests pass: `npm test`
- [ ] Document current file structure baseline

---

## Phase 1 Detailed Implementation

### Step 1.1: Extract Types from PresentationViewer.tsx

**Duration:** 1-2 hours  
**Complexity:** Low

#### Files to Create
```
src/app/presentation/[slug]/types.ts
```

#### Instructions

1. Open `src/app/presentation/[slug]/PresentationViewer.tsx`
2. Identify all interfaces and types:
   - `CustomThemeData`
   - `PresentationViewerProps`
   - Any other interfaces defined before the component

3. Create new file `types.ts`:
   ```typescript
   // Interface definitions from PresentationViewer
   export interface CustomThemeData {
     id: string;
     name: string;
     colors: unknown;
     fonts?: unknown;
     designElements?: unknown;
   }

   export interface PresentationViewerProps {
     presentation: PresentationData;
     mode: string;
     isOwner: boolean;
     // ... rest of props
   }

   // Import other shared types
   export type {
     SlideData,
     PresentationData,
     EditingState,
   } from "~/components/presentation/types";
   ```

4. Update `PresentationViewer.tsx`:
   ```typescript
   import { type PresentationViewerProps, type CustomThemeData } from "./types";
   ```

5. Remove type definitions from `PresentationViewer.tsx`

**Verification:**
```bash
npm run type-check
# Should have no errors
```

---

### Step 1.2: Extract Utility Functions

**Duration:** 2-3 hours  
**Complexity:** Medium

#### Files to Create
```
src/app/presentation/[slug]/utils/
├── title-utils.ts
├── streaming-utils.ts
├── export-utils.ts
├── animation-utils.ts
└── index.ts
```

#### Instructions

##### 1.2.1 Create `title-utils.ts`
```typescript
// src/app/presentation/[slug]/utils/title-utils.ts

export function stripHtml(html: string): string {
  // Copy implementation from PresentationViewer
}

export type ThemeType = "dark" | "light" | "sunset" | /* ... */;

export function getTitleSlideColors(
  themeType: ThemeType,
  hasImage: boolean
): { title: string; subtitle: string } {
  // Copy implementation from PresentationViewer
}
```

##### 1.2.2 Create `streaming-utils.ts`
```typescript
// src/app/presentation/[slug]/utils/streaming-utils.ts

export interface StreamingEventData {
  totalSlides: number;
  slideIndex: number;
  // ... other fields
}

export function parseStreamingEvent(data: string): StreamingEventData {
  // Helper to parse streaming events
}

export function buildStreamingText(
  currentText: string,
  newChar: string
): string {
  return currentText + newChar;
}

// ... other streaming helpers
```

##### 1.2.3 Create `export-utils.ts`
```typescript
// src/app/presentation/[slug]/utils/export-utils.ts

export function validateExportFormat(format: "pdf" | "pptx" | "images") {
  // Validation logic
}

export function getExportFileName(
  presentationTitle: string,
  format: string
): string {
  return `${presentationTitle}.${format}`;
}

// ... other export helpers
```

##### 1.2.4 Create `animation-utils.ts`
```typescript
// src/app/presentation/[slug]/utils/animation-utils.ts

export function getAnimationDuration(type: string): number {
  // Return animation duration based on type
}

export function calculateTransitionDelay(index: number): number {
  // Calculate delay for staggered animations
}

// ... other animation helpers
```

##### 1.2.5 Create `index.ts`
```typescript
// src/app/presentation/[slug]/utils/index.ts
export * from "./title-utils";
export * from "./streaming-utils";
export * from "./export-utils";
export * from "./animation-utils";
```

#### Update PresentationViewer.tsx
```typescript
// Before
const stripHtml = (html: string): string => {
  // ... implementation
};

// After
import { stripHtml, getTitleSlideColors } from "./utils";
```

**Verification:**
```bash
npm run type-check
# Run specific component tests if available
```

---

### Step 1.3: Extract Custom Hooks

**Duration:** 2-3 hours  
**Complexity:** Medium

#### Files to Create
```
src/app/presentation/[slug]/hooks/
├── usePresentationState.ts
├── usePresentationStreaming.ts
└── index.ts
```

#### Instructions

##### 1.3.1 Create `usePresentationState.ts`
```typescript
// src/app/presentation/[slug]/hooks/usePresentationState.ts
import { useState, useCallback } from "react";
import { type SlideData, type EditingState } from "~/components/presentation/types";

export interface PresentationState {
  currentSlide: number;
  isFullscreen: boolean;
  isAnimating: boolean;
  isShaking: boolean;
  showShareModal: boolean;
  showThemeSidebar: boolean;
  showAgentPanel: boolean;
  isMobile: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  showPageNumbers: boolean;
  currentThemeId: string;
  showThumbnails: boolean;
  viewMode: "slides" | "scroll";
  // ... other state fields
}

export function usePresentationState(initialThemeId: string) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // ... other states

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // ... other handlers

  return {
    currentSlide,
    setCurrentSlide,
    goToSlide,
    isFullscreen,
    toggleFullscreen,
    // ... other state and handlers
  };
}
```

##### 1.3.2 Create `usePresentationStreaming.ts`
```typescript
// src/app/presentation/[slug]/hooks/usePresentationStreaming.ts
import { useState, useEffect, useRef } from "react";
import { type SlideData } from "~/components/presentation/types";

export function usePresentationStreaming(
  presentationId: string,
  isStreaming: boolean
) {
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "complete">(
    isStreaming ? "loading" : "idle"
  );
  const [slidesData, setSlidesData] = useState<SlideData[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isStreaming || status !== "loading") return;

    // Setup EventSource connection
    const eventSource = new EventSource(
      `/api/presentations/${presentationId}/stream-content`
    );

    eventSourceRef.current = eventSource;

    // Handle events
    eventSource.onopen = () => {
      console.log("[Streaming] Connection opened");
    };

    eventSource.addEventListener("start", (e) => {
      const data = JSON.parse(e.data);
      setStatus("streaming");
      setSlidesData([]);
    });

    // ... other event handlers

    return () => {
      eventSource.close();
    };
  }, [presentationId, isStreaming, status]);

  return {
    status,
    slidesData,
    setSlidesData,
  };
}
```

##### 1.3.3 Create `index.ts`
```typescript
// src/app/presentation/[slug]/hooks/index.ts
export { usePresentationState } from "./usePresentationState";
export { usePresentationStreaming } from "./usePresentationStreaming";
```

#### Update PresentationViewer.tsx
```typescript
import { usePresentationState, usePresentationStreaming } from "./hooks";

export default function PresentationViewer(props: PresentationViewerProps) {
  const state = usePresentationState(props.presentation.content.theme);
  const streaming = usePresentationStreaming(
    props.presentation.id,
    props.isStreaming
  );
  
  // Component logic now uses state and streaming hooks
}
```

**Verification:**
```bash
npm run type-check
npm test -- PresentationViewer
```

---

### Step 1.4: Create Sub-Components

**Duration:** 3-4 hours  
**Complexity:** Medium-High

#### Files to Create
```
src/app/presentation/[slug]/components/
├── PresentationHeader.tsx      (extracted from Header.tsx)
├── NavigationControls.tsx      (extracted)
├── SlidePanel.tsx              (extracted)
├── EditingPanel.tsx            (extracted)
└── index.ts
```

#### Instructions

##### 1.4.1 Create `PresentationHeader.tsx`
```typescript
// src/app/presentation/[slug]/components/PresentationHeader.tsx
import React from "react";
import type { PresentationData } from "~/components/presentation/types";

interface PresentationHeaderProps {
  presentation: PresentationData;
  isOwner: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  onTitleEdit: (title: string) => void;
  onSave: () => void;
  onExport: () => void;
  // ... other props
}

export function PresentationHeader({
  presentation,
  isOwner,
  isEditingTitle,
  editedTitle,
  onTitleEdit,
  onSave,
  onExport,
  // ... other props
}: PresentationHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      {/* Header content extracted from PresentationViewer */}
    </header>
  );
}
```

Repeat for other sub-components.

#### Update PresentationViewer.tsx
Replace inline header/controls JSX with:
```typescript
<PresentationHeader
  presentation={presentation}
  isOwner={isOwner}
  isEditingTitle={isEditingTitle}
  editedTitle={editedTitle}
  onTitleEdit={setEditedTitle}
  onSave={handleSave}
  onExport={() => setShowExportModal(true)}
/>
```

---

### Step 1.5: Verify and Test

**Checklist:**
- [ ] All types extract with no TypeScript errors
- [ ] All utils functions work independently
- [ ] All hooks compile without errors
- [ ] PresentationViewer.tsx is now < 3000 lines
- [ ] No circular dependencies
- [ ] Component still renders in browser
- [ ] All existing features work (test manually)
- [ ] No console errors

**Test Command:**
```bash
npm run type-check
npm run build
npm test
```

---

## Phase 1 Completion Criteria

- [ ] `PresentationViewer.tsx` reduced to ~2,500 lines
- [ ] All types in `types.ts`
- [ ] All utils in `utils/` folder
- [ ] All hooks in `hooks/` folder
- [ ] 4-5 sub-components created
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Presentation viewer still fully functional
- [ ] Git commit: `refactor(presentation): extract types, utils, hooks, and sub-components`

---

## Phase 2 Instructions

Follow similar pattern for:
- [ ] Extract from `CreatePresentationClient.tsx`
- [ ] Extract from `Header.tsx`
- [ ] Split translation files
- [ ] Reorganize layout renderers

Each phase should follow the same extraction pattern:
1. Create new directory/files
2. Move code (with proper imports)
3. Update original file to use extracted modules
4. Test thoroughly
5. Commit

---

## Code Review Checklist

When reviewing extracted code:
- [ ] No circular dependencies
- [ ] All imports are correct
- [ ] Types are properly exported
- [ ] No unused imports
- [ ] Consistent naming conventions
- [ ] JSDoc comments for public APIs
- [ ] No console.logs left
- [ ] Tests included for new utilities
- [ ] No performance regressions

---

## Common Pitfalls to Avoid

1. **Circular Dependencies**
   - Be careful with shared utils importing components
   - Solution: Keep utils pure (no component imports)

2. **Forgotten Imports**
   - Search for function names across files after extraction
   - Use IDE refactoring tools

3. **Type Mismatches**
   - Run `npm run type-check` frequently
   - Don't ignore TypeScript errors

4. **Breaking Changes**
   - Maintain backward compatibility when extracting
   - Update tests alongside code changes

5. **Over-Extraction**
   - Don't create files with < 50 lines
   - Balance between modularity and maintainability

---

## Performance Monitoring

Track these metrics before and after refactoring:

```typescript
// pages/_app.tsx or layout.tsx
import { performance } from 'perf_hooks';

console.time('PresentationViewer-render');
// ... component renders
console.timeEnd('PresentationViewer-render');

// Check bundle size
npm run build
# Review .next/static/chunks/
```

---

## Questions During Refactoring?

1. **Where should this function go?**
   - If it's used by multiple components: `lib/utils/`
   - If it's specific to a feature: `features/feature-name/utils/`
   - If it's a hook: `hooks/`

2. **Should I create a new file?**
   - Yes if it's > 50 lines or used in multiple places
   - No if it's < 50 lines and used in only one place

3. **How do I handle state in extracted components?**
   - Use props to pass state from container
   - Use custom hooks for shared state logic
   - Use Context API for deeply nested props

4. **Do I need to update tests?**
   - Yes, update existing tests
   - Add new tests for extracted utilities
   - Aim for >80% coverage on new code

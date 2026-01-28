# Comprehensive Codebase Refactoring Plan

**Date:** January 26, 2026  
**Goal:** Reduce file sizes below 1000 lines, improve maintainability, and establish clear architectural patterns.

---

## Executive Summary

### Current State
- **Largest File:** `translations.ts` (9,629 lines)
- **Most Complex:** `PresentationViewer.tsx` (5,884 lines) - **Critical**
- **Total Large Files:** 9 files exceeding 1000 lines
- **Primary Issues:**
  - God Components mixing rendering, state, and business logic
  - Massive monolithic translation files
  - Scattered duplicate utility functions
  - Inconsistent layout renderer organization
  - Mixed concerns in feature components

### Target State
- **All files:** < 1000 lines
- **Clear separation of concerns:** Components, Containers, Utilities, Types
- **Centralized utilities:** No duplicate functions
- **Consistent patterns:** All layout renderers follow same structure
- **Modular architecture:** Easy to test, extend, and maintain

---

## Phase 1: Critical Refactoring (P0 - Do First)

### 1.1 Extract from `PresentationViewer.tsx` (5,884 lines)

**File:** `src/app/presentation/[slug]/PresentationViewer.tsx`

#### Current Issues
- Contains 50+ helper functions mixed with JSX
- Handles slides rendering, animations, streaming, editing, exporting all in one file
- Types defined inline (should be in `types.ts`)
- Components inlined (should be extracted)

#### Refactoring Plan

##### Step 1a: Extract All Types → `types.ts`
Move all interfaces to `src/app/presentation/[slug]/types.ts`:
- `CustomThemeData`
- `PresentationViewerProps`
- `EditingState` (already exists, consolidate references)
- `ImageBlock` (already exists, consolidate references)
- Any other inline types

**Impact:** Reduces PresentationViewer by ~50 lines, improves type reusability

##### Step 1b: Extract Helper Functions → Separate Utility Files

Create `src/app/presentation/[slug]/utils/`:
- `title-utils.ts`: `stripHtml()`, `getTitleSlideColors()`
- `streaming-utils.ts`: All streaming-related helpers (event handling, text building)
- `export-utils.ts`: All export-related helpers
- `animation-utils.ts`: Animation and transition helpers
- `theme-utils.ts`: Theme-related helpers (already exists in lib, consolidate)

**Each file:** Keep under 300 lines, export named functions

##### Step 1c: Extract Hook → Custom Hook
Create `src/app/presentation/[slug]/hooks/usePresentationStreaming.ts`
- Handles EventSource subscription
- Manages streaming state
- Returns: `{ status, slides, isComplete }`

Create `src/app/presentation/[slug]/hooks/usePresentationState.ts`
- Manages: current slide, zoom, animations, editing state
- Returns structured state object

**Impact:** Reduces PresentationViewer from 5,884 → ~2,500 lines

##### Step 1d: Split Main Component into Container + Sub-Components
Rename `PresentationViewer.tsx` → `PresentationViewerContainer.tsx`
- Handles all state management and API calls
- Composes sub-components

Create `PresentationViewerUI.tsx`
- Pure presentation component (no hooks)
- Takes state + callbacks as props
- Renders layout structure

Create sub-components folder:
```
src/app/presentation/[slug]/components/
  PresentationHeader.tsx       (500 lines)
  PresentationControls.tsx     (400 lines)
  SlidesPanel.tsx              (300 lines)
  SlideEditingPanel.tsx        (400 lines)
  FullscreenMode.tsx           (300 lines)
```

**Impact:** Reduces component complexity, improves testability

---

### 1.2 Extract from `CreatePresentationClient.tsx` (1,994 lines)

**File:** `src/components/createpresentation/CreatePresentationClient.tsx`

#### Current Issues
- Handles wizard state, API calls, file uploads, credit validation
- Contains form rendering and preview rendering mixed
- Business logic scattered throughout

#### Refactoring Plan

##### Step 2a: Extract Hooks
Create `src/components/createpresentation/hooks/`:
- `useCreationWizard.ts`: Wizard step management + form state
- `useFileUpload.ts`: File upload logic, validation, progress
- `useUserCredits.ts`: Credit checks, plan limits
- `usePresentationPreview.ts`: Preview generation and caching

##### Step 2b: Extract Business Logic
Create `src/components/createpresentation/services/`:
- `presentationService.ts`: Create/update presentation API calls
- `creditsService.ts`: Credit calculations and checks
- `validationService.ts`: Form and file validation

##### Step 2c: Extract Components
Create `src/components/createpresentation/steps/`:
- `SourceSelectStep.tsx` (300 lines)
- `OutlineReviewStep.tsx` (400 lines)
- `DetailsFormStep.tsx` (350 lines)
- `ConfirmationStep.tsx` (200 lines)

Refactor `CreatePresentationClient.tsx`:
```tsx
export default function CreatePresentationClient() {
  const { step, data, nextStep, prevStep } = useCreationWizard();
  
  return (
    <WizardLayout>
      {step === 'source' && <SourceSelectStep onNext={nextStep} />}
      {step === 'review' && <OutlineReviewStep onNext={nextStep} />}
      {step === 'details' && <DetailsFormStep onNext={nextStep} />}
      {step === 'confirm' && <ConfirmationStep />}
    </WizardLayout>
  );
}
```

**Impact:** Reduces from 1,994 → ~400 lines (orchestration only)

---

### 1.3 Extract from `Header.tsx` (1,282 lines)

**File:** `src/app/presentation/[slug]/components/Header.tsx`

#### Current Issues
- Handles sharing, exporting, collaboration, embedding in one file
- Mix of UI, state, and API logic

#### Refactoring Plan

Create `src/app/presentation/[slug]/components/header/`:
```
Header.tsx                    (200 lines - main orchestration)
├── ShareSection.tsx          (250 lines)
├── ExportSection.tsx         (300 lines)
├── CollaborationSection.tsx  (200 lines)
└── EmbedSection.tsx          (150 lines)
```

Each section manages its own state and API calls.

**Impact:** Reduces from 1,282 → ~200 lines (orchestration)

---

## Phase 2: High Priority Refactoring (P1)

### 2.1 Refactor Translation Files (9,629 + 5,166 lines)

**Files:**
- `src/lib/translations.ts` (9,629 lines)
- `src/lib/dashboard-translations.ts` (5,166 lines)

#### Problem
- Monolithic files make merging, testing, and localization difficult
- Hard to find specific translations
- All translations loaded at once (performance)

#### Solution
Split into modular structure:

```
src/lib/i18n/
├── index.ts                         (imports and exports all)
├── common/
│   ├── shared.ts                    (common UI labels)
│   ├── navigation.ts                (menu, nav labels)
│   └── messages.ts                  (success, error, info messages)
├── features/
│   ├── presentation.ts              (slide, theme, export labels)
│   ├── creation.ts                  (wizard, form labels)
│   ├── dashboard.ts                 (dashboard, settings labels)
│   ├── sharing.ts                   (collaboration labels)
│   └── auth.ts                      (signup, signin labels)
├── languages/
│   ├── en.ts
│   ├── es.ts
│   ├── fr.ts
│   └── ... (other languages)
└── types.ts                         (TranslationKey types)
```

Each file: ~300-400 lines max

**Impact:**
- Easier maintenance and merging
- Better code organization
- Improved IDE autocomplete
- Reduced bundle size with code splitting

---

### 2.2 Organize Layout Renderers (Multiple files 1,000+ lines)

**Files affected:**
- `BulletLayoutRenderer.tsx` (1,211 lines)
- `TimelineLayoutRenderer.tsx` (1,154 lines)
- `ComparisonLayoutRenderer.tsx` (1,130 lines)
- Others in `src/components/presentation/layouts/`

#### Problem
- Each renderer contains complete implementation with inline styles
- Duplicated patterns across renderers
- Inconsistent structure

#### Solution
Create consistent layout structure:

```
src/components/presentation/layouts/
├── index.ts                         (exports all layout renderers)
├── base/
│   ├── BaseLayout.tsx              (common wrapper, shared logic)
│   ├── useLayoutState.ts           (shared state management)
│   └── layoutUtils.ts              (getDimensions, calculatePosition, etc.)
├── bullet/
│   ├── BulletLayout.tsx            (main, ~300 lines)
│   ├── BulletPoint.tsx             (sub-component, ~100 lines)
│   └── bulletLayoutUtils.ts        (helpers)
├── timeline/
│   ├── TimelineLayout.tsx          (main, ~300 lines)
│   ├── TimelineNode.tsx            (sub-component, ~100 lines)
│   └── timelineLayoutUtils.ts      (helpers)
├── comparison/
│   ├── ComparisonLayout.tsx        (main, ~300 lines)
│   ├── ComparisonColumn.tsx        (sub-component, ~100 lines)
│   └── comparisonLayoutUtils.ts    (helpers)
├── steps/
│   ├── StepsLayout.tsx             (main)
│   ├── StepCard.tsx                (sub-component)
│   └── stepsLayoutUtils.ts
└── ... (other layout types)
```

**Pattern for Each Layout:**
```tsx
// LayoutName/LayoutNameLayout.tsx
export function XyzLayout(props: XyzLayoutProps) {
  const state = useLayoutState(props);
  
  return (
    <BaseLayout {...props}>
      {/* Layout-specific rendering using utilities */}
      {renderLayout(state)}
    </BaseLayout>
  );
}

// LayoutName/subComponent.tsx
function SubComponent(props: SubComponentProps) {
  return <div>{/* Simple component logic */}</div>;
}

// LayoutName/utils.ts
export function renderLayout(state: LayoutState) {
  // Layout-specific rendering logic
}
```

**Impact:**
- Each layout renderer: ~300 lines max
- Clear, consistent structure
- Easier to test and extend
- Better code reuse

---

### 2.3 Extract Common Components

**Create:** `src/components/presentation/common/`

Extract repeated components:
- `SlideImage.tsx` (image handling, resizing, fallbacks)
- `EditableText.tsx` (inline text editing)
- `ShapeBox.tsx` (themed card/box wrapper)
- `AnimationWrapper.tsx` (animation orchestration)
- `ContentGrid.tsx` (common grid patterns)

**Impact:** Reduces duplication, easier to maintain visual consistency

---

## Phase 3: Medium Priority Refactoring (P2)

### 3.1 Centralize Utility Functions

**Duplicate `isColorDark()` function** found in 10+ files:
- `ui-colors.ts`
- `custom-theme-utils.ts`
- `ExportModal.tsx`
- `FeedbackSection.tsx`
- Others...

**Solution:** Centralize in `src/lib/utils/color.ts`
```typescript
export function isColorDark(hex: string): boolean { ... }
export function getContrastColor(hex: string): string { ... }
export function hexToRgba(hex: string, alpha: number): string { ... }
```

Replace all 10+ occurrences with imports from this module.

**Impact:** ~50 lines of duplicate code eliminated, single source of truth

---

### 3.2 Extract Theme Components

**Current:** Theme logic scattered across:
- `ThemeSidebar.tsx`
- `lib/themes/`
- Multiple layout renderers

**Solution:**
```
src/components/presentation/theme/
├── ThemeSelector.tsx        (theme selection UI)
├── ThemePreview.tsx         (preview rendering)
├── ThemeCustomizer.tsx      (customization UI - if applicable)
└── themeHelpers.ts          (shared theme utilities)
```

---

## Phase 4: Architectural Cleanup (P3)

### 4.1 Establish Clear Directory Structure

Target structure:
```
src/
├── app/
│   ├── presentation/
│   │   ├── [slug]/
│   │   │   ├── PresentationViewerContainer.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   ├── usePresentationState.ts
│   │   │   │   ├── usePresentationStreaming.ts
│   │   │   │   └── useExport.ts
│   │   │   ├── utils/
│   │   │   │   ├── title-utils.ts
│   │   │   │   ├── streaming-utils.ts
│   │   │   │   ├── export-utils.ts
│   │   │   │   └── animation-utils.ts
│   │   │   └── components/
│   │   │       ├── header/
│   │   │       ├── PresentationUI.tsx
│   │   │       ├── SlidesPanel.tsx
│   │   │       └── EditingPanel.tsx
│   ├── createpresentation/
│   │   ├── CreatePresentationClient.tsx
│   │   ├── hooks/
│   │   │   ├── useCreationWizard.ts
│   │   │   ├── useFileUpload.ts
│   │   │   └── useUserCredits.ts
│   │   ├── services/
│   │   │   ├── presentationService.ts
│   │   │   ├── creditsService.ts
│   │   │   └── validationService.ts
│   │   └── steps/
│   │       ├── SourceSelectStep.tsx
│   │       ├── OutlineReviewStep.tsx
│   │       ├── DetailsFormStep.tsx
│   │       └── ConfirmationStep.tsx
│
├── components/
│   ├── presentation/
│   │   ├── layouts/
│   │   │   ├── base/
│   │   │   ├── bullet/
│   │   │   ├── timeline/
│   │   │   ├── comparison/
│   │   │   └── ... (other layouts)
│   │   ├── common/
│   │   │   ├── SlideImage.tsx
│   │   │   ├── EditableText.tsx
│   │   │   └── ShapeBox.tsx
│   │   ├── modals/
│   │   │   ├── ShareModal/
│   │   │   ├── ExportModal/
│   │   │   └── ChartModal/
│   │   └── theme/
│   │       ├── ThemeSelector.tsx
│   │       ├── ThemePreview.tsx
│   │       └── themeHelpers.ts
│   ├── dashboard/
│   │   ├── DashboardContainer.tsx
│   │   └── sections/
│   │       ├── PresenterView.tsx
│   │       ├── TemplatesView.tsx
│   │       └── SettingsView.tsx
│   └── ui/
│       └── (shadcn-ui components, reusable atoms)
│
├── lib/
│   ├── utils/
│   │   ├── color.ts              (centralized color utilities)
│   │   ├── string.ts             (text utilities)
│   │   ├── math.ts               (calculations)
│   │   └── validators.ts         (validation functions)
│   ├── i18n/                     (split translations)
│   ├── themes/                   (existing theme system)
│   ├── hooks/
│   │   ├── useAsync.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   └── services/                 (API/external service calls)
│       ├── api/
│       ├── auth/
│       └── analytics/
│
└── types/
    ├── presentation.ts           (presentation-related types)
    ├── theme.ts                  (theme-related types)
    ├── user.ts                   (user/auth types)
    └── index.ts                  (re-exports all)
```

---

## Implementation Roadmap

### Week 1: Phase 1 (Critical)
**Days 1-2:** Extract from `PresentationViewer.tsx`
- Extract types
- Extract utilities
- Extract hooks
- Create sub-components

**Days 3-4:** Extract from `CreatePresentationClient.tsx`
- Create hooks
- Extract services
- Split into step components

**Day 5:** Extract from `Header.tsx` and sub-components

### Week 2: Phase 2 (High Priority)
**Days 1-2:** Refactor translation files (split into modules)

**Days 3-4:** Reorganize layout renderers
- Establish base pattern
- Refactor bullet layout
- Refactor timeline layout
- Refactor comparison layout

**Day 5:** Extract common components

### Week 3: Phase 3 (Medium Priority)
**Days 1-2:** Centralize utilities (color, string, math)

**Days 3-5:** Extract theme components, audit all other files

### Week 4: Phase 4 (Architecture)
**Days 1-5:** Complete directory restructuring, migration, testing

---

## Testing Strategy

For each refactored module:

1. **Unit Tests:** Test extracted utilities and hooks
   ```typescript
   // __tests__/utils/title-utils.test.ts
   describe('getTitleSlideColors', () => {
     it('should return correct colors for dark theme', () => { ... });
     it('should return correct colors for light theme with image', () => { ... });
   });
   ```

2. **Component Tests:** Test extracted components in isolation
   ```typescript
   // __tests__/components/BulletLayout.test.tsx
   describe('BulletLayout', () => {
     it('should render bullet points correctly', () => { ... });
     it('should handle editing state', () => { ... });
   });
   ```

3. **Integration Tests:** Test component interactions
   ```typescript
   // __tests__/PresentationViewer.integration.test.tsx
   describe('PresentationViewer', () => {
     it('should change slides correctly', () => { ... });
     it('should export presentation', () => { ... });
   });
   ```

4. **Regression Tests:** Ensure existing functionality works
   - Run full E2E tests after each phase
   - Test in different browsers
   - Verify performance hasn't degraded

---

## Performance Considerations

### Code Splitting
- Use dynamic imports for heavy modals
- Lazy load layout renderers
- Code split layout renderers by type

### Bundle Size
- Track bundle size during refactoring
- Consider code splitting for layout renderers
- Minimize translation file loading (load by language)

### Runtime Performance
- Memoize expensive calculations
- Use `useMemo` and `useCallback` appropriately
- Profile components with React DevTools

---

## Migration Checklist

- [ ] Phase 1 complete and tested
- [ ] Phase 2 complete and tested
- [ ] Phase 3 complete and tested
- [ ] Phase 4 complete and tested
- [ ] All imports updated
- [ ] No unused files
- [ ] All tests passing
- [ ] Performance metrics reviewed
- [ ] Documentation updated
- [ ] Team review completed

---

## Success Criteria

✅ **All files under 1000 lines**
✅ **Clear separation of concerns**
✅ **No duplicate utility functions**
✅ **Consistent patterns across codebase**
✅ **Improved code discoverability**
✅ **Faster team onboarding**
✅ **Better IDE support and autocomplete**
✅ **Easier testing and debugging**
✅ **Reduced cognitive load when reading code**
✅ **No regressions in functionality**

---

## Notes

- This plan prioritizes impact vs. effort
- Each phase should be completed with full test coverage
- Git commits should align with logical chunks (one PR per phase)
- Code review is critical to ensure consistency
- Documentation should be updated as refactoring progresses

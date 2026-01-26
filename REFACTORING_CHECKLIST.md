# Refactoring Execution Checklist

## Pre-Refactoring Setup

- [ ] Read `REFACTORING_PLAN.md` completely
- [ ] Read `REFACTORING_IMPLEMENTATION.md` for Phase 1
- [ ] Review `REFACTORING_QUICK_REFERENCE.md`
- [ ] Backup current codebase: `git stash`
- [ ] Create branch: `git checkout -b refactor/all-phases`
- [ ] Verify all tests pass: `npm test`
- [ ] Verify build succeeds: `npm run build`
- [ ] Document baseline metrics:
  - [ ] File count > 1000 lines: ___
  - [ ] Max file size: ___ lines
  - [ ] Bundle size: ___ KB
  - [ ] Test coverage: ___%

---

## Phase 1: Extract PresentationViewer (Week 1)

### 1.1 Extract Types
- [ ] Create `src/app/presentation/[slug]/types.ts`
- [ ] Copy all interfaces from PresentationViewer.tsx
- [ ] Update imports in PresentationViewer.tsx
- [ ] Run: `npm run type-check`
- [ ] Verify no errors
- [ ] Git commit: `refactor(presentation): extract types`

### 1.2 Extract Utilities
- [ ] Create `src/app/presentation/[slug]/utils/title-utils.ts`
  - [ ] Copy `stripHtml()` function
  - [ ] Copy `getTitleSlideColors()` function
  - [ ] Export properly
- [ ] Create `src/app/presentation/[slug]/utils/streaming-utils.ts`
  - [ ] Copy all streaming-related helpers
- [ ] Create `src/app/presentation/[slug]/utils/export-utils.ts`
  - [ ] Copy all export-related helpers
- [ ] Create `src/app/presentation/[slug]/utils/animation-utils.ts`
  - [ ] Copy all animation-related helpers
- [ ] Create `src/app/presentation/[slug]/utils/index.ts`
  - [ ] Re-export all utilities
- [ ] Update PresentationViewer.tsx imports
- [ ] Run: `npm run type-check`
- [ ] Git commit: `refactor(presentation): extract utilities`

### 1.3 Extract Custom Hooks
- [ ] Create `src/app/presentation/[slug]/hooks/usePresentationState.ts`
  - [ ] Move all state declarations
  - [ ] Move all state setters
  - [ ] Create cohesive state object
  - [ ] Test hook independently
- [ ] Create `src/app/presentation/[slug]/hooks/usePresentationStreaming.ts`
  - [ ] Move EventSource logic
  - [ ] Move streaming state
  - [ ] Encapsulate streaming lifecycle
  - [ ] Test hook independently
- [ ] Create `src/app/presentation/[slug]/hooks/index.ts`
  - [ ] Re-export all hooks
- [ ] Update PresentationViewer.tsx to use hooks
- [ ] Run: `npm run type-check`
- [ ] Test in browser: click through slides, verify functionality
- [ ] Git commit: `refactor(presentation): extract custom hooks`

### 1.4 Extract Sub-Components
- [ ] Create `PresentationHeader.tsx`
  - [ ] Extract header JSX from PresentationViewer
  - [ ] Define proper props interface
  - [ ] Maintain all functionality
  - [ ] Test in isolation
- [ ] Create `NavigationControls.tsx`
  - [ ] Extract navigation UI
  - [ ] Define proper props interface
  - [ ] Test in isolation
- [ ] Create `SlidePanel.tsx`
  - [ ] Extract slide panel UI
  - [ ] Define proper props interface
  - [ ] Test in isolation
- [ ] Create `EditingPanel.tsx`
  - [ ] Extract editing UI
  - [ ] Define proper props interface
  - [ ] Test in isolation
- [ ] Create `src/app/presentation/[slug]/components/index.ts`
  - [ ] Re-export all components
- [ ] Update PresentationViewer.tsx to use components
- [ ] Run: `npm run type-check`
- [ ] Test all functionality in browser
- [ ] Git commit: `refactor(presentation): extract sub-components`

### 1.5 Verify Phase 1
- [ ] PresentationViewer.tsx is < 3000 lines: ✅
- [ ] No TypeScript errors: `npm run type-check`
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Manual testing complete:
  - [ ] Can navigate slides
  - [ ] Can edit slides
  - [ ] Can export
  - [ ] Can change theme
  - [ ] Can fullscreen
  - [ ] Streaming works (if applicable)
- [ ] No console errors in browser
- [ ] Git commit: `refactor(presentation): phase 1 complete`

---

## Phase 2: Extract CreatePresentationClient (Week 1-2)

### 2.1 Extract Hooks
- [ ] Create `useCreationWizard.ts`
  - [ ] Move wizard step state
  - [ ] Move form data state
  - [ ] Create cohesive hook interface
  - [ ] Test hook
- [ ] Create `useFileUpload.ts`
  - [ ] Move file upload logic
  - [ ] Move file validation
  - [ ] Move progress tracking
  - [ ] Test hook
- [ ] Create `useUserCredits.ts`
  - [ ] Move credit checking logic
  - [ ] Move plan limit checks
  - [ ] Test hook
- [ ] Create `usePresentationPreview.ts`
  - [ ] Move preview generation logic
  - [ ] Move preview caching
  - [ ] Test hook
- [ ] Create `hooks/index.ts`
- [ ] Update CreatePresentationClient.tsx imports
- [ ] Run: `npm run type-check`
- [ ] Git commit: `refactor(creation): extract hooks`

### 2.2 Extract Services
- [ ] Create `presentationService.ts`
  - [ ] Move API calls for create/update
  - [ ] Centralize API logic
  - [ ] Add error handling
- [ ] Create `creditsService.ts`
  - [ ] Move credit calculation logic
  - [ ] Move plan limit logic
  - [ ] Add validation
- [ ] Create `validationService.ts`
  - [ ] Move form validation
  - [ ] Move file validation
  - [ ] Add error messages
- [ ] Create `services/index.ts`
- [ ] Update CreatePresentationClient.tsx imports
- [ ] Run: `npm run type-check`
- [ ] Git commit: `refactor(creation): extract services`

### 2.3 Extract Wizard Steps
- [ ] Create `SourceSelectStep.tsx`
  - [ ] Extract step 1 UI
  - [ ] Define props interface
  - [ ] Test
- [ ] Create `OutlineReviewStep.tsx`
  - [ ] Extract step 2 UI
  - [ ] Define props interface
  - [ ] Test
- [ ] Create `DetailsFormStep.tsx`
  - [ ] Extract step 3 UI
  - [ ] Define props interface
  - [ ] Test
- [ ] Create `ConfirmationStep.tsx`
  - [ ] Extract step 4 UI
  - [ ] Define props interface
  - [ ] Test
- [ ] Create `steps/index.ts`
- [ ] Refactor CreatePresentationClient.tsx to use steps
- [ ] Run: `npm run type-check`
- [ ] Test in browser: walk through wizard
- [ ] Git commit: `refactor(creation): extract wizard steps`

### 2.4 Verify Phase 2
- [ ] CreatePresentationClient.tsx is < 500 lines: ✅
- [ ] No TypeScript errors: `npm run type-check`
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Manual testing complete:
  - [ ] Can select source
  - [ ] Can review outline
  - [ ] Can fill details
  - [ ] Can confirm
  - [ ] Can go back through steps
- [ ] No console errors
- [ ] Git commit: `refactor(creation): phase 2 complete`

---

## Phase 3: Extract Header & Modal Sections (Week 2)

### 3.1 Create Header Sub-folder
- [ ] Create `src/app/presentation/[slug]/components/header/`
- [ ] Create `header/index.tsx` (orchestrator)
- [ ] Create `header/ShareSection.tsx`
  - [ ] Extract share UI
  - [ ] Move share state
  - [ ] Test
- [ ] Create `header/ExportSection.tsx`
  - [ ] Extract export UI
  - [ ] Move export state
  - [ ] Test
- [ ] Create `header/CollaborationSection.tsx`
  - [ ] Extract collaboration UI
  - [ ] Move collaboration state
  - [ ] Test
- [ ] Create `header/EmbedSection.tsx`
  - [ ] Extract embed UI
  - [ ] Move embed state
  - [ ] Test

### 3.2 Update Header.tsx
- [ ] Refactor Header.tsx to use sub-components
- [ ] Reduce Header.tsx to < 200 lines
- [ ] Update imports
- [ ] Run: `npm run type-check`
- [ ] Test all functionality
- [ ] Git commit: `refactor(presentation): extract header sections`

### 3.3 Verify Phase 3
- [ ] Header.tsx is < 200 lines: ✅
- [ ] All header sections under 300 lines: ✅
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Manual testing: all header features work
- [ ] Git commit: `refactor(presentation): phase 3 complete`

---

## Phase 4: Split Translation Files (Week 2-3)

### 4.1 Create i18n Structure
- [ ] Create `src/lib/i18n/` directory
- [ ] Create `src/lib/i18n/common/`
  - [ ] Create `shared.ts` (~300 lines)
  - [ ] Create `navigation.ts` (~300 lines)
  - [ ] Create `messages.ts` (~300 lines)
- [ ] Create `src/lib/i18n/features/`
  - [ ] Create `presentation.ts` (~400 lines)
  - [ ] Create `creation.ts` (~400 lines)
  - [ ] Create `dashboard.ts` (~400 lines)
  - [ ] Create `sharing.ts` (~300 lines)
  - [ ] Create `auth.ts` (~300 lines)
- [ ] Create `src/lib/i18n/types.ts`
  - [ ] Define translation key types

### 4.2 Migrate translations.ts
- [ ] Copy relevant translations to new files
- [ ] Verify all translations included
- [ ] Create `src/lib/i18n/index.ts` combining all
- [ ] Test by importing and using translations
- [ ] Update all imports across codebase
- [ ] Run: `npm run type-check`
- [ ] Git commit: `refactor(i18n): split translations.ts`

### 4.3 Migrate dashboard-translations.ts
- [ ] Move dashboard translations to appropriate feature files
- [ ] Verify coverage
- [ ] Update all imports
- [ ] Run: `npm run type-check`
- [ ] Git commit: `refactor(i18n): split dashboard-translations.ts`

### 4.4 Verify Phase 4
- [ ] All translations distributed: ✅
- [ ] No translations missing
- [ ] All imports updated
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] App UI displays correctly with translations
- [ ] Git commit: `refactor(i18n): phase 4 complete`

---

## Phase 5: Reorganize Layout Renderers (Week 3)

### 5.1 Create Base Layout Structure
- [ ] Create `src/components/presentation/layouts/base/`
- [ ] Create `BaseLayout.tsx`
  - [ ] Common wrapper logic
  - [ ] Shared styling
- [ ] Create `useLayoutState.ts`
  - [ ] Shared state management
- [ ] Create `layoutUtils.ts`
  - [ ] Dimension calculations
  - [ ] Position calculations
  - [ ] Common helpers

### 5.2 Refactor Bullet Layout
- [ ] Create `src/components/presentation/layouts/bullet/`
- [ ] Create `BulletLayout.tsx` (~300 lines)
  - [ ] Move from BulletLayoutRenderer.tsx
  - [ ] Use BaseLayout
  - [ ] Use useLayoutState
- [ ] Create `BulletPoint.tsx` (~100 lines)
  - [ ] Extract bullet point component
- [ ] Create `bulletLayoutUtils.ts`
  - [ ] Layout-specific helpers
- [ ] Test thoroughly
- [ ] Git commit: `refactor(layouts): refactor bullet layout`

### 5.3 Refactor Timeline Layout
- [ ] Create `src/components/presentation/layouts/timeline/`
- [ ] Create `TimelineLayout.tsx` (~300 lines)
- [ ] Create `TimelineNode.tsx` (~100 lines)
- [ ] Create `timelineLayoutUtils.ts`
- [ ] Test thoroughly
- [ ] Git commit: `refactor(layouts): refactor timeline layout`

### 5.4 Refactor Comparison Layout
- [ ] Create `src/components/presentation/layouts/comparison/`
- [ ] Create `ComparisonLayout.tsx` (~300 lines)
- [ ] Create `ComparisonColumn.tsx` (~100 lines)
- [ ] Create `comparisonLayoutUtils.ts`
- [ ] Test thoroughly
- [ ] Git commit: `refactor(layouts): refactor comparison layout`

### 5.5 Refactor Remaining Layouts
- [ ] Steps layout
- [ ] Gallery layout
- [ ] Table layout
- [ ] (Other layouts as needed)
- [ ] Each follows same pattern: main + subs + utils
- [ ] Test each
- [ ] Commit each

### 5.6 Create Layout Index
- [ ] Create `src/components/presentation/layouts/index.ts`
  - [ ] Export all layouts
  - [ ] Create layout mapping/registry
  - [ ] Update LayoutFactory to use index

### 5.7 Verify Phase 5
- [ ] All layout renderers < 400 lines: ✅
- [ ] No duplicated code: ✅
- [ ] All layouts still render correctly
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Manual testing: all slide types render correctly
- [ ] Git commit: `refactor(layouts): phase 5 complete`

---

## Phase 6: Centralize Utilities (Week 3)

### 6.1 Create Color Utils
- [ ] Create `src/lib/utils/color.ts`
- [ ] Add `isColorDark()` function
- [ ] Add `getContrastColor()` function
- [ ] Add `hexToRgba()` function
- [ ] Add `lightenColor()` function
- [ ] Add `darkenColor()` function
- [ ] Export all functions

### 6.2 Replace All Occurrences
- [ ] Find all occurrences of `isColorDark`: grep search
- [ ] Replace in:
  - [ ] `ui-colors.ts`
  - [ ] `custom-theme-utils.ts`
  - [ ] `ExportModal.tsx`
  - [ ] `FeedbackSection.tsx`
  - [ ] `RateUsModal.tsx`
  - [ ] `ImageEditor.tsx`
  - [ ] Header.tsx
  - [ ] PresentationViewer.tsx
  - [ ] (and 2 more files)
- [ ] Each: delete old function, add import from lib/utils/color
- [ ] Run: `npm run type-check`

### 6.3 Create String Utils
- [ ] Create `src/lib/utils/string.ts`
- [ ] Add `stripHtml()` function (move from title-utils)
- [ ] Add other string utilities
- [ ] Update imports

### 6.4 Create Math Utils
- [ ] Create `src/lib/utils/math.ts`
- [ ] Add calculation functions
- [ ] Add dimension helpers
- [ ] Add common math operations

### 6.5 Create Validators Utils
- [ ] Create `src/lib/utils/validators.ts`
- [ ] Add email validator
- [ ] Add file validators
- [ ] Add form validators

### 6.6 Create Index
- [ ] Create `src/lib/utils/index.ts`
- [ ] Re-export all utilities
- [ ] Update imports across codebase

### 6.7 Verify Phase 6
- [ ] No duplicate utility functions: ✅
- [ ] All utilities centralized: ✅
- [ ] All imports updated
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Git commit: `refactor(utils): phase 6 complete`

---

## Phase 7: Extract Common Components (Week 3-4)

### 7.1 Extract SlideImage
- [ ] Create `src/components/presentation/common/SlideImage.tsx`
- [ ] Move image handling logic
- [ ] Add resizing
- [ ] Add fallbacks
- [ ] Add alt text support
- [ ] Test
- [ ] Replace all slide image usages
- [ ] Git commit: `refactor(components): extract SlideImage`

### 7.2 Extract EditableText
- [ ] Create `src/components/presentation/common/EditableText.tsx`
- [ ] Move text editing logic
- [ ] Add inline editing
- [ ] Add validation
- [ ] Test
- [ ] Replace all editable text usages
- [ ] Git commit: `refactor(components): extract EditableText`

### 7.3 Extract ShapeBox
- [ ] Create `src/components/presentation/common/ShapeBox.tsx`
- [ ] Move card/box wrapper logic
- [ ] Add theming support
- [ ] Add customization
- [ ] Test
- [ ] Replace all shape box usages
- [ ] Git commit: `refactor(components): extract ShapeBox`

### 7.4 Extract AnimationWrapper
- [ ] Create `src/components/presentation/common/AnimationWrapper.tsx`
- [ ] Move animation orchestration
- [ ] Support multiple animation types
- [ ] Test
- [ ] Replace all animation usages
- [ ] Git commit: `refactor(components): extract AnimationWrapper`

### 7.5 Extract ContentGrid
- [ ] Create `src/components/presentation/common/ContentGrid.tsx`
- [ ] Move grid patterns
- [ ] Support responsive layouts
- [ ] Test
- [ ] Replace all grid usages
- [ ] Git commit: `refactor(components): extract ContentGrid`

### 7.6 Create Index
- [ ] Create `src/components/presentation/common/index.ts`
- [ ] Re-export all common components
- [ ] Update imports

### 7.7 Verify Phase 7
- [ ] All common components created: ✅
- [ ] No duplicated component code: ✅
- [ ] All imports updated
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Visual consistency maintained
- [ ] Git commit: `refactor(components): phase 7 complete`

---

## Phase 8: Final Cleanup & Testing (Week 4)

### 8.1 Remove Unused Files
- [ ] Identify unused files: `npm run build`
- [ ] Check for:
  - [ ] Old layout renderer files (replaced)
  - [ ] Old util files (replaced)
  - [ ] Old translation files
  - [ ] Duplicate components
- [ ] Verify they're actually unused (no imports)
- [ ] Delete unused files
- [ ] Git commit: `refactor: remove unused files`

### 8.2 Fix All Imports
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Fix any import errors
- [ ] Verify all paths correct
- [ ] Check for unused imports: eslint
- [ ] Remove unused imports
- [ ] Git commit: `refactor: fix all imports`

### 8.3 Run Full Test Suite
- [ ] Unit tests: `npm test`
- [ ] Integration tests: (if available)
- [ ] E2E tests: (if available)
- [ ] Fix any failures
- [ ] Achieve >80% coverage
- [ ] Git commit: `refactor: update and fix tests`

### 8.4 Performance Analysis
- [ ] Build: `npm run build`
- [ ] Check bundle size
  - [ ] Before: ___KB
  - [ ] After: ___KB
  - [ ] Change: ___KB (±_%)
- [ ] Profile components: React DevTools
- [ ] Check for regressions
- [ ] Document findings

### 8.5 Final Manual Testing
- [ ] Create presentation: ✅
- [ ] Edit presentation: ✅
- [ ] Change theme: ✅
- [ ] Change layout: ✅
- [ ] Export (PDF, PPTX): ✅
- [ ] Share: ✅
- [ ] View in fullscreen: ✅
- [ ] View on mobile: ✅
- [ ] Test streaming (if applicable): ✅
- [ ] Test all features work correctly

### 8.6 Documentation Update
- [ ] Update README.md with new structure
- [ ] Document key architectural decisions
- [ ] Create component usage guide
- [ ] Update contributor guidelines
- [ ] Document new utilities
- [ ] Add JSDoc comments to public APIs
- [ ] Git commit: `docs: update documentation`

### 8.7 Team Review
- [ ] Code review by team members
- [ ] Address feedback
- [ ] Discuss architectural decisions
- [ ] Get sign-off
- [ ] Git commit: `refactor: address review feedback`

### 8.8 Merge to Main
- [ ] All tests passing
- [ ] All reviews approved
- [ ] Documentation complete
- [ ] Merge pull request
- [ ] Deploy to staging
- [ ] Verify in staging environment
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Final Verification

### File Size Validation
```
✅ All files < 1000 lines
✅ No circular dependencies
✅ All TypeScript compiling
✅ All tests passing
✅ No console errors
✅ No performance regressions
✅ Documentation complete
```

### Checklist
- [ ] PresentationViewer.tsx: < 2,500 lines
- [ ] CreatePresentationClient.tsx: < 500 lines
- [ ] Header.tsx: < 200 lines
- [ ] All layout renderers: < 400 lines each
- [ ] All utility files: < 300 lines
- [ ] All component files: < 500 lines
- [ ] Translation files: < 400 lines each
- [ ] Common components: < 300 lines each
- [ ] No unused imports or files
- [ ] No duplicate code
- [ ] No circular dependencies
- [ ] TypeScript clean
- [ ] All tests passing
- [ ] Build successful
- [ ] Bundle size acceptable
- [ ] Performance metrics good
- [ ] Documentation updated
- [ ] Team trained

---

## Success! 🎉

Refactoring complete. The codebase is now:
- ✅ Modular and maintainable
- ✅ Easy to test
- ✅ Easy to extend
- ✅ Easy to understand
- ✅ Optimized for developer experience
- ✅ Ready for scaling

# Codebase Refactoring - Quick Reference

## Current State Analysis

### Critical Files Needing Refactoring

| File | Size | Priority | Estimated Refactoring Time |
|------|------|----------|---------------------------|
| `src/lib/translations.ts` | 9,629 lines | P0 | 4 hours |
| `src/app/presentation/[slug]/PresentationViewer.tsx` | 5,884 lines | P0 | 8 hours |
| `src/lib/dashboard-translations.ts` | 5,166 lines | P0 | 3 hours |
| `src/components/createpresentation/CreatePresentationClient.tsx` | 1,994 lines | P1 | 5 hours |
| `src/app/presentation/[slug]/components/Header.tsx` | 1,282 lines | P1 | 3 hours |
| `src/components/createpresentation/CreatePresentationForm.tsx` | 1,217 lines | P1 | 3 hours |
| `src/components/presentation/layouts/BulletLayoutRenderer.tsx` | 1,211 lines | P1 | 2 hours |
| `src/components/presentation/layouts/TimelineLayoutRenderer.tsx` | 1,154 lines | P1 | 2 hours |
| `src/components/presentation/layouts/ComparisonLayoutRenderer.tsx` | 1,130 lines | P1 | 2 hours |

**Total Refactoring Time:** ~32 hours over 4 weeks

---

## Target Directory Structure

```
src/
├── app/
│   ├── presentation/[slug]/
│   │   ├── PresentationViewerContainer.tsx    (Main orchestrator)
│   │   ├── types.ts                          (All types)
│   │   ├── hooks/
│   │   │   ├── usePresentationState.ts       (State management)
│   │   │   ├── usePresentationStreaming.ts   (Streaming logic)
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── title-utils.ts                (Title slide helpers)
│   │   │   ├── streaming-utils.ts            (Streaming helpers)
│   │   │   ├── export-utils.ts               (Export helpers)
│   │   │   ├── animation-utils.ts            (Animation helpers)
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── PresentationHeader.tsx        (Header extraction)
│   │       ├── NavigationControls.tsx        (Controls extraction)
│   │       ├── SlidePanel.tsx                (Slide panel extraction)
│   │       ├── EditingPanel.tsx              (Editing panel extraction)
│   │       ├── header/                       (Sub-folder for Header.tsx extraction)
│   │       │   ├── ShareSection.tsx
│   │       │   ├── ExportSection.tsx
│   │       │   ├── CollaborationSection.tsx
│   │       │   └── EmbedSection.tsx
│   │       └── index.ts
│   │
│   └── createpresentation/
│       ├── CreatePresentationClient.tsx      (Main orchestrator)
│       ├── hooks/
│       │   ├── useCreationWizard.ts          (Wizard state)
│       │   ├── useFileUpload.ts              (File handling)
│       │   ├── useUserCredits.ts             (Credit checks)
│       │   └── index.ts
│       ├── services/
│       │   ├── presentationService.ts        (API calls)
│       │   ├── creditsService.ts             (Credit logic)
│       │   └── validationService.ts          (Form validation)
│       └── steps/
│           ├── SourceSelectStep.tsx          (Step 1)
│           ├── OutlineReviewStep.tsx         (Step 2)
│           ├── DetailsFormStep.tsx           (Step 3)
│           └── ConfirmationStep.tsx          (Step 4)
│
├── components/
│   ├── presentation/
│   │   ├── layouts/
│   │   │   ├── base/
│   │   │   │   ├── BaseLayout.tsx            (Common wrapper)
│   │   │   │   ├── useLayoutState.ts         (Shared state)
│   │   │   │   └── layoutUtils.ts            (Shared utilities)
│   │   │   ├── bullet/
│   │   │   │   ├── BulletLayout.tsx          (~300 lines)
│   │   │   │   ├── BulletPoint.tsx           (~100 lines)
│   │   │   │   └── bulletLayoutUtils.ts
│   │   │   ├── timeline/
│   │   │   │   ├── TimelineLayout.tsx        (~300 lines)
│   │   │   │   ├── TimelineNode.tsx          (~100 lines)
│   │   │   │   └── timelineLayoutUtils.ts
│   │   │   ├── comparison/
│   │   │   │   ├── ComparisonLayout.tsx      (~300 lines)
│   │   │   │   ├── ComparisonColumn.tsx      (~100 lines)
│   │   │   │   └── comparisonLayoutUtils.ts
│   │   │   ├── steps/
│   │   │   ├── index.ts                      (Layout exports/mapping)
│   │   │   └── ... (other layout types)
│   │   ├── common/
│   │   │   ├── SlideImage.tsx                (Image handling)
│   │   │   ├── EditableText.tsx              (Text editing)
│   │   │   ├── ShapeBox.tsx                  (Card wrapper)
│   │   │   ├── AnimationWrapper.tsx          (Animation orchestration)
│   │   │   └── ContentGrid.tsx               (Grid patterns)
│   │   ├── modals/
│   │   │   ├── ShareModal/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ShareTab.tsx
│   │   │   │   └── EmbedTab.tsx
│   │   │   ├── ExportModal/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── PdfTab.tsx
│   │   │   │   ├── PptxTab.tsx
│   │   │   │   └── ImagesTab.tsx
│   │   │   └── ChartModal/
│   │   └── theme/
│   │       ├── ThemeSelector.tsx
│   │       ├── ThemePreview.tsx
│   │       └── themeHelpers.ts
│   └── dashboard/
│       ├── DashboardContainer.tsx
│       └── sections/
│           ├── PresenterView.tsx
│           ├── TemplatesView.tsx
│           └── SettingsView.tsx
│
├── lib/
│   ├── utils/
│   │   ├── color.ts                  (Centralized color utilities)
│   │   ├── string.ts                 (Text utilities)
│   │   ├── math.ts                   (Calculations)
│   │   ├── validators.ts             (Validation functions)
│   │   ├── date.ts                   (Date utilities)
│   │   └── index.ts                  (Re-exports)
│   ├── i18n/                         (Split translations)
│   │   ├── index.ts                  (Main export)
│   │   ├── common/
│   │   │   ├── shared.ts             (~300 lines)
│   │   │   ├── navigation.ts         (~300 lines)
│   │   │   └── messages.ts           (~300 lines)
│   │   ├── features/
│   │   │   ├── presentation.ts       (~400 lines)
│   │   │   ├── creation.ts           (~400 lines)
│   │   │   ├── dashboard.ts          (~400 lines)
│   │   │   ├── sharing.ts            (~300 lines)
│   │   │   └── auth.ts               (~300 lines)
│   │   └── types.ts                  (Translation key types)
│   ├── themes/                       (Existing, no change)
│   └── services/                     (API/external services)
│       ├── api/
│       ├── auth/
│       └── analytics/
│
└── types/
    ├── presentation.ts               (Presentation types)
    ├── theme.ts                      (Theme types)
    ├── user.ts                       (User/auth types)
    ├── api.ts                        (API response types)
    └── index.ts                      (Re-exports all)
```

---

## Duplicate Code Removal Map

### `isColorDark()` Function

**Found in 10+ files:**
```
- src/lib/ui-colors.ts
- src/lib/custom-theme-utils.ts
- src/components/ExportModal.tsx
- src/components/FeedbackSection.tsx
- src/components/RateUsModal.tsx
- src/components/ImageEditor.tsx
- src/app/presentation/[slug]/components/Header.tsx
- src/app/presentation/[slug]/PresentationViewer.tsx
- src/app/presentation/[slug]/components/ui-colors.ts
- src/lib/themes/theme-utils.ts
```

**Solution:**
1. Implement single version in `src/lib/utils/color.ts`
2. Replace all 10+ occurrences with import from central location
3. Delete duplicate implementations

**Expected Lines Saved:** ~50 lines

---

## Phase Breakdown

### Phase 1: Extract PresentationViewer (Week 1, Days 1-5)
- Extract types → `types.ts` (1-2 hours)
- Extract utilities → `utils/` (2-3 hours)
- Extract hooks → `hooks/` (2-3 hours)
- Extract sub-components → `components/` (3-4 hours)
- Test & verify (1 hour)

**Result:** 5,884 lines → ~2,500 lines

### Phase 2: Extract CreatePresentationClient (Week 1, Days 3-4)
- Extract hooks (1-2 hours)
- Extract services (1-2 hours)
- Split wizard steps (2-3 hours)
- Test & verify (1 hour)

**Result:** 1,994 lines → ~400 lines

### Phase 3: Extract Header & Sub-components (Week 1, Days 4-5)
- Create header sub-folder (1 hour)
- Extract ShareSection (1 hour)
- Extract ExportSection (1 hour)
- Extract CollaborationSection (1 hour)
- Extract EmbedSection (1 hour)
- Test & verify (1 hour)

**Result:** 1,282 lines → ~200 lines

### Phase 4: Split Translation Files (Week 2, Days 1-2)
- Create i18n folder structure (1 hour)
- Split `translations.ts` into modules (2-3 hours)
- Split `dashboard-translations.ts` into modules (1-2 hours)
- Update all imports (1-2 hours)
- Test & verify (1 hour)

**Result:** 14,795 lines → ~5,000 lines (distributed)

### Phase 5: Reorganize Layout Renderers (Week 2, Days 3-5)
- Create `layouts/base/` (1 hour)
- Refactor Bullet layout (1-2 hours)
- Refactor Timeline layout (1-2 hours)
- Refactor Comparison layout (1-2 hours)
- Refactor other layouts (2-3 hours)
- Test & verify (1 hour)

**Result:** 1,200+ lines each → 300-400 lines each

### Phase 6: Centralize Utilities (Week 3, Days 1-2)
- Create `lib/utils/color.ts` (30 minutes)
- Create `lib/utils/string.ts` (30 minutes)
- Create `lib/utils/math.ts` (1 hour)
- Create `lib/utils/validators.ts` (1 hour)
- Update all imports across codebase (2-3 hours)

**Result:** ~50 lines of duplicate code removed

### Phase 7: Extract Common Components (Week 3, Days 3-5)
- Extract SlideImage (1 hour)
- Extract EditableText (1 hour)
- Extract ShapeBox (1 hour)
- Extract AnimationWrapper (1 hour)
- Extract ContentGrid (1 hour)
- Test & verify (1 hour)

### Phase 8: Final Cleanup & Testing (Week 4)
- Remove unused files (30 minutes)
- Fix all imports (1-2 hours)
- Run full test suite (30 minutes)
- Performance profiling (1-2 hours)
- Documentation updates (1-2 hours)
- Code review & fixes (1-2 hours)

---

## Success Metrics

Track before and after:

```
Before Refactoring:
- Files > 1000 lines: 9
- Max file size: 9,629 lines
- Total lines in "God Files": ~27,000
- Duplicate utility functions: 10+
- Average component complexity: High

After Refactoring:
- Files > 1000 lines: 0
- Max file size: <1000 lines
- Total lines distributed across modules
- Duplicate utilities: 0
- Average component complexity: Low-Medium
```

---

## Git Workflow

### Branch Naming
```
refactor/phase1-presentation-viewer
refactor/phase2-create-presentation
refactor/phase3-header-extraction
refactor/phase4-split-translations
refactor/phase5-layouts
refactor/phase6-utilities
refactor/phase7-common-components
refactor/cleanup-final
```

### Commit Messages
```
refactor(presentation): extract types from PresentationViewer
refactor(presentation): extract utils to utils/ folder
refactor(presentation): extract custom hooks
refactor(presentation): split into sub-components
```

### Pull Request Template
```
## Refactoring Phase X: [Phase Name]

### Changes
- Extracted [X] from [file]
- Created new files: [list]
- Updated imports in [N] files

### Impact
- Reduced [file] from [X] → [Y] lines
- No functional changes

### Testing
- [ ] TypeScript check passes
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] No console errors

### Before/After
- Before: [File] - [Size] lines
- After: [File] - [Size] lines
```

---

## CI/CD Considerations

Add checks to ensure refactoring maintains quality:

```yaml
# .github/workflows/quality-check.yml
name: Quality Checks

on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  max-file-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check file sizes
        run: |
          find src -name "*.tsx" -o -name "*.ts" | while read f; do
            lines=$(wc -l < "$f")
            if [ $lines -gt 1000 ]; then
              echo "❌ $f has $lines lines (max 1000)"
              exit 1
            fi
          done
          echo "✅ All files under 1000 lines"
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Import paths become long | Use path aliases in `tsconfig.json`: `"@/*": "./src/*"` |
| Circular dependencies | Keep utils pure (no component imports) |
| State management gets complex | Use custom hooks for complex state |
| Type errors after extraction | Run `npm run type-check` frequently |
| Tests fail after refactoring | Update test imports, ensure mocks work |
| Bundle size increases | Check for dead code, use code splitting |

---

## Monitoring Progress

Use this template to track weekly progress:

```markdown
## Week 1 Progress
- [x] Phase 1 complete (PresentationViewer)
- [x] Phase 2 in progress (CreatePresentationClient)
- [ ] Phase 3 not started

## Issues Encountered
- None yet

## Files Refactored
- PresentationViewer.tsx: 5,884 → 2,500 lines
- (more as work progresses)

## Next Steps
- Complete Phase 2
- Start Phase 3
```

---

## Post-Refactoring Checklist

- [ ] All files under 1000 lines
- [ ] No circular dependencies
- [ ] All imports resolved correctly
- [ ] TypeScript compiles without errors
- [ ] All tests passing (>80% coverage)
- [ ] No console warnings/errors
- [ ] Bundle size stable or reduced
- [ ] Performance metrics reviewed
- [ ] Documentation updated
- [ ] Team trained on new structure
- [ ] Code review completed
- [ ] Production deployment successful

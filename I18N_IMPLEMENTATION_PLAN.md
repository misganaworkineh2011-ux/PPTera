# Next.js i18n Implementation Plan

## Overview
Implement proper internationalization with route-based localization for server-side rendering, static generation, and perfect SEO.

## Architecture

### URL Structure
```
Current:
- /about (client-side language switching)
- /help
- /prompt-guide

New:
- /en/about (English - static)
- /es/about (Spanish - static)
- /fr/about (French - static)
- / (redirects to /en or user's language)
```

### Supported Languages
- English (en) - default
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Portuguese (pt)
- Italian (it)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Russian (ru)

## Implementation Steps

### 1. Create `[lang]` Dynamic Route Structure
```
src/app/
├── [lang]/
│   ├── layout.tsx (language-aware layout)
│   ├── page.tsx (homepage)
│   ├── about/
│   │   └── page.tsx
│   ├── help/
│   │   └── page.tsx
│   ├── prompt-guide/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── cookies/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   └── terms/
│       └── page.tsx
├── api/ (unchanged)
├── dashboard/ (unchanged - auth required)
└── middleware.ts (language detection & redirect)
```

### 2. Update Middleware
- Detect user's preferred language from:
  1. URL path (`/es/about`)
  2. Cookie (`NEXT_LOCALE`)
  3. Accept-Language header
- Redirect root `/` to `/[lang]`
- Redirect old paths to new paths (`/about` → `/en/about`)

### 3. Generate Static Params
Use `generateStaticParams` to pre-render all language versions:
```typescript
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
    { lang: 'fr' },
    // ... all languages
  ];
}
```

### 4. Language Switcher Component
- Show current language
- List all available languages
- Link to same page in different language
- Update cookie on switch

### 5. SEO Benefits
Each language gets its own URL:
- `/en/about` - indexed for English searches
- `/es/about` - indexed for Spanish searches
- Proper `hreflang` tags for all versions
- Language-specific metadata

## Files to Create/Modify

### New Files
- `src/app/[lang]/layout.tsx`
- `src/app/[lang]/page.tsx`
- `src/app/[lang]/about/page.tsx`
- `src/app/[lang]/help/page.tsx`
- `src/app/[lang]/prompt-guide/page.tsx`
- `src/app/[lang]/pricing/page.tsx`
- `src/app/[lang]/contact/page.tsx`
- `src/app/[lang]/cookies/page.tsx`
- `src/app/[lang]/privacy/page.tsx`
- `src/app/[lang]/terms/page.tsx`
- `src/components/LanguageSwitcher.tsx`
- `src/lib/i18n.ts` (i18n utilities)

### Modified Files
- `src/middleware.ts` (add language detection & redirect)
- `src/components/LandingNavbar.tsx` (use LanguageSwitcher)
- `src/components/LandingFooter.tsx` (update links)
- `src/app/sitemap.ts` (add all language URLs)

### Deleted Files
- `src/app/about/` (moved to `[lang]/about`)
- `src/app/help/` (moved to `[lang]/help`)
- `src/app/prompt-guide/` (moved to `[lang]/prompt-guide`)
- `src/app/pricing/page.tsx` (moved to `[lang]/pricing`)
- `src/app/contact/page.tsx` (moved to `[lang]/contact`)
- `src/app/cookies/page.tsx` (moved to `[lang]/cookies`)
- `src/app/privacy/page.tsx` (moved to `[lang]/privacy`)
- `src/app/terms/page.tsx` (moved to `[lang]/terms`)
- `src/contexts/LanguageContext.tsx` (no longer needed)

## Benefits

### Cost Savings
- All pages pre-rendered at build time
- Served from CDN edge cache
- 80-90% reduction in function invocations
- Only regenerates after revalidation period

### SEO
- Separate URLs per language (Google loves this)
- Proper `hreflang` tags
- Language-specific metadata
- Better ranking in local searches

### User Experience
- Fast page loads (static)
- Language persists across navigation
- Clean URLs
- Works without JavaScript

## Migration Strategy

### Phase 1: Setup (30 min)
1. Create i18n utilities
2. Create `[lang]` folder structure
3. Update middleware

### Phase 2: Move Pages (45 min)
1. Move landing page
2. Move about, help, prompt-guide
3. Move pricing, contact
4. Move legal pages (cookies, privacy, terms)

### Phase 3: Update Components (30 min)
1. Create LanguageSwitcher
2. Update LandingNavbar
3. Update LandingFooter
4. Update all internal links

### Phase 4: Testing & Cleanup (15 min)
1. Test all language versions
2. Test language switching
3. Delete old files
4. Update sitemap

### Total Time: ~2 hours

## Example Implementation

### Before (Client Component)
```typescript
// src/app/about/page.tsx
"use client";
import { useLanguage } from "~/contexts/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return <div>{t.aboutUs}</div>;
}
```

### After (Server Component with i18n)
```typescript
// src/app/[lang]/about/page.tsx
import { translations } from "~/lib/translations";

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }, ...];
}

export default function AboutPage({ params }: { params: { lang: string } }) {
  const t = translations[params.lang as Language];
  return <div>{t.aboutUs}</div>;
}
```

## Testing Checklist

- [ ] `/` redirects to `/en` (or user's language)
- [ ] `/en/about` loads in English
- [ ] `/es/about` loads in Spanish
- [ ] Language switcher works
- [ ] Language persists in cookie
- [ ] All pages are static (○ in build output)
- [ ] SEO metadata correct for each language
- [ ] Sitemap includes all language URLs
- [ ] Old URLs redirect to new URLs

## Rollback Plan

If issues arise:
1. Revert middleware changes
2. Restore old page files from git
3. Remove `[lang]` folder
4. Restore LanguageContext

## Success Metrics

After 1 week:
- [ ] 80-90% reduction in function invocations
- [ ] All pages showing ○ (static) in Vercel
- [ ] Google indexing all language versions
- [ ] Language switching works smoothly
- [ ] No increase in error rates

---

**Ready to implement?** This will be a significant improvement for both cost and SEO!

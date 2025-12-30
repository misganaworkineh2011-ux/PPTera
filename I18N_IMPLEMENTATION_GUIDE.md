# i18n Implementation - Quick Reference

## ✅ What's Been Done

1. **Created i18n utilities** (`src/lib/i18n.ts`)
2. **Created LanguageSwitcher component** (`src/components/LanguageSwitcher.tsx`)
3. **Updated middleware** to handle language detection and redirects

## 🚀 Next Steps - Apply This Pattern

### Pattern for Each Page

#### 1. Create `src/app/[lang]/about/page.tsx`
```typescript
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, generateLanguageParams, type Language } from "~/lib/i18n";
import type { Metadata } from "next";

// Generate static pages for all languages
export async function generateStaticParams() {
  return generateLanguageParams();
}

// Generate metadata per language
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const t = getTranslations(params.lang);
  
  return {
    title: `${t.aboutUs || "About Us"} - PPT Master`,
    description: t.aboutHeroDesc || "Learn about PPT Master...",
  };
}

export const revalidate = 3600; // ISR - revalidate every hour

export default function AboutPage({ params }: { params: { lang: string } }) {
  const t = getTranslations(params.lang);
  const lang = params.lang as Language;

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang} />
      
      {/* Your page content using `t.translationKey` */}
      <section>
        <h1>{t.aboutUs}</h1>
        <p>{t.aboutHeroDesc}</p>
      </section>
      
      <LandingFooter currentLang={lang} />
    </div>
  );
}
```

### Pattern Summary

**Every page needs:**
1. `generateStaticParams()` - generates all language versions
2. `generateMetadata()` - SEO metadata per language
3. `export const revalidate` - ISR configuration
4. Accept `params: { lang: string }`
5. Use `getTranslations(params.lang)` to get translations
6. Pass `currentLang` to Navbar/Footer

### Pages to Migrate

Apply the above pattern to:

1. ✅ **Homepage** - `src/app/[lang]/page.tsx`
2. ✅ **About** - `src/app/[lang]/about/page.tsx`
3. ✅ **Help** - `src/app/[lang]/help/page.tsx`
4. ✅ **Prompt Guide** - `src/app/[lang]/prompt-guide/page.tsx`
5. ✅ **Pricing** - `src/app/[lang]/pricing/page.tsx`
6. ✅ **Contact** - `src/app/[lang]/contact/page.tsx`
7. ✅ **Cookies** - `src/app/[lang]/cookies/page.tsx`
8. ✅ **Privacy** - `src/app/[lang]/privacy/page.tsx`
9. ✅ **Terms** - `src/app/[lang]/terms/page.tsx`

### Update Components

#### LandingNavbar
```typescript
// Add currentLang prop
interface LandingNavbarProps {
  currentLang: Language;
}

export function LandingNavbar({ currentLang }: LandingNavbarProps) {
  // Replace language dropdown with:
  return (
    <nav>
      {/* ... other nav items ... */}
      <LanguageSwitcher currentLang={currentLang} />
    </nav>
  );
}
```

#### LandingFooter
```typescript
// Add currentLang prop and update links
interface LandingFooterProps {
  currentLang: Language;
}

export function LandingFooter({ currentLang }: LandingFooterProps) {
  return (
    <footer>
      <Link href={`/${currentLang}/about`}>About</Link>
      <Link href={`/${currentLang}/help`}>Help</Link>
      {/* ... */}
    </footer>
  );
}
```

### Update Sitemap

```typescript
// src/app/sitemap.ts
import { SUPPORTED_LANGUAGES } from "~/lib/i18n";

export default function sitemap() {
  const pages = ['', 'about', 'help', 'prompt-guide', 'pricing', 'contact'];
  
  const urls = [];
  
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const page of pages) {
      urls.push({
        url: `https://pptmaster.app/${lang}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }
  
  return urls;
}
```

## 🧹 Cleanup After Migration

Once all pages are migrated:

1. **Delete old page files:**
   - `src/app/about/`
   - `src/app/help/`
   - `src/app/prompt-guide/`
   - `src/app/pricing/page.tsx`
   - `src/app/contact/page.tsx`
   - `src/app/cookies/page.tsx`
   - `src/app/privacy/page.tsx`
   - `src/app/terms/page.tsx`

2. **Delete unused files:**
   - `src/contexts/LanguageContext.tsx`
   - `src/lib/server-language.ts`
   - `src/app/about/AboutPageContent.tsx`
   - `src/app/prompt-guide/PromptGuideContent.tsx`
   - `src/app/help/HelpPageClient.tsx`

3. **Update all internal links:**
   ```typescript
   // Before
   <Link href="/about">About</Link>
   
   // After
   <Link href={`/${currentLang}/about`}>About</Link>
   ```

## ✅ Testing Checklist

- [ ] `/` redirects to `/en` (or user's language)
- [ ] `/en/about` loads in English (static)
- [ ] `/es/about` loads in Spanish (static)
- [ ] `/fr/about` loads in French (static)
- [ ] Language switcher appears in navbar
- [ ] Clicking language switcher changes language
- [ ] Language persists in cookie
- [ ] All pages show ○ (static) in build output
- [ ] Sitemap includes all language URLs
- [ ] Old URLs (`/about`) redirect to `/en/about`

## 📊 Expected Results

### Build Output
```
Route (app)                                Size  First Load JS  Revalidate
┌ ○ /[lang]                               139 B         548 kB          1h
├ ○ /[lang]/about                         139 B         548 kB          1h
├ ○ /[lang]/help                          1.48 kB       549 kB          1h
├ ○ /[lang]/prompt-guide                  518 B         548 kB          1h
├ ○ /[lang]/pricing                       4.41 kB       552 kB          1h
├ ○ /[lang]/contact                       2.21 kB       550 kB          1h
├ ○ /[lang]/cookies                       139 B         548 kB          1d
├ ○ /[lang]/privacy                       139 B         548 kB          1d
└ ○ /[lang]/terms                         139 B         548 kB          1d

○  (Static)  prerendered as static content
```

### URL Examples
- English: `https://pptmaster.app/en/about`
- Spanish: `https://pptmaster.app/es/about`
- French: `https://pptmaster.app/fr/about`
- German: `https://pptmaster.app/de/about`

### SEO Benefits
- Each language version indexed separately
- Proper `hreflang` tags
- Language-specific metadata
- Better local search rankings

### Cost Savings
- 80-90% reduction in function invocations
- All pages served from CDN
- Only regenerates after revalidation period

---

**Ready to implement?** Start with the homepage and about page, then apply the same pattern to all other pages!

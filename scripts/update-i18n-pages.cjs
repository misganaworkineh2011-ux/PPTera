const fs = require('fs');
const path = require('path');

// Update each page to properly import existing components
const pages = {
  'about': {
    import: 'AboutPageContent',
    from: '../../about/AboutPageContent',
  },
  'help': {
    import: 'default',
    from: '../../help/page',
  },
  'prompt-guide': {
    import: 'PromptGuideContent',
    from: '../../prompt-guide/PromptGuideContent',
  },
  'pricing': {
    import: 'default',
    from: '../../pricing/page',
  },
  'contact': {
    import: 'default',
    from: '../../contact/page',
  },
  'cookies': {
    import: 'default',
    from: '../../cookies/page',
  },
  'privacy': {
    import: 'default',
    from: '../../privacy/page',
  },
  'terms': {
    import: 'default',
    from: '../../terms/page',
  },
};

Object.entries(pages).forEach(([pageName, config]) => {
  const file = path.join(__dirname, '..', 'src', 'app', '[lang]', pageName, 'page.tsx');
  
  const content = `import { generateLanguageParams } from "~/lib/i18n";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export const revalidate = ${pageName.includes('cookie') || pageName.includes('privacy') || pageName.includes('terms') ? '86400' : '3600'};

export default async function Page() {
  const PageComponent = (await import("${config.from}")).${config.import};
  return <PageComponent />;
}
`;
  
  fs.writeFileSync(file, content);
  console.log(`✓ Updated ${pageName}/page.tsx`);
});

console.log('\n✅ All pages updated!');

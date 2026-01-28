import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_KEYWORDS, type KeywordData } from '~/lib/seo/keyword-data';
import { KeywordPageContent } from './KeywordPageContent';

// Generate static params for all keyword pages
export async function generateStaticParams() {
  return ALL_KEYWORDS.map((keyword) => ({
    slug: keyword.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const keyword = ALL_KEYWORDS.find(k => k.slug === slug);

  if (!keyword) {
    return {
      title: 'Page Not Found',
    };
  }

  const title = formatTitle(keyword.original);
  const description = generateDescription(keyword.original, keyword.category);

  return {
    title: `${title} | PPTMaster - Free AI Presentation Generator`,
    description,
    keywords: [keyword.original, 'ai presentation', 'powerpoint generator', 'free presentation maker', 'pptmaster'],
    openGraph: {
      title: `${title} | PPTMaster`,
      description,
      type: 'website',
      url: `https://www.pptmaster.app/k/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PPTMaster`,
      description,
    },
    alternates: {
      canonical: `https://www.pptmaster.app/k/${slug}`,
    },
  };
}

export default async function KeywordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const keyword = ALL_KEYWORDS.find(k => k.slug === slug);

  if (!keyword) {
    notFound();
  }

  return <KeywordPageContent keyword={keyword} />;
}

// Helper functions
function formatTitle(keyword: string): string {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateDescription(keyword: string, category: string): string {
  const formattedKeyword = formatTitle(keyword);

  const descriptions: Record<string, string> = {
    'ai-tools': `Create stunning presentations with ${formattedKeyword}. PPTMaster is the best free AI-powered presentation generator. Transform your ideas into professional slides in seconds.`,
    'powerpoint': `${formattedKeyword} made easy with PPTMaster. Generate professional PowerPoint presentations using AI. Free online tool with beautiful templates and smart design.`,
    'presentation-tools': `${formattedKeyword} - PPTMaster offers the most advanced AI presentation tools. Create, design, and share professional presentations effortlessly.`,
    'slides': `${formattedKeyword} with PPTMaster's AI technology. Generate beautiful slides instantly. Free online presentation maker with smart layouts and designs.`,
    'templates': `${formattedKeyword} - Browse thousands of professional presentation templates. Customize with AI or start from scratch. Free and premium options available.`,
    'alternatives': `Looking for ${formattedKeyword}? Try PPTMaster - a powerful alternative with AI-powered features, better pricing, and more flexibility.`,
    'guides': `${formattedKeyword} - Complete guide and tutorial. Learn how to create amazing presentations with PPTMaster's AI-powered tools.`,
    'features': `${formattedKeyword} - Explore PPTMaster's advanced features for creating stunning presentations. Beautiful designs, smart layouts, and AI assistance.`,
    'conversion': `${formattedKeyword} - Convert and transform your presentations with PPTMaster. Easy-to-use tools for all your presentation needs.`,
    'online-tools': `${formattedKeyword} - PPTMaster provides free online tools for creating professional presentations. No download required, works in your browser.`,
    'microsoft': `${formattedKeyword} - PPTMaster works seamlessly with Microsoft products. Export to PowerPoint, use familiar features, enhanced with AI.`,
    'google': `${formattedKeyword} - PPTMaster integrates with Google Workspace. Create presentations that work with Google Slides and more.`,
  };

  return descriptions[category] || `${formattedKeyword} - Create professional presentations with PPTMaster's free AI-powered generator. Transform your ideas into stunning slides in seconds.`;
}

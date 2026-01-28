import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_KEYWORDS, type KeywordData } from '~/lib/seo/keyword-data';
import type { UseCase } from '~/lib/seo/page-data';
import { USE_CASES } from '~/lib/seo/page-data';
import { ComboPageContent } from './ComboPageContent';

// Generate static params for all keyword + use case combinations
export async function generateStaticParams() {
  const params: { keyword: string; usecase: string }[] = [];
  
  // Generate combinations for high-value keywords only (to keep build reasonable)
  const highValueKeywords = ALL_KEYWORDS.filter(k => 
    k.category === 'ai-tools' || 
    k.category === 'powerpoint' || 
    k.category === 'presentation-tools' ||
    k.priority >= 0.6
  );

  for (const keyword of highValueKeywords) {
    for (const useCase of USE_CASES) {
      params.push({
        keyword: keyword.slug,
        usecase: useCase.slug,
      });
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ keyword: string; usecase: string }> 
}): Promise<Metadata> {
  const { keyword: keywordSlug, usecase: usecaseSlug } = await params;
  const keyword = ALL_KEYWORDS.find(k => k.slug === keywordSlug);
  const useCase = USE_CASES.find(u => u.slug === usecaseSlug);

  if (!keyword || !useCase) {
    return {
      title: 'Page Not Found',
    };
  }

  const title = `${formatTitle(keyword.original)} for ${useCase.name}`;
  const description = `Create ${useCase.name.toLowerCase()} presentations with ${keyword.original}. PPTMaster's AI-powered generator makes it easy to create professional ${useCase.name.toLowerCase()} slides in minutes.`;

  return {
    title: `${title} | PPTMaster`,
    description,
    keywords: [keyword.original, useCase.name, 'ai presentation', 'powerpoint generator', 'pptmaster'],
    openGraph: {
      title: `${title} | PPTMaster`,
      description,
      type: 'website',
      url: `https://www.pptmaster.app/use/${keywordSlug}/${usecaseSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PPTMaster`,
      description,
    },
    alternates: {
      canonical: `https://www.pptmaster.app/use/${keywordSlug}/${usecaseSlug}`,
    },
  };
}

export default async function ComboPage({ 
  params 
}: { 
  params: Promise<{ keyword: string; usecase: string }> 
}) {
  const { keyword: keywordSlug, usecase: usecaseSlug } = await params;
  const keyword = ALL_KEYWORDS.find(k => k.slug === keywordSlug);
  const useCase = USE_CASES.find(u => u.slug === usecaseSlug);

  if (!keyword || !useCase) {
    notFound();
  }

  return <ComboPageContent keyword={keyword} useCase={useCase} />;
}

function formatTitle(keyword: string): string {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

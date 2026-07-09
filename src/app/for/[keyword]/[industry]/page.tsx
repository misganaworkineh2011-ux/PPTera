import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_KEYWORDS, type KeywordData } from '~/lib/seo/keyword-data';
import type { Industry } from '~/lib/seo/page-data';
import { INDUSTRIES } from '~/lib/seo/page-data';
import { KeywordIndustryContent } from './KeywordIndustryContent';

// Generate static params for keyword + industry combinations
export async function generateStaticParams() {
  const params: { keyword: string; industry: string }[] = [];
  
  // Use all keywords for maximum coverage
  for (const keyword of ALL_KEYWORDS) {
    for (const industry of INDUSTRIES) {
      params.push({
        keyword: keyword.slug,
        industry: industry.slug,
      });
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ keyword: string; industry: string }> 
}): Promise<Metadata> {
  const { keyword: keywordSlug, industry: industrySlug } = await params;
  const keyword = ALL_KEYWORDS.find(k => k.slug === keywordSlug);
  const industry = INDUSTRIES.find(i => i.slug === industrySlug);

  if (!keyword || !industry) {
    return {
      title: 'Page Not Found',
    };
  }

  const title = `${formatTitle(keyword.original)} for ${industry.name}`;
  const description = `Create ${industry.name.toLowerCase()} presentations with ${keyword.original}. PPTera's AI-powered generator helps ${industry.name.toLowerCase()} professionals create stunning presentations in minutes.`;

  return {
    title: `${title} | PPTera`,
    description,
    keywords: [keyword.original, industry.name, 'ai presentation', 'powerpoint generator', 'pptera'],
    openGraph: {
      title: `${title} | PPTera`,
      description,
      type: 'website',
      url: `https://www.pptmaster.app/for/${keywordSlug}/${industrySlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PPTera`,
      description,
    },
    alternates: {
      canonical: `https://www.pptmaster.app/for/${keywordSlug}/${industrySlug}`,
    },
  };
}

export default async function KeywordIndustryPage({ 
  params 
}: { 
  params: Promise<{ keyword: string; industry: string }> 
}) {
  const { keyword: keywordSlug, industry: industrySlug } = await params;
  const keyword = ALL_KEYWORDS.find(k => k.slug === keywordSlug);
  const industry = INDUSTRIES.find(i => i.slug === industrySlug);

  if (!keyword || !industry) {
    notFound();
  }

  return <KeywordIndustryContent keyword={keyword} industry={industry} />;
}

function formatTitle(keyword: string): string {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

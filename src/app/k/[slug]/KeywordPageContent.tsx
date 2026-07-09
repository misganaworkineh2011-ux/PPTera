'use client';

import Link from 'next/link';
import type { KeywordData } from '~/lib/seo/keyword-data';
import { KEYWORD_CATEGORIES } from '~/lib/seo/keyword-data';
import { ArrowRight, Sparkles, Zap, CheckCircle, Star } from 'lucide-react';

interface KeywordPageContentProps {
  keyword: KeywordData;
}

export function KeywordPageContent({ keyword }: KeywordPageContentProps) {
  const formattedKeyword = formatTitle(keyword.original);
  const relatedKeywords = getRelatedKeywords(keyword);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {getCategoryLabel(keyword.category)}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {formattedKeyword}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {getHeroDescription(keyword)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/createpresentation"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Free Presentation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Browse Templates
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              100% Free
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              No Sign-up Required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              AI-Powered
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PPTera for {formattedKeyword}?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {getFeatures(keyword).map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Use PPTera for {formattedKeyword}
          </h2>
          
          <div className="space-y-8">
            {getSteps(keyword).map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Keywords */}
      {relatedKeywords.length > 0 && (
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Related Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedKeywords.slice(0, 12).map((related) => (
                <Link
                  key={related.slug}
                  href={`/k/${related.slug}`}
                  className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-sm"
                >
                  {formatTitle(related.original)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Presentation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users creating stunning presentations with PPTera
          </p>
          <Link
            href="/createpresentation"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Helper functions
function formatTitle(keyword: string): string {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ai-tools': 'AI Tools',
    'powerpoint': 'PowerPoint',
    'presentation-tools': 'Presentation Tools',
    'slides': 'Slides',
    'templates': 'Templates',
    'alternatives': 'Alternatives',
    'guides': 'Guides & Tutorials',
    'features': 'Features',
    'conversion': 'Conversion Tools',
    'online-tools': 'Online Tools',
    'microsoft': 'Microsoft',
    'google': 'Google',
    'general': 'General',
  };
  return labels[category] || 'Tools';
}

function getHeroDescription(keyword: KeywordData): string {
  const kw = keyword.original.toLowerCase();
  
  if (kw.includes('free')) {
    return 'Create professional presentations instantly with our free AI-powered generator. No credit card required, no hidden fees.';
  }
  if (kw.includes('best')) {
    return 'Discover why PPTera is the top choice for creating stunning presentations with AI technology.';
  }
  if (kw.includes('how to')) {
    return 'Learn how to create amazing presentations quickly and easily with our step-by-step guide and AI assistance.';
  }
  if (kw.includes('template')) {
    return 'Browse our extensive collection of professional templates and customize them with AI in seconds.';
  }
  
  return 'Transform your ideas into beautiful presentations with AI. Fast, easy, and completely free to start.';
}

function getFeatures(keyword: KeywordData) {
  return [
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: 'Lightning Fast',
      description: 'Generate complete presentations in under 60 seconds with our advanced AI technology.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: 'AI-Powered Design',
      description: 'Smart layouts, beautiful themes, and professional designs automatically applied.',
    },
    {
      icon: <Star className="w-6 h-6 text-purple-600" />,
      title: 'Professional Quality',
      description: 'Export to PowerPoint, PDF, or share online. Perfect for business and education.',
    },
  ];
}

function getSteps(keyword: KeywordData) {
  return [
    {
      title: 'Enter Your Topic',
      description: 'Simply describe what you want to present. Our AI understands natural language.',
    },
    {
      title: 'AI Generates Content',
      description: 'Watch as PPTera creates professional slides with relevant content and images.',
    },
    {
      title: 'Customize & Export',
      description: 'Edit any element, change themes, and export to PowerPoint or PDF when ready.',
    },
  ];
}

function getRelatedKeywords(keyword: KeywordData): KeywordData[] {
  const categoryKeywords = KEYWORD_CATEGORIES[keyword.category as keyof typeof KEYWORD_CATEGORIES] || [];
  return categoryKeywords.filter(k => k.slug !== keyword.slug);
}

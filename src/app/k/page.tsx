import type { Metadata } from 'next';
import Link from 'next/link';
import { KEYWORD_CATEGORIES, TOTAL_KEYWORDS, TOTAL_UNIQUE_SLUGS } from '~/lib/seo/keyword-data';
import { Search, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Presentation Tools & Keywords | PPTera',
  description: 'Explore all AI presentation tools, PowerPoint generators, and presentation makers. Find the perfect tool for creating stunning presentations.',
  keywords: ['ai presentation', 'powerpoint generator', 'presentation maker', 'ai tools'],
};

export default function KeywordsIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {TOTAL_UNIQUE_SLUGS} Tools & Topics
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Presentation Tools Directory
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Explore our comprehensive guide to AI presentation tools, PowerPoint generators, 
            and everything you need to create stunning presentations.
          </p>

          <Link
            href="/createpresentation"
            className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Create Free Presentation
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          {Object.entries(KEYWORD_CATEGORIES).map(([category, keywords]) => {
            if (keywords.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 capitalize">
                  {category.replace(/-/g, ' ')} ({keywords.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {keywords.map((keyword) => (
                    <Link
                      key={keyword.slug}
                      href={`/k/${keyword.slug}`}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium group-hover:text-purple-600">
                          {formatTitle(keyword.original)}
                        </span>
                        {keyword.priority >= 0.7 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Presentation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Use PPTera's AI to generate professional presentations in seconds
          </p>
          <Link
            href="/createpresentation"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function formatTitle(keyword: string): string {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

'use client';

import Link from 'next/link';
import type { KeywordData } from '~/lib/seo/keyword-data';
import type { UseCase } from '~/lib/seo/page-data';
import { ArrowRight, CheckCircle, Sparkles, Target, Zap } from 'lucide-react';

interface ComboPageContentProps {
  keyword: KeywordData;
  useCase: UseCase;
}

export function ComboPageContent({ keyword, useCase }: ComboPageContentProps) {
  const formattedKeyword = formatTitle(keyword.original);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            {useCase.name}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {formattedKeyword} for {useCase.name}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create professional {useCase.name.toLowerCase()} presentations instantly with AI. 
            Perfect for {useCase.description.toLowerCase()}.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/createpresentation"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create {useCase.name} Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href={`/templates/${useCase.slug}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              View {useCase.name} Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perfect for {useCase.name}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getBenefits(useCase).map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Use Case */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            AI-Powered Features for {useCase.name}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Content</h3>
              <p className="text-gray-600">
                AI generates relevant content specifically tailored for {useCase.name.toLowerCase()} presentations.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Generation</h3>
              <p className="text-gray-600">
                Create complete {useCase.name.toLowerCase()} presentations in under 60 seconds.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Design</h3>
              <p className="text-gray-600">
                Beautiful layouts and themes optimized for {useCase.name.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Create Your {useCase.name} in 3 Steps
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Describe Your {useCase.name}</h3>
                <p className="text-gray-600">
                  Tell our AI what you need. Include key points, audience, and goals.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Creates Your Presentation</h3>
                <p className="text-gray-600">
                  Watch as PPTera generates professional slides with content, images, and design.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Customize & Present</h3>
                <p className="text-gray-600">
                  Edit, refine, and export to PowerPoint or present directly online.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your {useCase.name}?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands creating professional presentations with PPTera
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

function formatTitle(keyword: string): string {
  return keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getBenefits(useCase: UseCase) {
  const benefits: Record<string, Array<{ title: string; description: string }>> = {
    'pitch-deck': [
      { title: 'Investor-Ready', description: 'Professional layouts that impress investors' },
      { title: 'Data Visualization', description: 'Charts and graphs that tell your story' },
      { title: 'Compelling Narrative', description: 'AI helps structure your pitch perfectly' },
    ],
    'sales-presentation': [
      { title: 'Persuasive Content', description: 'AI-generated copy that converts' },
      { title: 'Product Showcase', description: 'Beautiful layouts for product demos' },
      { title: 'ROI Focus', description: 'Highlight value and benefits effectively' },
    ],
    'training-materials': [
      { title: 'Clear Structure', description: 'Organized content for easy learning' },
      { title: 'Visual Learning', description: 'Images and diagrams that enhance understanding' },
      { title: 'Interactive Elements', description: 'Engage your trainees effectively' },
    ],
  };

  return benefits[useCase.slug] || [
    { title: 'Professional Quality', description: 'Polished presentations that impress' },
    { title: 'Time-Saving', description: 'Create in minutes, not hours' },
    { title: 'Easy to Customize', description: 'Edit and refine with simple tools' },
    { title: 'Export Anywhere', description: 'PowerPoint, PDF, or online sharing' },
    { title: 'AI-Powered', description: 'Smart suggestions and auto-formatting' },
    { title: 'Free to Start', description: 'No credit card required' },
  ];
}

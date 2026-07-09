'use client';

import Link from 'next/link';
import type { KeywordData } from '~/lib/seo/keyword-data';
import type { Industry } from '~/lib/seo/page-data';
import { ArrowRight, Briefcase, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface KeywordIndustryContentProps {
  keyword: KeywordData;
  industry: Industry;
}

export function KeywordIndustryContent({ keyword, industry }: KeywordIndustryContentProps) {
  const formattedKeyword = formatTitle(keyword.original);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <span className="text-2xl">{industry.icon}</span>
            {industry.name}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {formattedKeyword} for {industry.name}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create professional {industry.name.toLowerCase()} presentations instantly with AI. 
            Trusted by {industry.name.toLowerCase()} professionals worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/createpresentation"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create {industry.name} Presentation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href={`/industries/${industry.slug}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              View {industry.name} Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Industry-Specific Benefits */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perfect for {industry.name} Professionals
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getIndustryBenefits(industry).map((benefit, index) => (
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

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            AI-Powered Features for {industry.name}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Industry-Specific Content</h3>
              <p className="text-gray-600">
                AI generates content tailored specifically for {industry.name.toLowerCase()} presentations.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
              <p className="text-gray-600">
                Access templates designed for {industry.name.toLowerCase()} use cases.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data Visualization</h3>
              <p className="text-gray-600">
                Charts and graphs perfect for {industry.name.toLowerCase()} data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Common {industry.name} Presentation Types
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {getIndustryUseCases(industry).map((useCase, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{useCase.description}</p>
                <Link
                  href="/createpresentation"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center"
                >
                  Create Now
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your {industry.name} Presentation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of {industry.name.toLowerCase()} professionals using PPTera
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

function getIndustryBenefits(industry: Industry) {
  const benefits: Record<string, Array<{ title: string; description: string }>> = {
    'business': [
      { title: 'Professional Quality', description: 'Impress clients and stakeholders with polished presentations' },
      { title: 'Time-Saving', description: 'Create business presentations in minutes, not hours' },
      { title: 'Data-Driven', description: 'Visualize business metrics and KPIs effectively' },
    ],
    'education': [
      { title: 'Engaging Content', description: 'Keep students engaged with interactive slides' },
      { title: 'Easy to Understand', description: 'Clear layouts perfect for learning' },
      { title: 'Curriculum-Aligned', description: 'Templates for various educational topics' },
    ],
    'healthcare': [
      { title: 'HIPAA-Compliant', description: 'Secure presentation creation and sharing' },
      { title: 'Medical Visuals', description: 'Charts and diagrams for medical data' },
      { title: 'Patient Education', description: 'Clear communication for patients' },
    ],
  };

  return benefits[industry.slug] || [
    { title: 'Industry-Specific', description: `Tailored for ${industry.name.toLowerCase()} professionals` },
    { title: 'Professional Quality', description: 'Impress your audience with polished slides' },
    { title: 'Fast Creation', description: 'Generate presentations in under 60 seconds' },
    { title: 'Easy Customization', description: 'Edit and refine with simple tools' },
    { title: 'Export Options', description: 'PowerPoint, PDF, or online sharing' },
    { title: 'Free to Start', description: 'No credit card required' },
  ];
}

function getIndustryUseCases(industry: Industry) {
  const useCases: Record<string, Array<{ title: string; description: string }>> = {
    'business': [
      { title: 'Business Plans', description: 'Comprehensive business strategy presentations' },
      { title: 'Quarterly Reports', description: 'Financial and progress updates' },
      { title: 'Team Meetings', description: 'Internal communication and updates' },
      { title: 'Client Proposals', description: 'Professional client-facing materials' },
    ],
    'education': [
      { title: 'Lesson Plans', description: 'Structured educational content' },
      { title: 'Course Materials', description: 'Comprehensive course presentations' },
      { title: 'Student Projects', description: 'Help students create great presentations' },
      { title: 'Parent Meetings', description: 'Communicate with parents effectively' },
    ],
    'sales': [
      { title: 'Sales Pitches', description: 'Persuasive product presentations' },
      { title: 'Product Demos', description: 'Showcase your products effectively' },
      { title: 'ROI Analysis', description: 'Demonstrate value to prospects' },
      { title: 'Customer Success', description: 'Share success stories and case studies' },
    ],
  };

  return useCases[industry.slug] || [
    { title: 'Presentations', description: `Professional ${industry.name.toLowerCase()} presentations` },
    { title: 'Reports', description: `${industry.name} reports and updates` },
    { title: 'Proposals', description: `${industry.name} proposals and pitches` },
    { title: 'Training', description: `${industry.name} training materials` },
  ];
}

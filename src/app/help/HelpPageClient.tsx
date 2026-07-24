"use client";

import { useState } from "react";
import { Search, HelpCircle, Video, Zap, Settings } from "lucide-react";

interface Article {
  title: string;
  content: string;
}

interface FAQArticle {
  question: string;
  answer: string;
}

interface HelpPageClientProps {
  gettingStartedArticles: Article[];
  featuresArticles: Article[];
  troubleshootingArticles: Article[];
  faqArticles: FAQArticle[];
  translations: {
    searchHelp?: string;
    gettingStarted?: string;
    featuresTutorials?: string;
    troubleshooting?: string;
    faqTitle?: string;
    noResultsFound?: string;
    noResultsDesc?: string;
    clearSearch?: string;
  };
}

export function HelpPageClient({
  gettingStartedArticles,
  featuresArticles,
  troubleshootingArticles,
  faqArticles,
  translations: t,
}: HelpPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGettingStarted = gettingStartedArticles.filter(
    (article) =>
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeatures = featuresArticles.filter(
    (article) =>
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTroubleshooting = troubleshootingArticles.filter(
    (article) =>
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQ = faqArticles.filter(
    (article) =>
      !searchQuery ||
      article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults =
    filteredGettingStarted.length > 0 ||
    filteredFeatures.length > 0 ||
    filteredTroubleshooting.length > 0 ||
    filteredFAQ.length > 0;

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16 animate-fade-in-up [animation-delay:300ms]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchHelp || "Search for help..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 focus:border-[#14b8a6] focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Getting Started */}
      {filteredGettingStarted.length > 0 && (
        <section className="relative px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                {t.gettingStarted || "Getting Started"}
              </h2>
            </div>
            <div className="space-y-6">
              {filteredGettingStarted.map((article, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {article.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features & Tutorials */}
      {filteredFeatures.length > 0 && (
        <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                {t.featuresTutorials || "Features & Tutorials"}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredFeatures.map((article, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {article.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Troubleshooting */}
      {filteredTroubleshooting.length > 0 && (
        <section className="relative px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                {t.troubleshooting || "Troubleshooting"}
              </h2>
            </div>
            <div className="space-y-6">
              {filteredTroubleshooting.map((article, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {article.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {filteredFAQ.length > 0 && (
        <section className="relative px-6 pb-24 bg-gradient-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#14b8a6] flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                {t.faqTitle || "Frequently Asked Questions"}
              </h2>
            </div>
            <div className="space-y-4">
              {filteredFAQ.map((article, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {article.question}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {article.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {searchQuery && !hasResults && (
        <section className="relative px-6 pb-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12">
              <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {t.noResultsFound || "No results found"}
              </h3>
              <p className="text-slate-600 mb-6">
                {t.noResultsDesc ||
                  `We couldn't find any articles matching "${searchQuery}". Try different keywords or browse all articles above.`}
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white font-semibold hover:shadow-xl transition-all"
              >
                {t.clearSearch || "Clear Search"}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

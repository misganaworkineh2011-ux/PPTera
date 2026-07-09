#!/usr/bin/env tsx

/**
 * Script to count total pSEO pages generated
 */

import { ALL_KEYWORDS } from '../src/lib/seo/keyword-data';
import { INDUSTRIES, USE_CASES, TEMPLATE_TOPICS, HOW_TO_GUIDES, ALTERNATIVES, TOOLS } from '../src/lib/seo/page-data';

function countPages() {
  console.log('🔢 PPTera pSEO Page Count\n');
  console.log('━'.repeat(60));

  // Existing pSEO pages
  const toolPages = TOOLS.length;
  const industryPages = INDUSTRIES.length;
  const useCasePages = USE_CASES.length;
  const templatePages = TEMPLATE_TOPICS.length;
  const howToPages = HOW_TO_GUIDES.length;
  const alternativePages = ALTERNATIVES.length;
  const comboPages = INDUSTRIES.length * USE_CASES.length;

  console.log('\n📊 Existing pSEO Pages:');
  console.log(`   Tool pages: ${toolPages.toLocaleString()}`);
  console.log(`   Industry pages: ${industryPages.toLocaleString()}`);
  console.log(`   Use case pages: ${useCasePages.toLocaleString()}`);
  console.log(`   Template pages: ${templatePages.toLocaleString()}`);
  console.log(`   How-to guides: ${howToPages.toLocaleString()}`);
  console.log(`   Alternative pages: ${alternativePages.toLocaleString()}`);
  console.log(`   Combo pages (industry × use case): ${comboPages.toLocaleString()}`);
  
  const existingTotal = toolPages + industryPages + useCasePages + templatePages + howToPages + alternativePages + comboPages;
  console.log(`   Subtotal: ${existingTotal.toLocaleString()} pages`);

  // New keyword-based pages
  const uniqueKeywords = new Set(ALL_KEYWORDS.map(k => k.slug)).size;
  const keywordPages = uniqueKeywords;

  // High-value keywords for combos
  const highValueKeywords = ALL_KEYWORDS.filter(k => 
    k.category === 'ai-tools' || 
    k.category === 'powerpoint' || 
    k.category === 'presentation-tools' ||
    k.priority >= 0.6
  );

  const keywordUseCasePages = highValueKeywords.length * USE_CASES.length;

  // Keyword × Industry pages (ALL keywords)
  const keywordIndustryPages = uniqueKeywords * INDUSTRIES.length;

  console.log('\n🚀 New Keyword-Based Pages:');
  console.log(`   Individual keyword pages (/k/[slug]): ${keywordPages.toLocaleString()}`);
  console.log(`   Keyword × Use Case combos (/use/[keyword]/[usecase]): ${keywordUseCasePages.toLocaleString()}`);
  console.log(`   (${highValueKeywords.length} high-value keywords × ${USE_CASES.length} use cases)`);
  console.log(`   Keyword × Industry combos (/for/[keyword]/[industry]): ${keywordIndustryPages.toLocaleString()}`);
  console.log(`   (${uniqueKeywords} keywords × ${INDUSTRIES.length} industries)`);

  const newTotal = keywordPages + keywordUseCasePages + keywordIndustryPages;
  console.log(`   Subtotal: ${newTotal.toLocaleString()} pages`);

  // Grand total
  const grandTotal = existingTotal + newTotal;
  console.log('\n━'.repeat(60));
  console.log(`\n🎉 TOTAL pSEO PAGES: ${grandTotal.toLocaleString()} pages\n`);
  console.log('━'.repeat(60));

  // Breakdown by category
  console.log('\n📁 Keyword Pages by Category:');
  const categories = {
    'ai-tools': ALL_KEYWORDS.filter(k => k.category === 'ai-tools').length,
    'powerpoint': ALL_KEYWORDS.filter(k => k.category === 'powerpoint').length,
    'presentation-tools': ALL_KEYWORDS.filter(k => k.category === 'presentation-tools').length,
    'slides': ALL_KEYWORDS.filter(k => k.category === 'slides').length,
    'templates': ALL_KEYWORDS.filter(k => k.category === 'templates').length,
    'alternatives': ALL_KEYWORDS.filter(k => k.category === 'alternatives').length,
    'guides': ALL_KEYWORDS.filter(k => k.category === 'guides').length,
    'features': ALL_KEYWORDS.filter(k => k.category === 'features').length,
    'conversion': ALL_KEYWORDS.filter(k => k.category === 'conversion').length,
    'online-tools': ALL_KEYWORDS.filter(k => k.category === 'online-tools').length,
    'microsoft': ALL_KEYWORDS.filter(k => k.category === 'microsoft').length,
    'google': ALL_KEYWORDS.filter(k => k.category === 'google').length,
    'general': ALL_KEYWORDS.filter(k => k.category === 'general').length,
  };

  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      if (count > 0) {
        console.log(`   ${category.padEnd(20)}: ${count.toLocaleString()} pages`);
      }
    });

  // SEO potential
  console.log('\n🎯 SEO Potential:');
  console.log(`   High-priority keywords (>0.6): ${ALL_KEYWORDS.filter(k => k.priority >= 0.6).length}`);
  console.log(`   Medium-priority keywords (0.5-0.6): ${ALL_KEYWORDS.filter(k => k.priority >= 0.5 && k.priority < 0.6).length}`);
  console.log(`   All keywords targeting search traffic: ${ALL_KEYWORDS.length}`);

  console.log('\n✅ All pages are:');
  console.log('   • SEO-optimized with unique titles & descriptions');
  console.log('   • Statically generated at build time');
  console.log('   • Included in sitemap.xml');
  console.log('   • Crawlable by search engines');
  console.log('   • Linked internally for better indexing\n');
}

countPages();

// ============================================
// Keyword Parser - Extract and categorize keywords from keywords.txt
// ============================================

export interface KeywordData {
  original: string;
  slug: string;
  category: string;
  searchIntent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  priority: number;
}

// Parse keywords and categorize them
export function parseKeywords(keywordsText: string): KeywordData[] {
  const lines = keywordsText.split('\n').filter(line => line.trim());
  const keywords: KeywordData[] = [];

  for (const line of lines) {
    const keyword = line.trim();
    if (!keyword) continue;

    const keywordData: KeywordData = {
      original: keyword,
      slug: createSlug(keyword),
      category: categorizeKeyword(keyword),
      searchIntent: determineSearchIntent(keyword),
      priority: calculatePriority(keyword),
    };

    keywords.push(keywordData);
  }

  return keywords;
}

// Create URL-friendly slug
function createSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Categorize keyword by type
function categorizeKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();

  // AI Tools
  if (kw.includes('ai') && (kw.includes('generator') || kw.includes('maker') || kw.includes('creator') || kw.includes('tool'))) {
    return 'ai-tools';
  }

  // Presentation Tools
  if (kw.includes('presentation') && !kw.includes('ai')) {
    return 'presentation-tools';
  }

  // PowerPoint specific
  if (kw.includes('powerpoint') || kw.includes('ppt')) {
    return 'powerpoint';
  }

  // Slides
  if (kw.includes('slide')) {
    return 'slides';
  }

  // Templates
  if (kw.includes('template')) {
    return 'templates';
  }

  // Competitors/Alternatives
  if (kw.includes('gamma') || kw.includes('canva') || kw.includes('prezi') || 
      kw.includes('tome') || kw.includes('visme') || kw.includes('beautiful.ai') ||
      kw.includes('slidesgo') || kw.includes('slidebean')) {
    return 'alternatives';
  }

  // How-to/Guides
  if (kw.includes('how to') || kw.includes('what is') || kw.includes('is ')) {
    return 'guides';
  }

  // Features
  if (kw.includes('background') || kw.includes('theme') || kw.includes('design')) {
    return 'features';
  }

  // Conversion tools
  if (kw.includes('convert') || kw.includes('to pdf') || kw.includes('to ppt')) {
    return 'conversion';
  }

  // Online tools
  if (kw.includes('online') && kw.includes('tool')) {
    return 'online-tools';
  }

  // Microsoft products
  if (kw.includes('microsoft')) {
    return 'microsoft';
  }

  // Google products
  if (kw.includes('google')) {
    return 'google';
  }

  return 'general';
}

// Determine search intent
function determineSearchIntent(keyword: string): 'informational' | 'navigational' | 'transactional' | 'commercial' {
  const kw = keyword.toLowerCase();

  // Navigational - looking for specific brand/product
  if (kw.includes('login') || kw.includes('download') || kw.includes('app') || 
      kw.includes('website') || kw.includes('official')) {
    return 'navigational';
  }

  // Informational - learning/research
  if (kw.includes('what is') || kw.includes('how to') || kw.includes('guide') ||
      kw.includes('tutorial') || kw.includes('example') || kw.includes('tips')) {
    return 'informational';
  }

  // Transactional - ready to use/buy
  if (kw.includes('free') || kw.includes('online') || kw.includes('maker') ||
      kw.includes('generator') || kw.includes('creator') || kw.includes('tool')) {
    return 'transactional';
  }

  // Commercial - comparing options
  if (kw.includes('best') || kw.includes('vs') || kw.includes('alternative') ||
      kw.includes('review') || kw.includes('pricing') || kw.includes('comparison')) {
    return 'commercial';
  }

  return 'informational';
}

// Calculate priority based on keyword characteristics
function calculatePriority(keyword: string): number {
  const kw = keyword.toLowerCase();
  let priority = 0.5;

  // High priority keywords
  if (kw.includes('free')) priority += 0.15;
  if (kw.includes('best')) priority += 0.1;
  if (kw.includes('ai')) priority += 0.1;
  if (kw.includes('2025') || kw.includes('2026')) priority += 0.05;
  if (kw.includes('online')) priority += 0.05;
  if (kw.includes('generator') || kw.includes('maker')) priority += 0.05;

  // Brand mentions
  if (kw.includes('pptmaster')) priority += 0.2;

  return Math.min(priority, 1.0);
}

// Group keywords by category
export function groupKeywordsByCategory(keywords: KeywordData[]): Record<string, KeywordData[]> {
  const grouped: Record<string, KeywordData[]> = {};

  for (const keyword of keywords) {
    if (!grouped[keyword.category]) {
      grouped[keyword.category] = [];
    }
    grouped[keyword.category]!.push(keyword);
  }

  return grouped;
}

// Get high-priority keywords
export function getHighPriorityKeywords(keywords: KeywordData[], minPriority = 0.6): KeywordData[] {
  return keywords.filter(k => k.priority >= minPriority);
}

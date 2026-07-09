// ============================================
// PPTera pSEO - ALL Keywords from keywords.txt
// ============================================
// Total: 331 unique keywords - ALL included for maximum SEO coverage

export interface Keyword {
    slug: string;
    keyword: string;
    title: string;
    category: KeywordCategory;
}

export type KeywordCategory =
    | 'ai-tools'
    | 'powerpoint'
    | 'google-slides'
    | 'competitor'
    | 'presentation'
    | 'template'
    | 'how-to'
    | 'comparison'
    | 'other';

// Helper to create slug from keyword
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Helper to create title from keyword
function titleCase(text: string): string {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Categorize keyword based on content
function categorizeKeyword(kw: string): KeywordCategory {
    const lower = kw.toLowerCase();

    if (lower.includes('ai ppt') || lower.includes('ai presentation') || lower.includes('ai slide') ||
        lower.includes('ai powerpoint') || lower.includes('gamma ai') || lower.includes('ai maker') ||
        lower.includes('ai generator') || lower.includes('ai tool')) {
        return 'ai-tools';
    }
    if (lower.includes('powerpoint') || lower.includes('ppt ') || lower.includes(' ppt') ||
        lower.startsWith('ppt') || lower.includes('microsoft')) {
        return 'powerpoint';
    }
    if (lower.includes('google slide') || lower.includes('google presentation')) {
        return 'google-slides';
    }
    if (lower.includes('beautiful.ai') || lower.includes('canva') || lower.includes('prezi') ||
        lower.includes('visme') || lower.includes('tome') || lower.includes('slidesgo') ||
        lower.includes('slidebean') || lower.includes('pitch.') || lower.includes('curipod') ||
        lower.includes('classpoint') || lower.includes('flowvella') || lower.includes('zoho') ||
        lower.includes('deckrobot') || lower.includes('chatslide') || lower.includes('slidesai') ||
        lower.includes('designs.ai') || lower.includes('slideshare')) {
        return 'competitor';
    }
    if (lower.includes('presentation') || lower.includes('slide')) {
        return 'presentation';
    }
    if (lower.includes('template') || lower.includes('background') || lower.includes('theme')) {
        return 'template';
    }
    if (lower.includes('how to') || lower.includes('what is') || lower.includes('convert')) {
        return 'how-to';
    }
    if (lower.includes(' vs ') || lower.includes('alternative') || lower.includes('like')) {
        return 'comparison';
    }
    return 'other';
}

// All 331 keywords from keywords.txt
const RAW_KEYWORDS = [
    "2 images for ppt ai",
    "adobe express ai presentation maker",
    "adobe online tools",
    "aesthetic ppt background",
    "agenda ppt slide",
    "ai ppt",
    "ai ppt generator",
    "ai ppt maker",
    "ai ppt maker like gamma",
    "ai presentation generator from text",
    "ai presentation generator tool",
    "ai presentation generator tools",
    "ai presentation maker free online",
    "ai presentation maker from text",
    "ai presentation maker tools",
    "ai presentation tool news",
    "ai presentation tools",
    "ai presentation tools news",
    "avery templates",
    "backgrounds for google slides",
    "beautiful.ai ai presentation maker",
    "beautiful.ai ai presentation tool",
    "beautiful.ai free",
    "beautiful.ai free plan",
    "beautiful.ai free plan 2025",
    "beautiful.ai free plan features",
    "beautiful.ai free plan pricing",
    "beautiful.ai login",
    "beautiful.ai logo",
    "beautiful.ai news",
    "beautiful.ai official website",
    "beautiful.ai presentation software",
    "beautiful.ai presentation tool",
    "beautiful.ai pricing",
    "beautiful.ai pricing 2025",
    "beautiful.ai pricing free plan",
    "beautiful.ai promo code",
    "beautiful.ai review",
    "beautiful.ai reviews",
    "best ai powerpoint generator 2025",
    "best ai powerpoint maker",
    "best ai ppt generator",
    "best ai presentation generator 2025",
    "best ai presentation maker 2024",
    "best ai presentation maker 2025",
    "best ai presentation tool",
    "best ai presentation tools 2025",
    "best free ai powerpoint generator 2024",
    "best free ai presentation generator",
    "best free ai presentation maker",
    "best free ai presentation maker 2024",
    "best free ai presentation maker 2025",
    "best free ai presentation tools",
    "best free ai presentation tools 2024",
    "best free ai presentation tools 2025",
    "best free online presentation maker",
    "best online tools for buying a car",
    "best online tools for car insurance shopping",
    "best online tools for used car value estimates",
    "best powerpoint ai",
    "best seo online tools",
    "best text to speech online tools",
    "best wireless presentation clickers",
    "business presentation slides",
    "canva ai image generator",
    "canva ai presentation",
    "canva ai presentation maker",
    "canva app",
    "canva coupon code",
    "canva design",
    "canva free",
    "canva free presentation templates",
    "canva logo png",
    "canva magic design feature",
    "canva magic design how to use",
    "canva magic design pricing",
    "canva presentation",
    "canva templates",
    "chatgpt presentation slides",
    "chatslide",
    "chatslide ai",
    "christmas ppt background",
    "church ppt background",
    "classpoint",
    "classpoint ai",
    "classpoint app",
    "conceptual presentation images",
    "contract templates",
    "convert ppt to pdf",
    "curipod",
    "curipod ai teacher tools reviews",
    "curipod code",
    "curipod join",
    "curipod join code",
    "curipod live",
    "curipod login",
    "curipod logo",
    "current date presentation slides 2025",
    "cute google slides themes",
    "deckrobot",
    "designs.ai pricing",
    "disney plus ai",
    "donwload slideshare",
    "easy slides shoes",
    "faq templates",
    "faze sway",
    "flowvella",
    "flowvella alternatives",
    "free ai powerpoint generator online",
    "free ai powerpoint maker online",
    "free ai powerpoint maker tools 2025",
    "free ai ppt maker like gamma",
    "free ai presentation maker",
    "free ai presentation maker online",
    "free ai presentation maker tools",
    "free ai presentation software",
    "free ai presentation tool",
    "free ai presentation tools",
    "free google slides templates",
    "free google slides themes",
    "free microsoft powerpoint",
    "free online ppt maker",
    "free online tools to create presentation images",
    "free ppt maker online",
    "free presentation slides",
    "free slidesgo",
    "gamma 11s",
    "gamma ai powerpoint generator",
    "gamma ai ppt maker",
    "gamma ai presentation builder gamma.app",
    "gamma ai presentation generator",
    "gamma ai presentation maker",
    "gamma ai presentation tool",
    "gamma ai presentation tool features",
    "gamma ai presentation tool gamma.app",
    "gamma ai presentations",
    "gamma app ai presentation features",
    "gamma app ai presentation tool",
    "gamma app presentation tool",
    "gamma blue 11",
    "gamma blue 11s",
    "gamma distribution",
    "gamma function",
    "gamma globulin",
    "gamma jack",
    "gamma knife",
    "gamma male",
    "gamma powerpoint ai",
    "gamma ppt",
    "gamma ppt ai",
    "gamma presentation tool",
    "gamma radiation",
    "gamma slide maker",
    "gamma.app ai presentation tool",
    "gamma.app presentation tool",
    "garmin connect plus ai subscription",
    "good presentation slides example",
    "google docs templates",
    "google ppt",
    "google presentation",
    "google sheets templates",
    "google slide templates",
    "google slides online presentation maker",
    "google slides presentation",
    "google slides template",
    "google slides theme",
    "graco simple sway swing",
    "graco soothe and sway",
    "how much is canva pro",
    "how sway",
    "how to add a video to google slides",
    "how to add audio to google slides",
    "how to add music to google slides",
    "how to cancel canva subscription",
    "how to make good presentation slides",
    "how to use microsoft powerpoint",
    "is canva free",
    "is microsoft powerpoint free",
    "is prezi free",
    "is slidesgo safe",
    "is slideshare safe",
    "kimi ppt",
    "microsoft ai",
    "microsoft edge",
    "microsoft forms",
    "microsoft news",
    "microsoft office",
    "microsoft outlook login",
    "microsoft powerpoint ai",
    "microsoft powerpoint copilot",
    "microsoft powerpoint for mac",
    "microsoft powerpoint free download",
    "microsoft powerpoint interface",
    "microsoft powerpoint logo",
    "microsoft powerpoint presentation",
    "microsoft powerpoint update news",
    "microsoft presentation",
    "microsoft rewards",
    "microsoft stock price",
    "microsoft store",
    "microsoft sway",
    "nike gamma force",
    "notion templates",
    "online presentation tool",
    "online tools to convert photo to cartoon",
    "online tools to convert photos to ghibli style",
    "online tools to convert text to pdf",
    "online tools to identify song from audio",
    "online tools to identify songs from audio",
    "online tools to recognize songs from audio",
    "owala free sip sway",
    "owala freesip sway",
    "owala sway",
    "plus ai for powerpoint",
    "plus ai pricing",
    "pokemon gamma emerald",
    "power point presentation",
    "powerpoint ai creator",
    "powerpoint ai designer",
    "powerpoint ai detector",
    "powerpoint ai generator free",
    "powerpoint ai news",
    "powerpoint ai tool",
    "powerpoint ai updates",
    "powerpoint ai updates news",
    "powerpoint templates",
    "ppt ai",
    "ppt maker like gamma",
    "ppt slide backgrounds",
    "ppt slide dimensions",
    "ppt slide size",
    "ppt template",
    "ppt to pdf",
    "presentation background images",
    "presentation backgrounds",
    "presentation idea",
    "presentation images",
    "presentation maker",
    "presentation slides examples",
    "presentation slides russian",
    "presentation slides topic 2025",
    "presentation software",
    "presentation synonym",
    "presentation techniques",
    "presentation tool",
    "presentations.ai pricing",
    "prezi app",
    "prezi examples",
    "prezi free",
    "prezi log in",
    "prezi powerpoint",
    "prezi presentation",
    "prezi presentation example",
    "prezi presentation software",
    "prezi presentation tool history and development",
    "prezi presentations",
    "prezi pricing",
    "prezi templates",
    "prezi video",
    "prezi website",
    "project management online tools",
    "project planning templates",
    "research presentation slides",
    "resume templates free",
    "sales performance presentation slides",
    "seo free online tools",
    "sigma gamma rho",
    "simplified ai presentation maker",
    "six sigma project slideshare",
    "slides templates",
    "slidesai free plan",
    "slidesai pricing",
    "slidesgo'",
    "slidesgo alternative",
    "slidesgo free powerpoint templates",
    "slidesgo login",
    "slidesgo.",
    "slidesgo]",
    "slideshare",
    "stalker gamma",
    "storytelling presentation slides",
    "sway back",
    "sway back posture",
    "sway bar",
    "sway bar bushings",
    "sway bar link",
    "sway bar link replacement",
    "sway bar link replacement cost",
    "sway bar links",
    "sway house members",
    "sway markets",
    "sway meaning",
    "teams microsoft",
    "templates for google slides",
    "text to powerpoint ai",
    "tome ai export to powerpoint pptx",
    "tome ai presentation",
    "tome ai presentation generator",
    "tome ai presentation maker",
    "tome ai presentation tool",
    "tome ai presentation tool features",
    "tome ai presentations official site",
    "tome ai pricing 2025",
    "tome.app ai presentation tool",
    "tools for creating presentation images",
    "tools for creating unique presentation images",
    "tools to create presentation images",
    "unspecified presentation slides 2025",
    "untitled presentation",
    "video plus ai",
    "vision and mission slideshare",
    "visme ai presentation maker",
    "visme alternatives",
    "visme free",
    "visme free plan",
    "visme free plan features",
    "visme pricing",
    "visme vs canva",
    "visme vs prezi",
    "websites like slidesgo",
    "what is a prezi",
    "what is curipod",
    "what is microsoft powerpoint",
    "what is ppt",
    "what is prezi",
    "what is slideshare",
    "what is visme",
    "wishpond 2013 pinterest marketing tips slideshare",
    "wishpond pinterest marketing tips 2013 slideshare",
    "wix templates",
    "zoho show"
];

// Generate keyword objects with slugs and categories
export const ALL_KEYWORDS: Keyword[] = RAW_KEYWORDS.map(kw => ({
    slug: slugify(kw),
    keyword: kw,
    title: titleCase(kw),
    category: categorizeKeyword(kw)
}));

// Get keywords by category
export function getKeywordsByCategory(category: KeywordCategory): Keyword[] {
    return ALL_KEYWORDS.filter(k => k.category === category);
}

// Get keyword by slug
export function getKeywordBySlug(slug: string): Keyword | undefined {
    return ALL_KEYWORDS.find(k => k.slug === slug);
}

// Get all slugs for static params
export function getAllKeywordSlugs(): string[] {
    return ALL_KEYWORDS.map(k => k.slug);
}

// Get top keywords for combo generation (exclude 'other' category for relevance)
export function getTopKeywordsForCombos(): Keyword[] {
    return ALL_KEYWORDS.filter(k =>
        k.category !== 'other' ||
        k.keyword.toLowerCase().includes('presentation') ||
        k.keyword.toLowerCase().includes('slide') ||
        k.keyword.toLowerCase().includes('ppt')
    );
}

// Category counts for reference
export const KEYWORD_STATS = {
    total: ALL_KEYWORDS.length,
    byCategory: {
        'ai-tools': getKeywordsByCategory('ai-tools').length,
        'powerpoint': getKeywordsByCategory('powerpoint').length,
        'google-slides': getKeywordsByCategory('google-slides').length,
        'competitor': getKeywordsByCategory('competitor').length,
        'presentation': getKeywordsByCategory('presentation').length,
        'template': getKeywordsByCategory('template').length,
        'how-to': getKeywordsByCategory('how-to').length,
        'comparison': getKeywordsByCategory('comparison').length,
        'other': getKeywordsByCategory('other').length,
    }
};

// Export category arrays for convenience
export const AI_TOOL_KEYWORDS = getKeywordsByCategory('ai-tools');
export const POWERPOINT_KEYWORDS = getKeywordsByCategory('powerpoint');
export const GOOGLE_SLIDES_KEYWORDS = getKeywordsByCategory('google-slides');
export const COMPETITOR_KEYWORDS = getKeywordsByCategory('competitor');
export const PRESENTATION_KEYWORDS = getKeywordsByCategory('presentation');
export const TEMPLATE_KEYWORDS = getKeywordsByCategory('template');
export const HOW_TO_KEYWORDS = getKeywordsByCategory('how-to');
export const COMPARISON_KEYWORDS = getKeywordsByCategory('comparison');

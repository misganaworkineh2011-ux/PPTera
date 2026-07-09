// ============================================
// PPTera pSEO - Static Data Configuration
// ============================================

// Industries for generating pages
export const INDUSTRIES = [
    { slug: 'business', name: 'Business', icon: '💼' },
    { slug: 'education', name: 'Education', icon: '📚' },
    { slug: 'marketing', name: 'Marketing', icon: '📣' },
    { slug: 'sales', name: 'Sales', icon: '💰' },
    { slug: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { slug: 'technology', name: 'Technology', icon: '💻' },
    { slug: 'finance', name: 'Finance', icon: '📊' },
    { slug: 'real-estate', name: 'Real Estate', icon: '🏠' },
    { slug: 'legal', name: 'Legal', icon: '⚖️' },
    { slug: 'consulting', name: 'Consulting', icon: '🤝' },
    { slug: 'startup', name: 'Startup', icon: '🚀' },
    { slug: 'nonprofit', name: 'Non-Profit', icon: '❤️' },
    { slug: 'government', name: 'Government', icon: '🏛️' },
    { slug: 'retail', name: 'Retail', icon: '🛒' },
    { slug: 'manufacturing', name: 'Manufacturing', icon: '🏭' },
    { slug: 'hospitality', name: 'Hospitality', icon: '🏨' },
    { slug: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { slug: 'sports', name: 'Sports', icon: '⚽' },
    { slug: 'science', name: 'Science', icon: '🔬' },
    { slug: 'engineering', name: 'Engineering', icon: '⚙️' },
    { slug: 'hr', name: 'Human Resources', icon: '👥' },
    { slug: 'logistics', name: 'Logistics', icon: '📦' },
    { slug: 'insurance', name: 'Insurance', icon: '🛡️' },
    { slug: 'energy', name: 'Energy', icon: '⚡' },
    { slug: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { slug: 'architecture', name: 'Architecture', icon: '🏗️' },
    { slug: 'design', name: 'Design', icon: '🎨' },
    { slug: 'media', name: 'Media', icon: '📺' },
    { slug: 'telecommunications', name: 'Telecommunications', icon: '📡' },
    { slug: 'automotive', name: 'Automotive', icon: '🚗' },
] as const;

// Use cases for generating pages
export const USE_CASES = [
    { slug: 'pitch-deck', name: 'Pitch Deck', description: 'Investor and stakeholder presentations' },
    { slug: 'quarterly-report', name: 'Quarterly Report', description: 'Financial and progress reports' },
    { slug: 'sales-presentation', name: 'Sales Presentation', description: 'Product and service pitches' },
    { slug: 'training-materials', name: 'Training Materials', description: 'Employee and client training' },
    { slug: 'product-demo', name: 'Product Demo', description: 'Product showcase presentations' },
    { slug: 'webinar', name: 'Webinar', description: 'Online presentation materials' },
    { slug: 'conference-talk', name: 'Conference Talk', description: 'Speaking engagement slides' },
    { slug: 'team-meeting', name: 'Team Meeting', description: 'Internal team updates' },
    { slug: 'project-proposal', name: 'Project Proposal', description: 'Project pitch and plans' },
    { slug: 'annual-report', name: 'Annual Report', description: 'Yearly company reviews' },
    { slug: 'case-study', name: 'Case Study', description: 'Success story presentations' },
    { slug: 'company-overview', name: 'Company Overview', description: 'About us presentations' },
    { slug: 'portfolio', name: 'Portfolio', description: 'Work showcase presentations' },
    { slug: 'lesson-plan', name: 'Lesson Plan', description: 'Educational course materials' },
    { slug: 'research-presentation', name: 'Research Presentation', description: 'Academic and research findings' },
    { slug: 'marketing-strategy', name: 'Marketing Strategy', description: 'Marketing plan presentations' },
    { slug: 'business-plan', name: 'Business Plan', description: 'Company strategy documents' },
    { slug: 'financial-report', name: 'Financial Report', description: 'Budget and financial analysis' },
    { slug: 'onboarding', name: 'Onboarding', description: 'New employee orientation' },
    { slug: 'product-launch', name: 'Product Launch', description: 'New product announcements' },
    { slug: 'competitive-analysis', name: 'Competitive Analysis', description: 'Market competition review' },
    { slug: 'customer-presentation', name: 'Customer Presentation', description: 'Client-facing materials' },
    { slug: 'internal-communication', name: 'Internal Communication', description: 'Company-wide updates' },
    { slug: 'investor-update', name: 'Investor Update', description: 'Shareholder communications' },
    { slug: 'workshop', name: 'Workshop', description: 'Interactive session materials' },
] as const;

// Tool/keyword variations (from keywords.txt - high volume search terms)
export const TOOLS = [
    // High-volume keywords from keywords.txt (>100 searches)
    { slug: 'best-free-ai-powerpoint-generator', keyword: 'best free ai powerpoint generator', title: 'Best Free AI PowerPoint Generator' },
    { slug: 'ai-powerpoint-slide-generator', keyword: 'ai powerpoint slide generator', title: 'AI PowerPoint Slide Generator' },
    { slug: 'ai-powerpoint-presentation-generator', keyword: 'ai powerpoint presentation generator', title: 'AI PowerPoint Presentation Generator' },
    { slug: 'best-free-ai-powerpoint-generator-2024', keyword: 'best free ai powerpoint generator 2024', title: 'Best Free AI PowerPoint Generator 2024' },
    { slug: 'ai-powerpoint-maker-free', keyword: 'ai powerpoint maker free', title: 'AI PowerPoint Maker Free' },
    { slug: 'ai-powerpoint-summarizer', keyword: 'ai powerpoint summarizer', title: 'AI PowerPoint Summarizer' },
    { slug: 'free-ai-powerpoint-presentation-generator', keyword: 'free ai powerpoint presentation generator', title: 'Free AI PowerPoint Presentation Generator' },
    { slug: 'ai-powerpoint-generator-from-text', keyword: 'ai powerpoint generator from text', title: 'AI PowerPoint Generator from Text' },
    { slug: 'free-ai-powerpoint-presentation-maker', keyword: 'free ai powerpoint presentation maker', title: 'Free AI PowerPoint Presentation Maker' },
    { slug: 'best-ai-powerpoint-generator-2025', keyword: 'best ai powerpoint generator 2025', title: 'Best AI PowerPoint Generator 2025' },
    { slug: 'gamma-ai-powerpoint-generator', keyword: 'gamma ai powerpoint generator', title: 'Gamma AI PowerPoint Generator' },
    { slug: 'free-ai-powerpoint-generator-online', keyword: 'free ai powerpoint generator online', title: 'Free AI PowerPoint Generator Online' },
    { slug: 'free-ai-powerpoint-generator-from-text', keyword: 'free ai powerpoint generator from text', title: 'Free AI PowerPoint Generator from Text' },
    { slug: 'chat-gpt-powerpoint-generator', keyword: 'chat gpt powerpoint generator', title: 'ChatGPT PowerPoint Generator' },
    { slug: 'powerpoint-ai-detector', keyword: 'powerpoint ai detector', title: 'PowerPoint AI Detector' },
    { slug: 'powerpoint-ai-tool', keyword: 'powerpoint ai tool', title: 'PowerPoint AI Tool' },
    { slug: 'text-to-powerpoint-ai', keyword: 'text to powerpoint ai', title: 'Text to PowerPoint AI' },
    { slug: 'best-powerpoint-ai', keyword: 'best powerpoint ai', title: 'Best PowerPoint AI' },
    { slug: 'microsoft-powerpoint-ai', keyword: 'microsoft powerpoint ai', title: 'Microsoft PowerPoint AI' },
    { slug: 'powerpoint-ai-updates', keyword: 'powerpoint ai updates', title: 'PowerPoint AI Updates' },
    { slug: 'powerpoint-ai-creator', keyword: 'powerpoint ai creator', title: 'PowerPoint AI Creator' },
    { slug: 'powerpoint-ai-generator-free', keyword: 'powerpoint ai generator free', title: 'PowerPoint AI Generator Free' },
    { slug: 'powerpoint-ai-updates-news', keyword: 'powerpoint ai updates news', title: 'PowerPoint AI Updates News' },
    { slug: 'gamma-ai-presentation-maker', keyword: 'gamma ai presentation maker', title: 'Gamma AI Presentation Maker' },
    { slug: 'gamma-ai-tool', keyword: 'gamma ai tool', title: 'Gamma AI Tool' },
    { slug: 'gamma-ai-app', keyword: 'gamma ai app', title: 'Gamma AI App' },
    { slug: 'gamma-ai-free', keyword: 'gamma ai free', title: 'Gamma AI Free' },
    { slug: 'what-is-gamma-ai', keyword: 'what is gamma ai', title: 'What Is Gamma AI' },
    { slug: 'gamma-ai-presentation-tool', keyword: 'gamma ai presentation tool gamma.app', title: 'Gamma AI Presentation Tool' },
    { slug: 'gamma-ai-logo', keyword: 'gamma ai logo', title: 'Gamma AI Logo' },
    { slug: 'gamma-ai-presentation-builder', keyword: 'gamma ai presentation builder', title: 'Gamma AI Presentation Builder' },
    { slug: 'gamma-ai-cloud-dlp-saas', keyword: 'gamma ai cloud dlp saas gamma.ai', title: 'Gamma AI Cloud DLP SaaS' },
    { slug: 'canva-ai-slide-generator', keyword: 'canva ai slide generator', title: 'Canva AI Slide Generator' },
    { slug: 'ai-slide-maker-free', keyword: 'ai slide maker free', title: 'AI Slide Maker Free' },
    { slug: 'ai-slide-show-creator', keyword: 'ai slide show creator', title: 'AI Slide Show Creator' },
    { slug: 'ai-slide-deck', keyword: 'ai slide deck', title: 'AI Slide Deck' },
    { slug: 'ai-slide-designer', keyword: 'ai slide designer', title: 'AI Slide Designer' },
    { slug: 'ai-slide-builder', keyword: 'ai slide builder', title: 'AI Slide Builder' },
    { slug: 'gamma-app-presentation-ai', keyword: 'gamma app presentation ai', title: 'Gamma App Presentation AI' },
    { slug: 'presentation-ai-tools', keyword: 'presentation ai tools', title: 'Presentation AI Tools' },
    { slug: 'pptera', keyword: 'PPTera', title: 'PPTera' },
    { slug: 'pptera-ai', keyword: 'PPTera AI', title: 'PPTera AI' },
    { slug: 'pptera-presentation-generator', keyword: 'PPTera presentation generator', title: 'PPTera Presentation Generator' },
    { slug: 'pptera-powerpoint-ai', keyword: 'PPTera PowerPoint AI', title: 'PPTera PowerPoint AI' },
    // Additional keywords from keywords.txt (Jan 2026)
    { slug: 'powerpoint-download', keyword: 'powerpoint download', title: 'PowerPoint Download' },
    { slug: 'powerpoint-night-ideas', keyword: 'powerpoint night ideas', title: 'PowerPoint Night Ideas' },
    { slug: 'convert-pdf-to-powerpoint', keyword: 'convert pdf to powerpoint', title: 'Convert PDF to PowerPoint' },
    { slug: 'powerpoint-login', keyword: 'powerpoint login', title: 'PowerPoint Login' },
    { slug: 'powerpoint-template', keyword: 'powerpoint template', title: 'PowerPoint Template' },
    { slug: 'powerpoint-slides', keyword: 'powerpoint slides', title: 'PowerPoint Slides' },
    { slug: 'powerpoint-backgrounds', keyword: 'powerpoint backgrounds', title: 'PowerPoint Backgrounds' },
    { slug: 'pdf-to-powerpoint-converter', keyword: 'pdf to powerpoint converter', title: 'PDF to PowerPoint Converter' },
    { slug: 'powerpoint-background', keyword: 'powerpoint background', title: 'PowerPoint Background' },
    { slug: 'best-ai-ppt-generator', keyword: 'best ai ppt generator', title: 'Best AI PPT Generator' },
    { slug: 'gamma-ai-ppt-maker', keyword: 'gamma ai ppt maker', title: 'Gamma AI PPT Maker' },
    { slug: 'canva-ai-presentation-maker', keyword: 'canva ai presentation maker', title: 'Canva AI Presentation Maker' },
    { slug: 'video-presentation-maker', keyword: 'video presentation maker', title: 'Video Presentation Maker' },
    { slug: 'best-ai-presentation-maker-2024', keyword: 'best ai presentation maker 2024', title: 'Best AI Presentation Maker 2024' },
    { slug: 'visme-ai-presentation-maker', keyword: 'visme ai presentation maker', title: 'Visme AI Presentation Maker' },
    { slug: 'ai-presentation-maker-free-online', keyword: 'ai presentation maker free online', title: 'AI Presentation Maker Free Online' },
    { slug: 'best-ai-presentation-maker-2025', keyword: 'best ai presentation maker 2025', title: 'Best AI Presentation Maker 2025' },
    { slug: 'adobe-express-ai-presentation-maker', keyword: 'adobe express ai presentation maker', title: 'Adobe Express AI Presentation Maker' },
    { slug: 'ome-ai-presentation-generator', keyword: 'ome ai presentation generator', title: 'Ome AI Presentation Generator' },
    { slug: 'ai-presentation-generator-tools', keyword: 'ai presentation generator tools', title: 'AI Presentation Generator Tools' },
    { slug: 'best-ai-presentation-generator-2025', keyword: 'best ai presentation generator 2025', title: 'Best AI Presentation Generator 2025' },
    { slug: 'ai-presentation-generator-tool', keyword: 'ai presentation generator tool', title: 'AI Presentation Generator Tool' },
    { slug: 'best-free-ai-presentation-generator', keyword: 'best free ai presentation generator', title: 'Best Free AI Presentation Generator' },
    { slug: 'ai-presentation-generator-from-text', keyword: 'ai presentation generator from text', title: 'AI Presentation Generator from Text' },
    { slug: 'gamma-ai-presentation-generator', keyword: 'gamma ai presentation generator', title: 'Gamma AI Presentation Generator' },
    
    // Original keywords
    { slug: 'ai-powerpoint-generator', keyword: 'ai powerpoint generator', title: 'AI PowerPoint Generator' },
    { slug: 'ai-presentation-maker', keyword: 'ai presentation maker', title: 'AI Presentation Maker' },
    { slug: 'ai-slide-creator', keyword: 'ai slide creator', title: 'AI Slide Creator' },
    { slug: 'free-powerpoint-maker', keyword: 'free powerpoint maker', title: 'Free PowerPoint Maker' },
    { slug: 'free-presentation-generator', keyword: 'free presentation generator', title: 'Free Presentation Generator' },
    { slug: 'ai-ppt-maker', keyword: 'ai ppt maker', title: 'AI PPT Maker' },
    { slug: 'online-presentation-maker', keyword: 'online presentation maker', title: 'Online Presentation Maker' },
    { slug: 'automatic-slide-generator', keyword: 'automatic slide generator', title: 'Automatic Slide Generator' },
    { slug: 'ai-slideshow-creator', keyword: 'ai slideshow creator', title: 'AI Slideshow Creator' },
    { slug: 'presentation-ai', keyword: 'presentation ai', title: 'Presentation AI' },
    { slug: 'powerpoint-ai', keyword: 'powerpoint ai', title: 'PowerPoint AI' },
    { slug: 'smart-presentation-maker', keyword: 'smart presentation maker', title: 'Smart Presentation Maker' },
    { slug: 'instant-presentation-generator', keyword: 'instant presentation generator', title: 'Instant Presentation Generator' },
    { slug: 'ai-deck-builder', keyword: 'ai deck builder', title: 'AI Deck Builder' },
    { slug: 'professional-slide-maker', keyword: 'professional slide maker', title: 'Professional Slide Maker' },
    { slug: 'best-ai-powerpoint', keyword: 'best ai powerpoint', title: 'Best AI PowerPoint Tool' },
    { slug: 'ai-presentation-generator', keyword: 'ai presentation generator', title: 'AI Presentation Generator' },
    { slug: 'slides-ai-generator', keyword: 'slides ai generator', title: 'Slides AI Generator' },
    { slug: 'ppt-ai-generator', keyword: 'ppt ai generator', title: 'PPT AI Generator' },
    { slug: 'presentation-maker-ai', keyword: 'presentation maker ai', title: 'Presentation Maker AI' },
] as const;

// How-to guides
export const HOW_TO_GUIDES = [
    { slug: 'create-ai-powerpoint', title: 'How to Create AI PowerPoint Presentations', keyword: 'create ai powerpoint' },
    { slug: 'make-presentation-with-ai', title: 'How to Make Presentations with AI', keyword: 'make presentation with ai' },
    { slug: 'design-professional-slides', title: 'How to Design Professional Slides', keyword: 'design professional slides' },
    { slug: 'create-pitch-deck', title: 'How to Create a Pitch Deck', keyword: 'create pitch deck' },
    { slug: 'make-business-presentation', title: 'How to Make a Business Presentation', keyword: 'make business presentation' },
    { slug: 'generate-slides-from-text', title: 'How to Generate Slides from Text', keyword: 'generate slides from text' },
    { slug: 'create-stunning-presentations', title: 'How to Create Stunning Presentations', keyword: 'create stunning presentations' },
    { slug: 'make-powerpoint-fast', title: 'How to Make PowerPoint Fast', keyword: 'make powerpoint fast' },
    { slug: 'use-ai-for-presentations', title: 'How to Use AI for Presentations', keyword: 'use ai for presentations' },
    { slug: 'create-sales-presentation', title: 'How to Create a Sales Presentation', keyword: 'create sales presentation' },
    { slug: 'make-investor-deck', title: 'How to Make an Investor Deck', keyword: 'make investor deck' },
    { slug: 'design-marketing-slides', title: 'How to Design Marketing Slides', keyword: 'design marketing slides' },
    { slug: 'create-training-presentation', title: 'How to Create Training Presentations', keyword: 'create training presentation' },
    { slug: 'make-educational-slides', title: 'How to Make Educational Slides', keyword: 'make educational slides' },
    { slug: 'build-company-presentation', title: 'How to Build a Company Presentation', keyword: 'build company presentation' },
] as const;

// Template topics
export const TEMPLATE_TOPICS = [
    { slug: 'business-proposal', name: 'Business Proposal', category: 'business' },
    { slug: 'marketing-strategy', name: 'Marketing Strategy', category: 'marketing' },
    { slug: 'project-timeline', name: 'Project Timeline', category: 'project' },
    { slug: 'financial-report', name: 'Financial Report', category: 'finance' },
    { slug: 'team-introduction', name: 'Team Introduction', category: 'company' },
    { slug: 'product-roadmap', name: 'Product Roadmap', category: 'product' },
    { slug: 'company-profile', name: 'Company Profile', category: 'company' },
    { slug: 'sales-pitch', name: 'Sales Pitch', category: 'sales' },
    { slug: 'investor-pitch', name: 'Investor Pitch', category: 'startup' },
    { slug: 'startup-pitch-deck', name: 'Startup Pitch Deck', category: 'startup' },
    { slug: 'quarterly-review', name: 'Quarterly Review', category: 'business' },
    { slug: 'annual-report', name: 'Annual Report', category: 'business' },
    { slug: 'case-study', name: 'Case Study', category: 'marketing' },
    { slug: 'competitive-analysis', name: 'Competitive Analysis', category: 'strategy' },
    { slug: 'swot-analysis', name: 'SWOT Analysis', category: 'strategy' },
    { slug: 'market-research', name: 'Market Research', category: 'research' },
    { slug: 'customer-journey', name: 'Customer Journey', category: 'marketing' },
    { slug: 'brand-guidelines', name: 'Brand Guidelines', category: 'branding' },
    { slug: 'social-media-strategy', name: 'Social Media Strategy', category: 'marketing' },
    { slug: 'content-calendar', name: 'Content Calendar', category: 'marketing' },
    { slug: 'employee-handbook', name: 'Employee Handbook', category: 'hr' },
    { slug: 'onboarding-deck', name: 'Onboarding Deck', category: 'hr' },
    { slug: 'training-manual', name: 'Training Manual', category: 'training' },
    { slug: 'workshop-slides', name: 'Workshop Slides', category: 'training' },
    { slug: 'lesson-plan', name: 'Lesson Plan', category: 'education' },
    { slug: 'course-overview', name: 'Course Overview', category: 'education' },
    { slug: 'research-findings', name: 'Research Findings', category: 'research' },
    { slug: 'thesis-presentation', name: 'Thesis Presentation', category: 'education' },
    { slug: 'conference-presentation', name: 'Conference Presentation', category: 'professional' },
    { slug: 'webinar-deck', name: 'Webinar Deck', category: 'professional' },
] as const;

// Alternatives/competitors
export const ALTERNATIVES = [
    { slug: 'gamma-ai', name: 'Gamma AI', domain: 'gamma.app' },
    { slug: 'canva', name: 'Canva', domain: 'canva.com' },
    { slug: 'beautiful-ai', name: 'Beautiful.ai', domain: 'beautiful.ai' },
    { slug: 'tome', name: 'Tome', domain: 'tome.app' },
    { slug: 'slidebean', name: 'Slidebean', domain: 'slidebean.com' },
    { slug: 'pitch', name: 'Pitch', domain: 'pitch.com' },
    { slug: 'prezi', name: 'Prezi', domain: 'prezi.com' },
    { slug: 'visme', name: 'Visme', domain: 'visme.co' },
    { slug: 'google-slides', name: 'Google Slides', domain: 'slides.google.com' },
    { slug: 'powerpoint', name: 'Microsoft PowerPoint', domain: 'microsoft.com' },
] as const;

// Type exports
export type Industry = typeof INDUSTRIES[number];
export type UseCase = typeof USE_CASES[number];
export type Tool = typeof TOOLS[number];
export type HowToGuide = typeof HOW_TO_GUIDES[number];
export type TemplateTopic = typeof TEMPLATE_TOPICS[number];
export type Alternative = typeof ALTERNATIVES[number];

// Helper functions
export function getIndustryBySlug(slug: string) {
    return INDUSTRIES.find(i => i.slug === slug);
}

export function getUseCaseBySlug(slug: string) {
    return USE_CASES.find(u => u.slug === slug);
}

export function getToolBySlug(slug: string) {
    return TOOLS.find(t => t.slug === slug);
}

export function generateComboSlug(industry: string, useCase: string) {
    return `${industry}-${useCase}`;
}

// Generate all possible combo slugs for static params
export function getAllComboSlugs() {
    const combos: string[] = [];
    for (const industry of INDUSTRIES) {
        for (const useCase of USE_CASES) {
            combos.push(generateComboSlug(industry.slug, useCase.slug));
        }
    }
    return combos;
}

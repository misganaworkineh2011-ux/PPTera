// ============================================
// PPTMaster pSEO - Content Generation Utilities
// ============================================

import {
    INDUSTRIES,
    USE_CASES,
    TOOLS,
    HOW_TO_GUIDES,
    TEMPLATE_TOPICS,
    ALTERNATIVES,
    type Industry,
    type UseCase,
    type Tool,
} from './page-data';

// Content generation for different page types

export interface SEOPageContent {
    title: string;
    metaTitle: string;
    metaDescription: string;
    h1Title: string;
    heroSubtitle: string;
    heroCta: string;
    features: Feature[];
    faqs: FAQ[];
    keywords: string[];
    contentSections?: ContentSection[];
}

interface Feature {
    title: string;
    description: string;
    icon: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface ContentSection {
    title: string;
    body: string;
    bullets?: string[];
}

// ============================================
// TOOL PAGES CONTENT
// ============================================

export function generateToolPageContent(tool: Tool): SEOPageContent {
    const keyword = tool.keyword.toLowerCase();
    const isFree = keyword.includes("free");
    const isFromText = keyword.includes("from text") || keyword.includes("text to");
    const isDetector = keyword.includes("detector");
    const isUpdates = keyword.includes("updates") || keyword.includes("news");
    const isGamma = keyword.includes("gamma");
    const isCanva = keyword.includes("canva");
    const isChatGpt = keyword.includes("chat gpt") || keyword.includes("chatgpt");
    const isMicrosoft = keyword.includes("microsoft");
    const isSlide = keyword.includes("slide") || keyword.includes("deck");
    const isBuilder = keyword.includes("builder") || keyword.includes("creator") || keyword.includes("maker");
    const isBrand = keyword.includes("pptmaster");

    const primaryUse = isDetector
        ? "detecting AI-assisted slide content"
        : isFromText
        ? "turning text outlines into slides"
        : isUpdates
        ? "tracking new capabilities and release notes"
        : "creating presentations faster";

    const contentSections: ContentSection[] = [
        {
            title: `What is ${tool.title}?`,
            body: `${tool.title} is a ${tool.keyword}-focused workflow for ${primaryUse}. PPTMaster helps you go from idea to presentation quickly with editable slides, consistent styling, and export-ready files.`,
        },
        {
            title: "Who it’s for",
            body: "Designed for founders, marketers, educators, analysts, and teams who need clear, polished slides without spending hours on formatting.",
            bullets: [
                "Busy professionals who need reliable, on-brand slides",
                "Teams collaborating on decks with consistent layouts",
                "Creators who want fast drafts that are fully editable",
            ],
        },
    ];

    if (isFromText) {
        contentSections.push({
            title: "Turn text into slides",
            body: "Paste bullet points or a brief outline and generate a structured deck. PPTMaster maps sections to slide layouts and keeps the narrative flow intact.",
            bullets: [
                "Import outlines, briefs, or meeting notes",
                "Auto-generate slide structure and headings",
                "Edit content inline without breaking layout",
            ],
        });
    }

    if (isDetector) {
        contentSections.push({
            title: "AI detection considerations",
            body: "AI detection tools can produce false positives. Use them as a signal, not a final verdict, and always review content quality, sourcing, and factual accuracy.",
            bullets: [
                "Treat detection as a heuristic, not a guarantee",
                "Validate claims with human review",
                "Prefer transparency over over-reliance on scores",
            ],
        });
    }

    if (isUpdates) {
        contentSections.push({
            title: "How to evaluate AI PowerPoint updates",
            body: "Focus on changes that improve structure, editing control, collaboration, and export reliability. Track improvements that save time or reduce rework.",
            bullets: [
                "Template variety and layout stability",
                "Export fidelity to .pptx and PDF",
                "Editing speed and collaboration support",
            ],
        });
    }

    if (isGamma || isCanva) {
        contentSections.push({
            title: `Comparing ${tool.title} to alternatives`,
            body: "If you’re evaluating tools, compare output quality, editability, and export options. PPTMaster focuses on clean slide structure and fast iteration.",
            bullets: [
                "Look for editable, layout-safe slide outputs",
                "Check template depth and brand customization",
                "Ensure export quality for PowerPoint workflows",
            ],
        });
    }

    if (isFree) {
        contentSections.push({
            title: "Free usage and upgrades",
            body: "Start with free credits to test the workflow. Upgrade when you need more generations, custom branding, or team collaboration features.",
            bullets: [
                "Free credits for quick trials",
                "Pay only when you need higher volume",
                "Keep all outputs fully editable",
            ],
        });
    }

    if (isChatGpt || isMicrosoft || isSlide || isBuilder || isBrand) {
        contentSections.push({
            title: "What makes a good AI slide tool",
            body: "Prioritize clarity, export stability, and editing control. A strong tool generates a clean structure and lets you refine each slide without layout drift.",
            bullets: [
                "Consistent typography and spacing",
                "Editable content blocks and layouts",
                "Reliable .pptx export for PowerPoint",
            ],
        });
    }
    return {
        title: `${tool.title} - Create Stunning Presentations | PPTMaster`,
        metaTitle: `${tool.title} - Free AI Presentation Creator | PPTMaster`,
        metaDescription: `Create professional presentations instantly with our ${tool.keyword}. No design skills needed. 100+ templates, AI-powered slides generator. Try free!`,
        h1Title: `${tool.title}`,
        heroSubtitle: `Create stunning presentations in seconds with our ${tool.keyword}. Just describe your topic and let AI do the rest.`,
        heroCta: 'Create Presentation Free',
        features: [
            {
                title: 'AI-Powered Generation',
                description: `Our ${tool.keyword} uses advanced AI to create professional slides instantly from your text.`,
                icon: '🤖',
            },
            {
                title: '100+ Professional Templates',
                description: 'Choose from a vast library of stunning templates for any occasion or industry.',
                icon: '🎨',
            },
            {
                title: 'Export to PowerPoint',
                description: 'Download your presentations as .pptx files compatible with Microsoft PowerPoint.',
                icon: '📥',
            },
            {
                title: 'No Design Skills Required',
                description: 'Our AI handles the design, layout, and formatting automatically.',
                icon: '✨',
            },
        ],
        faqs: [
            {
                question: `What is an ${tool.keyword}?`,
                answer: `An ${tool.keyword} is a tool that uses artificial intelligence to automatically create professional presentations from text prompts. PPTMaster's ${tool.keyword} transforms your ideas into stunning slides in seconds.`,
            },
            {
                question: `Is the ${tool.keyword} free to use?`,
                answer: 'Yes! PPTMaster offers free credits to create presentations. You can generate professional slides without paying anything to get started.',
            },
            {
                question: 'How does the AI create presentations?',
                answer: 'Simply enter your topic or paste your content, and our AI analyzes it to create well-structured, visually appealing slides with appropriate content, images, and layouts.',
            },
            {
                question: 'Can I edit the AI-generated slides?',
                answer: 'Absolutely! All generated slides are fully editable. You can modify text, change images, adjust layouts, and customize colors to match your brand.',
            },
            {
                question: 'What formats can I export to?',
                answer: 'You can export your presentations as PowerPoint (.pptx), PDF, or share them directly via a link. Perfect for any presentation need.',
            },
        ].concat(
            isDetector
                ? [{
                    question: "Are AI detectors always accurate for slides?",
                    answer: "No. AI detectors can be inconsistent across models and content types. Use them as guidance and validate with human review.",
                }]
                : [],
        ).concat(
            isFromText
                ? [{
                    question: "Can I create a deck from an outline?",
                    answer: "Yes. Paste an outline or bullet list and PPTMaster will generate structured slides you can edit and export.",
                }]
                : [],
        ).concat(
            isGamma || isCanva
                ? [{
                    question: `How is PPTMaster different from ${isGamma ? "Gamma" : "Canva"}?`,
                    answer: "PPTMaster focuses on structured slide output, fast editing, and clean PowerPoint exports so teams can refine slides quickly.",
                }]
                : [],
        ),
        keywords: [tool.keyword, 'ai presentation', 'powerpoint generator', 'slide maker', 'ppt creator'],
        contentSections,
    };
}

// ============================================
// INDUSTRY PAGES CONTENT
// ============================================

export function generateIndustryPageContent(industry: Industry): SEOPageContent {
    return {
        title: `${industry.name} Presentations | AI-Powered Slides | PPTMaster`,
        metaTitle: `${industry.name} Presentation Maker - Free AI Slides | PPTMaster`,
        metaDescription: `Create professional ${industry.name.toLowerCase()} presentations with AI. Templates designed for ${industry.name.toLowerCase()} industry. Generate stunning slides in seconds. Try free!`,
        h1Title: `${industry.icon} ${industry.name} Presentations`,
        heroSubtitle: `Create stunning ${industry.name.toLowerCase()} presentations with AI. Designed specifically for ${industry.name.toLowerCase()} professionals.`,
        heroCta: `Create ${industry.name} Presentation`,
        features: [
            {
                title: `${industry.name} Templates`,
                description: `Professional templates designed specifically for the ${industry.name.toLowerCase()} industry.`,
                icon: industry.icon,
            },
            {
                title: 'Industry-Specific Content',
                description: `AI trained on ${industry.name.toLowerCase()} best practices and terminology.`,
                icon: '📋',
            },
            {
                title: 'Professional Design',
                description: `Colors, layouts, and styles that resonate with ${industry.name.toLowerCase()} audiences.`,
                icon: '🎯',
            },
            {
                title: 'Quick Customization',
                description: 'Easy-to-edit slides that match your brand guidelines.',
                icon: '⚡',
            },
        ],
        faqs: [
            {
                question: `How do I create a ${industry.name.toLowerCase()} presentation?`,
                answer: `Simply describe your ${industry.name.toLowerCase()} presentation topic, and PPTMaster's AI will generate professional slides tailored to your industry. You can then customize and export to PowerPoint.`,
            },
            {
                question: `What types of ${industry.name.toLowerCase()} presentations can I create?`,
                answer: `Create any type of ${industry.name.toLowerCase()} presentation including pitch decks, reports, training materials, client presentations, and more.`,
            },
            {
                question: `Are the ${industry.name.toLowerCase()} templates free?`,
                answer: 'Yes! PPTMaster offers free credits to create presentations using our industry-specific templates.',
            },
        ],
        keywords: [`${industry.name.toLowerCase()} presentation`, `${industry.name.toLowerCase()} slides`, `${industry.name.toLowerCase()} powerpoint`, 'business presentation'],
    };
}

// ============================================
// USE CASE PAGES CONTENT
// ============================================

export function generateUseCasePageContent(useCase: UseCase): SEOPageContent {
    return {
        title: `${useCase.name} Generator | AI-Powered | PPTMaster`,
        metaTitle: `${useCase.name} Creator - Free AI Presentation | PPTMaster`,
        metaDescription: `Create professional ${useCase.name.toLowerCase()} presentations with AI. ${useCase.description}. Generate stunning slides in seconds. Try free!`,
        h1Title: `${useCase.name} Generator`,
        heroSubtitle: `Create professional ${useCase.name.toLowerCase()} presentations instantly. ${useCase.description}.`,
        heroCta: `Create ${useCase.name}`,
        features: [
            {
                title: `${useCase.name} Templates`,
                description: `Purpose-built templates for ${useCase.name.toLowerCase()} presentations.`,
                icon: '📊',
            },
            {
                title: 'AI Content Generation',
                description: `Smart content suggestions for effective ${useCase.name.toLowerCase()} slides.`,
                icon: '🤖',
            },
            {
                title: 'Professional Structure',
                description: `Proven slide structures that work for ${useCase.name.toLowerCase()}.`,
                icon: '📐',
            },
            {
                title: 'Easy Export',
                description: 'Download as PowerPoint, PDF, or share online.',
                icon: '📤',
            },
        ],
        faqs: [
            {
                question: `How do I create a ${useCase.name.toLowerCase()}?`,
                answer: `Enter your topic or content for your ${useCase.name.toLowerCase()}, and PPTMaster's AI will generate a professional presentation structure with compelling slides.`,
            },
            {
                question: `What makes a good ${useCase.name.toLowerCase()}?`,
                answer: `A great ${useCase.name.toLowerCase()} has clear structure, engaging visuals, and focused messaging. PPTMaster's AI ensures your presentation follows best practices.`,
            },
        ],
        keywords: [`${useCase.name.toLowerCase()}`, `${useCase.name.toLowerCase()} template`, `${useCase.name.toLowerCase()} presentation`, 'presentation maker'],
    };
}

// ============================================
// COMBO PAGES CONTENT (Industry + Use Case)
// ============================================

export function generateComboPageContent(industry: Industry, useCase: UseCase): SEOPageContent {
    return {
        title: `${industry.name} ${useCase.name} | AI Presentation | PPTMaster`,
        metaTitle: `${industry.name} ${useCase.name} Generator - Free AI | PPTMaster`,
        metaDescription: `Create ${industry.name.toLowerCase()} ${useCase.name.toLowerCase()} presentations with AI. Professional templates for ${industry.name.toLowerCase()}. Generate slides instantly. Try free!`,
        h1Title: `${industry.icon} ${industry.name} ${useCase.name}`,
        heroSubtitle: `Create professional ${industry.name.toLowerCase()} ${useCase.name.toLowerCase()} presentations in seconds with AI.`,
        heroCta: `Create ${industry.name} ${useCase.name}`,
        features: [
            {
                title: `${industry.name} Focus`,
                description: `Templates and content tailored for the ${industry.name.toLowerCase()} industry.`,
                icon: industry.icon,
            },
            {
                title: `${useCase.name} Structure`,
                description: `Proven ${useCase.name.toLowerCase()} formats that deliver results.`,
                icon: '📈',
            },
            {
                title: 'AI-Powered Design',
                description: 'Professional layouts and visuals generated automatically.',
                icon: '🎨',
            },
            {
                title: 'Ready in Seconds',
                description: 'From idea to presentation in under a minute.',
                icon: '⚡',
            },
        ],
        faqs: [
            {
                question: `How do I create a ${industry.name.toLowerCase()} ${useCase.name.toLowerCase()}?`,
                answer: `Simply describe your ${industry.name.toLowerCase()} ${useCase.name.toLowerCase()} topic, and our AI will generate professional slides with industry-appropriate content and design.`,
            },
        ],
        keywords: [
            `${industry.name.toLowerCase()} ${useCase.name.toLowerCase()}`,
            `${industry.name.toLowerCase()} presentation`,
            `${useCase.name.toLowerCase()} template`,
        ],
    };
}

// ============================================
// HOW-TO PAGES CONTENT  
// ============================================

export function generateHowToPageContent(guide: typeof HOW_TO_GUIDES[number]): SEOPageContent {
    return {
        title: `${guide.title} | Step-by-Step Guide | PPTMaster`,
        metaTitle: `${guide.title} - Free Guide | PPTMaster`,
        metaDescription: `Learn ${guide.keyword} with our step-by-step guide. Create professional presentations with AI. Easy tutorial for beginners. Try free!`,
        h1Title: guide.title,
        heroSubtitle: `Step-by-step guide to ${guide.keyword}. Create stunning presentations with AI.`,
        heroCta: 'Try It Free',
        features: [
            {
                title: 'Step-by-Step Instructions',
                description: 'Easy-to-follow guide for creating professional presentations.',
                icon: '📝',
            },
            {
                title: 'AI Assistance',
                description: 'Let AI help you at every step of the process.',
                icon: '🤖',
            },
            {
                title: 'Pro Tips Included',
                description: 'Expert advice for making your presentations stand out.',
                icon: '💡',
            },
            {
                title: 'Free to Start',
                description: 'Follow along and create your first presentation for free.',
                icon: '🎁',
            },
        ],
        faqs: [
            {
                question: `What's the best way to ${guide.keyword}?`,
                answer: `The easiest way to ${guide.keyword} is using PPTMaster's AI. Simply enter your topic, and our AI will generate professional slides automatically.`,
            },
            {
                question: 'Do I need design skills?',
                answer: 'No! PPTMaster handles all the design work. You just provide the content or topic, and AI creates beautiful slides.',
            },
        ],
        keywords: [guide.keyword, 'how to', 'tutorial', 'presentation guide'],
    };
}

// ============================================
// ALTERNATIVES PAGES CONTENT
// ============================================

export function generateAlternativePageContent(alt: typeof ALTERNATIVES[number]): SEOPageContent {
    return {
        title: `${alt.name} Alternative | PPTMaster - Free AI Presentations`,
        metaTitle: `Best ${alt.name} Alternative - Free AI Slides | PPTMaster`,
        metaDescription: `Looking for a ${alt.name} alternative? PPTMaster offers free AI-powered presentations. Create stunning slides without paying. Try free!`,
        h1Title: `${alt.name} Alternative`,
        heroSubtitle: `The best free alternative to ${alt.name}. Create stunning AI-powered presentations without limits.`,
        heroCta: 'Try PPTMaster Free',
        features: [
            {
                title: 'Free to Start',
                description: `Unlike ${alt.name}, PPTMaster offers free credits to create presentations.`,
                icon: '🎁',
            },
            {
                title: 'AI-Powered',
                description: 'Advanced AI generates professional slides from your text.',
                icon: '🤖',
            },
            {
                title: 'PowerPoint Export',
                description: 'Download as .pptx for full compatibility with Microsoft PowerPoint.',
                icon: '📥',
            },
            {
                title: 'No Learning Curve',
                description: 'Intuitive interface that anyone can use immediately.',
                icon: '✨',
            },
        ],
        faqs: [
            {
                question: `Why choose PPTMaster over ${alt.name}?`,
                answer: `PPTMaster offers free AI-powered presentation generation, easy PowerPoint export, and a simpler interface compared to ${alt.name}.`,
            },
            {
                question: `Is PPTMaster really free?`,
                answer: 'Yes! PPTMaster offers free credits to create presentations. No credit card required to get started.',
            },
        ],
        keywords: [`${alt.name.toLowerCase()} alternative`, 'free presentation maker', 'ai slides'],
    };
}

// ============================================
// TEMPLATE PAGES CONTENT
// ============================================

export function generateTemplatePageContent(template: typeof TEMPLATE_TOPICS[number]): SEOPageContent {
    return {
        title: `${template.name} Template | Free PowerPoint | PPTMaster`,
        metaTitle: `${template.name} Template - Free AI Slides | PPTMaster`,
        metaDescription: `Free ${template.name.toLowerCase()} presentation template. AI-powered slides ready to customize. Download as PowerPoint. Try free!`,
        h1Title: `${template.name} Template`,
        heroSubtitle: `Professional ${template.name.toLowerCase()} template ready to customize. AI-powered design included.`,
        heroCta: `Use This Template`,
        features: [
            {
                title: 'Professional Design',
                description: `Beautifully designed ${template.name.toLowerCase()} slides.`,
                icon: '🎨',
            },
            {
                title: 'AI Customization',
                description: 'Let AI help you customize content for your needs.',
                icon: '🤖',
            },
            {
                title: 'Fully Editable',
                description: 'Complete control over every element.',
                icon: '✏️',
            },
            {
                title: 'PowerPoint Compatible',
                description: 'Download as .pptx for Microsoft PowerPoint.',
                icon: '📊',
            },
        ],
        faqs: [
            {
                question: `How do I use the ${template.name.toLowerCase()} template?`,
                answer: `Click "Use This Template" to start customizing. Add your content, and our AI will help you create the perfect ${template.name.toLowerCase()} presentation.`,
            },
        ],
        keywords: [`${template.name.toLowerCase()} template`, `${template.name.toLowerCase()} powerpoint`, 'free template'],
    };
}

// Related page with title for better display
export interface RelatedPage {
    slug: string;
    title: string;
}

// Get related pages for internal linking
export function getRelatedPages(currentSlug: string, pageType: string): RelatedPage[] {
    const related: RelatedPage[] = [];

    // Add tools
    TOOLS.slice(0, 2).forEach(t => {
        if (t.slug !== currentSlug) {
            related.push({
                slug: `/tools/${t.slug}`,
                title: t.title
            });
        }
    });

    // Add industries (using correct /industries/[slug] route)
    INDUSTRIES.slice(0, 2).forEach(i => {
        related.push({
            slug: `/industries/${i.slug}`,
            title: `${i.name} Presentations`
        });
    });

    // Add use cases
    USE_CASES.slice(0, 2).forEach(u => {
        related.push({
            slug: `/create/${u.slug}`,
            title: `${u.name} Generator`
        });
    });

    return related.slice(0, 6);
}

// Legacy function for backward compatibility
export function getRelatedPageSlugs(currentSlug: string, pageType: string): string[] {
    return getRelatedPages(currentSlug, pageType).map(p => p.slug);
}

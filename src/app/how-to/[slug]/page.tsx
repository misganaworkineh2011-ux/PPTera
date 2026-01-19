import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import {
    SEOPageHero,
    SEOFeatureGrid,
    SEOFAQSection,
    SEOHowItWorks,
    SEOCTASection,
    SEORelatedPages,
} from "~/components/seo";
import { HOW_TO_GUIDES } from "~/lib/seo/page-data";
import { generateHowToPageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Generate all how-to pages at build time
export async function generateStaticParams() {
    return HOW_TO_GUIDES.map((guide) => ({
        slug: guide.slug,
    }));
}

function getGuideBySlug(slug: string) {
    return HOW_TO_GUIDES.find(g => g.slug === slug);
}

// Generate metadata for each how-to page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        return { title: "Not Found" };
    }

    const content = generateHowToPageContent(guide);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/how-to/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/how-to/${slug}`,
            type: "article",
        },
    };
}

export default async function HowToPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        notFound();
    }

    const content = generateHowToPageContent(guide);
    const relatedPages = getRelatedPages(slug, "howto");

    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: guide.title,
        description: content.metaDescription,
        totalTime: "PT5M",
        tool: {
            "@type": "HowToTool",
            name: "PPTMaster AI",
        },
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "Open PPTMaster",
                text: "Navigate to PPTMaster and sign up for free",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "Enter your topic",
                text: "Describe what your presentation is about",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "Let AI generate slides",
                text: "Our AI will create professional slides automatically",
            },
            {
                "@type": "HowToStep",
                position: 4,
                name: "Customize as needed",
                text: "Edit text, images, and design to your preference",
            },
            {
                "@type": "HowToStep",
                position: 5,
                name: "Export and present",
                text: "Download as PowerPoint or present online",
            },
        ],
    };



    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <LandingNavbar currentLang="en" />

            <SEOPageHero
                title={guide.title}
                subtitle={content.heroSubtitle}
                ctaText={content.heroCta}
                badge="Step-by-Step Guide"
            />

            <SEOHowItWorks
                title="Follow These Simple Steps"
                subtitle={`Learn ${guide.keyword} the easy way`}
            />

            <SEOFeatureGrid
                features={content.features}
                title="What You'll Learn"
                subtitle="Master presentation creation with AI"
            />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="More Guides"
            />

            <SEOCTASection
                title="Ready to Try It Yourself?"
                subtitle="Create your first AI-powered presentation now."
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

export const revalidate = 86400;

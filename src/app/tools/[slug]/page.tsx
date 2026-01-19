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
import { TOOLS, getToolBySlug } from "~/lib/seo/page-data";
import { generateToolPageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Generate all tool pages at build time
export async function generateStaticParams() {
    return TOOLS.map((tool) => ({
        slug: tool.slug,
    }));
}

// Generate metadata for each tool page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const tool = getToolBySlug(slug);

    if (!tool) {
        return { title: "Not Found" };
    }

    const content = generateToolPageContent(tool);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/tools/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/tools/${slug}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: content.title,
            description: content.metaDescription,
        },
    };
}

export default async function ToolPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const tool = getToolBySlug(slug);

    if (!tool) {
        notFound();
    }

    const content = generateToolPageContent(tool);
    const relatedPages = getRelatedPages(slug, "tool");

    // Schema.org structured data
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.title,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: content.metaDescription,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "1342",
        },
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <LandingNavbar currentLang="en" />

            <SEOPageHero
                title={content.h1Title}
                subtitle={content.heroSubtitle}
                ctaText={content.heroCta}
                badge="AI-Powered Tool"
            />

            <SEOFeatureGrid
                features={content.features}
                title={`Why Use Our ${tool.title}?`}
                subtitle="Create professional presentations without any design skills"
            />

            <SEOHowItWorks />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="Explore More AI Tools"
            />

            <SEOCTASection
                title={`Try Our ${tool.title} Free`}
                subtitle="Create your first AI-powered presentation in under a minute."
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

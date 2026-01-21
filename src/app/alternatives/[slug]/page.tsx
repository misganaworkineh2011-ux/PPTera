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
import { ALTERNATIVES } from "~/lib/seo/page-data";
import { generateAlternativePageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Generate all alternative pages at build time
export async function generateStaticParams() {
    return ALTERNATIVES.map((alt) => ({
        slug: alt.slug,
    }));
}

function getAlternativeBySlug(slug: string) {
    return ALTERNATIVES.find(a => a.slug === slug);
}

// Generate metadata for each alternative page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const alt = getAlternativeBySlug(slug);

    if (!alt) {
        return { title: "Not Found" };
    }

    const content = generateAlternativePageContent(alt);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/alternatives/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/alternatives/${slug}`,
            type: "website",
        },
    };
}

export default async function AlternativePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const alt = getAlternativeBySlug(slug);

    if (!alt) {
        notFound();
    }

    const content = generateAlternativePageContent(alt);
    const relatedPages = getRelatedPages(slug, "alternative");

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: content.title,
        description: content.metaDescription,
        about: {
            "@type": "SoftwareApplication",
            name: "PPTMaster",
            applicationCategory: "BusinessApplication",
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
                badge={`Better Than ${alt.name}`}
            />

            <SEOFeatureGrid
                features={content.features}
                title={`Why PPTMaster vs ${alt.name}?`}
                subtitle="See why professionals choose PPTMaster"
            />

            <SEOHowItWorks />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="Compare More Alternatives"
            />

            <SEOCTASection
                title={`Switch from ${alt.name} Today`}
                subtitle="Create better presentations with AI, for free."
                ctaLink="https://www.pptmaster.app/sign-up"
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

export const revalidate = 86400;

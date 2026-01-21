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
import { INDUSTRIES, getIndustryBySlug } from "~/lib/seo/page-data";
import { generateIndustryPageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Generate all industry pages at build time
export async function generateStaticParams() {
    return INDUSTRIES.map((industry) => ({
        slug: industry.slug,
    }));
}

// Generate metadata for each industry page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const industry = getIndustryBySlug(slug);

    if (!industry) {
        return { title: "Not Found" };
    }

    const content = generateIndustryPageContent(industry);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/industries/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/industries/${slug}`,
            type: "website",
        },
    };
}

export default async function IndustryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const industry = getIndustryBySlug(slug);

    if (!industry) {
        notFound();
    }

    const content = generateIndustryPageContent(industry);
    const relatedPages = getRelatedPages(industry.slug, "industry");

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: content.title,
        description: content.metaDescription,
        about: {
            "@type": "Thing",
            name: `${industry.name} Presentations`,
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
                badge={`${industry.icon} ${industry.name} Industry`}
            />

            <SEOFeatureGrid
                features={content.features}
                title={`Perfect for ${industry.name} Professionals`}
                subtitle={`AI-powered presentations designed for the ${industry.name.toLowerCase()} industry`}
            />

            <SEOHowItWorks />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="More Industry Solutions"
            />

            <SEOCTASection
                title={`Create ${industry.name} Presentations Now`}
                subtitle={`Join ${industry.name.toLowerCase()} professionals using AI to create better presentations.`}
                ctaLink="https://www.pptmaster.app/sign-up"
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

export const revalidate = 86400;

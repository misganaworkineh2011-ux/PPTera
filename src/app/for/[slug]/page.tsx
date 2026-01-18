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
import { INDUSTRIES, USE_CASES, getIndustryBySlug, getUseCaseBySlug, getAllComboSlugs } from "~/lib/seo/page-data";
import { generateComboPageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Parse combo slug into industry and use case
function parseComboSlug(slug: string): { industry: string; useCase: string } | null {
    // Try to match industry-usecase pattern
    for (const industry of INDUSTRIES) {
        for (const useCase of USE_CASES) {
            const expected = `${industry.slug}-${useCase.slug}`;
            if (slug === expected) {
                return { industry: industry.slug, useCase: useCase.slug };
            }
        }
    }
    return null;
}

// Generate all combo pages at build time (industry × use case = ~750 pages)
export async function generateStaticParams() {
    const combos = getAllComboSlugs();
    return combos.map((slug) => ({ slug }));
}

// Generate metadata for each combo page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const parsed = parseComboSlug(slug);

    if (!parsed) {
        return { title: "Not Found" };
    }

    const industry = getIndustryBySlug(parsed.industry);
    const useCase = getUseCaseBySlug(parsed.useCase);

    if (!industry || !useCase) {
        return { title: "Not Found" };
    }

    const content = generateComboPageContent(industry, useCase);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/for/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/for/${slug}`,
            type: "website",
        },
    };
}

export default async function ComboPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const parsed = parseComboSlug(slug);

    if (!parsed) {
        notFound();
    }

    const industry = getIndustryBySlug(parsed.industry);
    const useCase = getUseCaseBySlug(parsed.useCase);

    if (!industry || !useCase) {
        notFound();
    }

    const content = generateComboPageContent(industry, useCase);
    const relatedPages = getRelatedPages(slug, "combo");

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: content.title,
        description: content.metaDescription,
        about: [
            { "@type": "Thing", name: industry.name },
            { "@type": "Thing", name: useCase.name },
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
                title={content.h1Title}
                subtitle={content.heroSubtitle}
                ctaText={content.heroCta}
                badge={`${industry.icon} ${industry.name} + ${useCase.name}`}
            />

            <SEOFeatureGrid
                features={content.features}
                title={`Perfect ${useCase.name} for ${industry.name}`}
                subtitle={`AI-powered presentations tailored for ${industry.name.toLowerCase()} professionals`}
            />

            <SEOHowItWorks />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="More Presentation Solutions"
            />

            <SEOCTASection
                title={`Create Your ${industry.name} ${useCase.name}`}
                subtitle="Professional AI-generated slides in under a minute."
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

export const revalidate = 86400;

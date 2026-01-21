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
import { USE_CASES, getUseCaseBySlug } from "~/lib/seo/page-data";
import { generateUseCasePageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Generate all use case pages at build time
export async function generateStaticParams() {
    return USE_CASES.map((useCase) => ({
        usecase: useCase.slug,
    }));
}

// Generate metadata for each use case page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ usecase: string }>;
}): Promise<Metadata> {
    const { usecase: slug } = await params;
    const useCase = getUseCaseBySlug(slug);

    if (!useCase) {
        return { title: "Not Found" };
    }

    const content = generateUseCasePageContent(useCase);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/create/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/create/${slug}`,
            type: "website",
        },
    };
}

export default async function UseCasePage({
    params,
}: {
    params: Promise<{ usecase: string }>;
}) {
    const { usecase: slug } = await params;
    const useCase = getUseCaseBySlug(slug);

    if (!useCase) {
        notFound();
    }

    const content = generateUseCasePageContent(useCase);
    const relatedPages = getRelatedPages(slug, "usecase");

    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to Create a ${useCase.name}`,
        description: content.metaDescription,
        step: [
            {
                "@type": "HowToStep",
                name: "Enter your topic",
                text: "Describe your presentation topic or paste content",
            },
            {
                "@type": "HowToStep",
                name: "AI generates slides",
                text: "Our AI creates professional slides automatically",
            },
            {
                "@type": "HowToStep",
                name: "Customize and export",
                text: "Edit as needed and download as PowerPoint",
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
                title={content.h1Title}
                subtitle={content.heroSubtitle}
                ctaText={content.heroCta}
                badge="Use Case Template"
            />

            <SEOFeatureGrid
                features={content.features}
                title={`Create Perfect ${useCase.name} Presentations`}
                subtitle={useCase.description}
            />

            <SEOHowItWorks />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="More Presentation Types"
            />

            <SEOCTASection
                title={`Create Your ${useCase.name} Now`}
                subtitle="Professional results in under a minute with AI."
                ctaLink="https://www.pptmaster.app/sign-up"
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

export const revalidate = 86400;

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
import { TEMPLATE_TOPICS } from "~/lib/seo/page-data";
import { generateTemplatePageContent, getRelatedPages } from "~/lib/seo/content-generator";

// Generate all template pages at build time
export async function generateStaticParams() {
    return TEMPLATE_TOPICS.map((template) => ({
        topic: template.slug,
    }));
}

function getTemplateBySlug(slug: string) {
    return TEMPLATE_TOPICS.find(t => t.slug === slug);
}

// Generate metadata for each template page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ topic: string }>;
}): Promise<Metadata> {
    const { topic: slug } = await params;
    const template = getTemplateBySlug(slug);

    if (!template) {
        return { title: "Not Found" };
    }

    const content = generateTemplatePageContent(template);

    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.keywords,
        alternates: {
            canonical: `/templates/${slug}`,
        },
        openGraph: {
            title: content.title,
            description: content.metaDescription,
            url: `/templates/${slug}`,
            type: "website",
        },
    };
}

export default async function TemplatePage({
    params,
}: {
    params: Promise<{ topic: string }>;
}) {
    const { topic: slug } = await params;
    const template = getTemplateBySlug(slug);

    if (!template) {
        notFound();
    }

    const content = generateTemplatePageContent(template);
    const relatedPages = getRelatedPages(slug, "template");

    const schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: `${template.name} Template`,
        description: content.metaDescription,
        creator: {
            "@type": "Organization",
            name: "PPTMaster",
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
                badge="Free Template"
            />

            <SEOFeatureGrid
                features={content.features}
                title={`${template.name} Template Features`}
                subtitle="Professional design ready to customize"
            />

            <SEOHowItWorks />

            <SEOFAQSection faqs={content.faqs} />

            <SEORelatedPages
                pages={relatedPages}
                title="More Templates"
            />

            <SEOCTASection
                title={`Use the ${template.name} Template`}
                subtitle="Start creating your presentation in seconds."
            />

            <LandingFooter currentLang="en" />
        </div>
    );
}

export const revalidate = 86400;

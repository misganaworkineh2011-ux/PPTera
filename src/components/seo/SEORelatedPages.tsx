import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedPage {
    slug: string;
    title: string;
    description?: string;
}

interface SEORelatedPagesProps {
    pages: RelatedPage[];
    title?: string;
}

export function SEORelatedPages({
    pages,
    title = "Explore More"
}: SEORelatedPagesProps) {
    if (pages.length === 0) return null;

    return (
        <section className="py-16 px-6 bg-white border-t border-slate-100">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">{title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page, index) => (
                        <Link
                            key={index}
                            href={page.slug}
                            className="group flex items-center justify-between p-5 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all duration-200"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                    {page.title}
                                </h3>
                                {page.description && (
                                    <p className="text-sm text-slate-500 mt-1">{page.description}</p>
                                )}
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

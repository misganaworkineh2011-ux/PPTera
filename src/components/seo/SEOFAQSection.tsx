"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
    question: string;
    answer: string;
}

interface SEOFAQSectionProps {
    faqs: FAQ[];
    title?: string;
}

export function SEOFAQSection({
    faqs,
    title = "Frequently Asked Questions"
}: SEOFAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    // Generate FAQ structured data
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section className="py-20 px-6 bg-slate-50">
            {/* FAQ Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="max-w-3xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        {title}
                    </h2>
                </div>

                {/* FAQ accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-slate-900 pr-4">
                                    {faq.question}
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <p className="px-6 pb-6 text-slate-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

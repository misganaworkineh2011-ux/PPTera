interface Feature {
    title: string;
    description: string;
    icon: string;
}

interface SEOFeatureGridProps {
    features: Feature[];
    title?: string;
    subtitle?: string;
}

export function SEOFeatureGrid({
    features,
    title = "Why Choose PPTera?",
    subtitle = "Everything you need to create stunning presentations"
}: SEOFeatureGridProps) {
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        {title}
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                        >
                            {/* Icon */}
                            <div className="text-4xl mb-4">{feature.icon}</div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

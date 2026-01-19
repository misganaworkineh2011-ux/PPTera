import { CheckCircle2, Zap, Palette, Download } from "lucide-react";

interface Step {
    number: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface SEOHowItWorksProps {
    title?: string;
    subtitle?: string;
    steps?: Step[];
}

const defaultSteps: Step[] = [
    {
        number: 1,
        title: "Describe Your Topic",
        description: "Enter your presentation topic or paste your content. Our AI understands what you need.",
        icon: <Zap className="w-6 h-6" />,
    },
    {
        number: 2,
        title: "AI Generates Slides",
        description: "Watch as AI creates professional slides with perfect structure, design, and content.",
        icon: <Palette className="w-6 h-6" />,
    },
    {
        number: 3,
        title: "Customize & Edit",
        description: "Fine-tune your presentation. Change colors, images, text - everything is editable.",
        icon: <CheckCircle2 className="w-6 h-6" />,
    },
    {
        number: 4,
        title: "Export & Present",
        description: "Download as PowerPoint, PDF, or present directly online. Ready in seconds.",
        icon: <Download className="w-6 h-6" />,
    },
];

export function SEOHowItWorks({
    title = "How It Works",
    subtitle = "Create professional presentations in 4 simple steps",
    steps = defaultSteps,
}: SEOHowItWorksProps) {
    return (
        <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
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

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector line (hidden on last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-300 to-blue-300 -translate-x-1/2" />
                            )}

                            <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                                {/* Step number */}
                                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="mt-4 mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center text-cyan-600">
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

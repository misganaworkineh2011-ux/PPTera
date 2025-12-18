import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

// Built-in template configurations
const BUILT_IN_TEMPLATES = [
  {
    id: "business-pitch",
    name: "Business Pitch",
    category: "business",
    description: "Professional pitch deck template for investors and stakeholders",
    slideCount: 12,
    slides: [
      { type: "title", title: "Company Name", subtitle: "Investor Pitch Deck" },
      { type: "content", title: "The Problem", content: "Describe the problem you're solving" },
      { type: "content", title: "Our Solution", content: "How your product/service solves it" },
      { type: "content", title: "Market Opportunity", content: "TAM, SAM, SOM analysis" },
      { type: "content", title: "Business Model", content: "How you make money" },
      { type: "content", title: "Traction", content: "Key metrics and milestones" },
      { type: "content", title: "Competition", content: "Competitive landscape" },
      { type: "content", title: "Go-to-Market Strategy", content: "How you'll acquire customers" },
      { type: "content", title: "Team", content: "Key team members and advisors" },
      { type: "content", title: "Financials", content: "Revenue projections and key metrics" },
      { type: "content", title: "The Ask", content: "Funding amount and use of funds" },
      { type: "content", title: "Thank You", content: "Contact information" },
    ],
    previewUrl: "/themes/business-pitch-preview.png",
    isPublic: true,
  },
  {
    id: "marketing-plan",
    name: "Marketing Plan",
    category: "marketing",
    description: "Comprehensive marketing strategy and campaign planning template",
    slideCount: 15,
    slides: [
      { type: "title", title: "Marketing Plan", subtitle: "Q1 2025 Strategy" },
      { type: "content", title: "Executive Summary", content: "Overview of marketing goals" },
      { type: "content", title: "Market Analysis", content: "Industry trends and insights" },
      { type: "content", title: "Target Audience", content: "Customer personas and segments" },
      { type: "content", title: "Competitive Analysis", content: "Key competitors and positioning" },
      { type: "content", title: "Marketing Objectives", content: "SMART goals for the quarter" },
      { type: "content", title: "Brand Strategy", content: "Messaging and positioning" },
      { type: "content", title: "Content Strategy", content: "Content pillars and calendar" },
      { type: "content", title: "Digital Marketing", content: "SEO, SEM, Social Media" },
      { type: "content", title: "Email Marketing", content: "Campaigns and automation" },
      { type: "content", title: "Events & PR", content: "Planned events and media outreach" },
      { type: "content", title: "Budget Allocation", content: "Marketing spend breakdown" },
      { type: "content", title: "Timeline", content: "Key milestones and deadlines" },
      { type: "content", title: "KPIs & Metrics", content: "How we'll measure success" },
      { type: "content", title: "Next Steps", content: "Action items and owners" },
    ],
    previewUrl: "/themes/marketing-plan-preview.png",
    isPublic: true,
  },
  {
    id: "product-launch",
    name: "Product Launch",
    category: "product",
    description: "Launch your product with impact using this structured template",
    slideCount: 10,
    slides: [
      { type: "title", title: "Product Name", subtitle: "Launch Presentation" },
      { type: "content", title: "The Vision", content: "Why we built this product" },
      { type: "content", title: "Key Features", content: "Top 3-5 features" },
      { type: "content", title: "How It Works", content: "Product demo overview" },
      { type: "content", title: "Target Users", content: "Who this is for" },
      { type: "content", title: "Pricing", content: "Pricing tiers and value" },
      { type: "content", title: "Launch Timeline", content: "Key dates and milestones" },
      { type: "content", title: "Marketing Plan", content: "Go-to-market strategy" },
      { type: "content", title: "Success Metrics", content: "How we'll measure success" },
      { type: "content", title: "Get Started", content: "Call to action" },
    ],
    previewUrl: "/themes/product-launch-preview.png",
    isPublic: true,
  },
  {
    id: "sales-report",
    name: "Sales Report",
    category: "sales",
    description: "Present your sales data and insights professionally",
    slideCount: 8,
    slides: [
      { type: "title", title: "Sales Report", subtitle: "Monthly Performance Review" },
      { type: "content", title: "Executive Summary", content: "Key highlights" },
      { type: "content", title: "Revenue Overview", content: "Total revenue and growth" },
      { type: "content", title: "Sales by Region", content: "Geographic breakdown" },
      { type: "content", title: "Top Products", content: "Best performing products" },
      { type: "content", title: "Pipeline Analysis", content: "Deals in progress" },
      { type: "content", title: "Challenges & Opportunities", content: "What we learned" },
      { type: "content", title: "Next Month Goals", content: "Targets and action items" },
    ],
    previewUrl: "/themes/sales-report-preview.png",
    isPublic: true,
  },
  {
    id: "team-meeting",
    name: "Team Meeting",
    category: "internal",
    description: "Keep your team aligned with this meeting agenda template",
    slideCount: 6,
    slides: [
      { type: "title", title: "Team Meeting", subtitle: "Weekly Sync" },
      { type: "content", title: "Agenda", content: "Topics to cover today" },
      { type: "content", title: "Last Week Recap", content: "What we accomplished" },
      { type: "content", title: "This Week Priorities", content: "Focus areas" },
      { type: "content", title: "Blockers & Support", content: "Where we need help" },
      { type: "content", title: "Action Items", content: "Next steps and owners" },
    ],
    previewUrl: "/themes/team-meeting-preview.png",
    isPublic: true,
  },
  {
    id: "quarterly-review",
    name: "Quarterly Review",
    category: "business",
    description: "Review performance and set goals for the next quarter",
    slideCount: 14,
    slides: [
      { type: "title", title: "Q4 Review", subtitle: "Performance & Planning" },
      { type: "content", title: "Quarter Highlights", content: "Key achievements" },
      { type: "content", title: "Goals vs Results", content: "How we performed" },
      { type: "content", title: "Revenue Performance", content: "Financial metrics" },
      { type: "content", title: "Customer Metrics", content: "Growth and retention" },
      { type: "content", title: "Product Updates", content: "What we shipped" },
      { type: "content", title: "Team Growth", content: "Hiring and development" },
      { type: "content", title: "Challenges Faced", content: "What we learned" },
      { type: "content", title: "Market Insights", content: "Industry trends" },
      { type: "content", title: "Next Quarter Goals", content: "OKRs and targets" },
      { type: "content", title: "Strategic Initiatives", content: "Key projects" },
      { type: "content", title: "Resource Needs", content: "Budget and headcount" },
      { type: "content", title: "Timeline", content: "Key milestones" },
      { type: "content", title: "Q&A", content: "Discussion" },
    ],
    previewUrl: "/themes/quarterly-review-preview.png",
    isPublic: true,
  },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const includeCustom = url.searchParams.get("includeCustom") === "true";

    let templates = [...BUILT_IN_TEMPLATES];

    // Filter by category if specified
    if (category && category !== "all") {
      templates = templates.filter((t) => t.category === category);
    }

    // Include user's custom templates if authenticated and requested
    if (includeCustom) {
      const { userId } = await auth();
      if (userId) {
        const user = await db.user.findUnique({
          where: { clerkId: userId },
          select: { id: true },
        });

        if (user) {
          const customTemplates = await db.template.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
          });

          templates = [
            ...customTemplates.map((t) => ({
              id: t.id,
              name: t.name,
              category: t.category,
              description: "Custom template",
              slideCount: (t.config as any)?.slides?.length || 0,
              slides: (t.config as any)?.slides || [],
              previewUrl: t.previewUrl,
              isPublic: t.isPublic,
              isCustom: true,
            })),
            ...templates,
          ];
        }
      }
    }

    return NextResponse.json({
      templates,
      categories: ["all", "business", "marketing", "product", "sales", "internal"],
    });
  } catch (error) {
    console.error("[Templates API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

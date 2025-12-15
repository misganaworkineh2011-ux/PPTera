import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Insights - PPT Master PowerPoint Tips & AI",
  description: "Discover insights on PowerPoint design, AI technology, and productivity from PPT Master. Learn to create better presentations with the best AI PowerPoint generator.",
  keywords: ["insights", "blog", "presentation tips", "AI trends", "design tips", "productivity", "best practices", "PPT Master", "PowerPoint tips", "AI PowerPoint", "best PowerPoint generator"],
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    title: "PPT Master Insights - PowerPoint Tips & AI Trends",
    description: "Discover the latest insights on PowerPoint design and AI technology from PPT Master.",
    url: "/insights",
  },
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}

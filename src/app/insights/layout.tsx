import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Insights - Presentation Tips & AI",
  description: "Discover insights on presentation design, AI technology, and productivity. Learn to create better presentations with expert tips.",
  keywords: ["insights", "blog", "presentation tips", "AI trends", "design tips", "productivity", "best practices"],
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    title: "PPTMaster Insights - Presentation Tips & AI Trends",
    description: "Discover the latest insights on presentation design and AI technology.",
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

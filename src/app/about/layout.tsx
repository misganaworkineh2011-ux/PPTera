import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us - PPT Master AI Presentation Innovation",
  description: "Learn about PPT Master's mission to revolutionize PowerPoint and presentation creation with AI. Discover our story as the best AI PowerPoint generator.",
  keywords: ["about pptmaster", "PPT Master", "company", "mission", "AI presentation technology", "PowerPoint generator", "AI PowerPoint", "best PowerPoint generator", "our story", "team"],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PPT Master - AI PowerPoint Generator",
    description: "Learn about our mission to revolutionize PowerPoint and presentation creation with AI.",
    url: "/about",
  },
};

export default function AboutLayout({
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

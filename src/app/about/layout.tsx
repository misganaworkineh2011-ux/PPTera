import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us - AI Presentation Innovation",
  description: "Learn about PPTMaster's mission to revolutionize presentation creation with AI. Discover our story, values, and commitment to excellence.",
  keywords: ["about pptmaster", "company", "mission", "AI presentation technology", "our story", "team"],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PPTMaster - AI Presentation Innovation",
    description: "Learn about our mission to revolutionize presentation creation with AI.",
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

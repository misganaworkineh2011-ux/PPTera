import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us - PPTera AI Presentation Innovation",
  description: "Learn about PPTera's mission to revolutionize PowerPoint and presentation creation with AI. Discover our story as the best AI PowerPoint generator.",
  keywords: ["about pptera", "PPTera", "company", "mission", "AI presentation technology", "PowerPoint generator", "AI PowerPoint", "best PowerPoint generator", "our story", "team"],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PPTera - AI PowerPoint Generator",
    description: "Learn about our mission to revolutionize PowerPoint and presentation creation with AI.",
    url: "/about",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "About PPTera - AI PowerPoint Generator",
      },
    ],
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

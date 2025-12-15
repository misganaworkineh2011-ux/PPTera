import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Careers - Join PPT Master Team",
  description: "Join PPT Master and shape the future of AI PowerPoint generation. Explore open positions at the best AI presentation company.",
  keywords: ["careers", "jobs", "hiring", "work at pptmaster", "PPT Master", "job openings", "join our team", "AI PowerPoint jobs"],
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers at PPT Master - Join Our Team",
    description: "Join PPT Master and help shape the future of AI-powered PowerPoint generation.",
    url: "/careers",
  },
};

export default function CareersLayout({
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

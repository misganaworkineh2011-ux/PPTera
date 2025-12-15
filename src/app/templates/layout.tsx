import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Templates - Professional Presentations",
  description: "Browse professional presentation templates for business, marketing, education, and more. Start with a template and let AI customize it.",
  keywords: ["templates", "presentation templates", "slide templates", "business templates", "professional designs", "ppt templates"],
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title: "PPTMaster Templates - Professional Presentation Designs",
    description: "Browse professional presentation templates powered by AI.",
    url: "/templates",
  },
};

export default function TemplatesLayout({
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

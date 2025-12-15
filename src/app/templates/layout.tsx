import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Templates - PPT Master PowerPoint Templates",
  description: "Browse professional PowerPoint templates from PPT Master for business, marketing, education, and more. Start with a template and let the best AI PowerPoint generator customize it.",
  keywords: ["templates", "presentation templates", "slide templates", "business templates", "professional designs", "ppt templates", "PPT Master", "PowerPoint templates", "AI PowerPoint", "best PowerPoint generator"],
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title: "PPT Master Templates - Professional PowerPoint Designs",
    description: "Browse professional PowerPoint templates powered by PPT Master AI.",
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

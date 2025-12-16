import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Developer Docs - PPT Master API",
  description: "Integrate PPT Master's AI PowerPoint generator into your applications. Explore our API documentation for the best PowerPoint generation API.",
  keywords: ["API", "developer docs", "documentation", "integration", "API reference", "developer resources", "PPT Master", "PowerPoint API", "AI PowerPoint generator API", "best PowerPoint generator"],
  alternates: {
    canonical: "/developer-docs",
  },
  openGraph: {
    title: "PPT Master Developer Documentation - PowerPoint API",
    description: "Integrate AI PowerPoint generation into your applications with PPT Master API.",
    url: "/developer-docs",
  },
};

export default function DeveloperDocsLayout({
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

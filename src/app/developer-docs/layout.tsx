import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Developer Docs - PPTMaster API",
  description: "Integrate PPTMaster's AI into your applications. Explore our API documentation, code examples, and developer resources.",
  keywords: ["API", "developer docs", "documentation", "integration", "API reference", "developer resources"],
  alternates: {
    canonical: "/developer-docs",
  },
  openGraph: {
    title: "PPTMaster Developer Documentation - API Reference",
    description: "Integrate AI presentation generation into your applications.",
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

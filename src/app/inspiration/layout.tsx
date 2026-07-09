import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Inspiration - PPTera PowerPoint Examples",
  description: "Get inspired by stunning AI-generated PowerPoint examples from PPTera. Browse our gallery of presentations created with the best AI PowerPoint generator.",
  keywords: ["inspiration", "examples", "gallery", "presentation ideas", "design inspiration", "slide examples", "PPTera", "PowerPoint examples", "AI PowerPoint", "best PowerPoint generator"],
  alternates: {
    canonical: "/inspiration",
  },
  openGraph: {
    title: "PPTera Inspiration - Stunning PowerPoint Examples",
    description: "Get inspired by stunning PowerPoint examples created with PPTera AI.",
    url: "/inspiration",
  },
};

export default function InspirationLayout({
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

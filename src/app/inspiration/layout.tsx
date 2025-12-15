import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Inspiration - Stunning Presentation Examples",
  description: "Get inspired by stunning AI-generated presentation examples. Browse our gallery and discover creative ideas for your next slides.",
  keywords: ["inspiration", "examples", "gallery", "presentation ideas", "design inspiration", "slide examples"],
  alternates: {
    canonical: "/inspiration",
  },
  openGraph: {
    title: "PPTMaster Inspiration - Stunning Presentation Examples",
    description: "Get inspired by stunning presentation examples created with AI.",
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

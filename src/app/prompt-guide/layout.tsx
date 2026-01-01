import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Prompt Guide - PPT Master AI PowerPoint Generation",
  description: "Learn to write effective prompts for PPT Master AI PowerPoint generation. Master the best AI PowerPoint generator to create the presentations you envision.",
  keywords: ["prompt guide", "AI prompts", "how to use AI", "prompt engineering", "AI tips", "effective prompts", "PPT Master", "PowerPoint prompts", "AI PowerPoint", "best PowerPoint generator"],
  alternates: {
    canonical: "/prompt-guide",
  },
  openGraph: {
    title: "PPT Master Prompt Guide - Master AI PowerPoint Generation",
    description: "Learn how to write effective prompts for PPT Master AI PowerPoint generation.",
    url: "/prompt-guide",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPT Master Prompt Guide",
      },
    ],
  },
};

export default function PromptGuideLayout({
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

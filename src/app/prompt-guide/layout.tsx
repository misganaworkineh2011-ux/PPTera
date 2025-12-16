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

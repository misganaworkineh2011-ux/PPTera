import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Prompt Guide - Master AI Generation",
  description: "Learn to write effective prompts for AI presentation generation. Master communicating with AI to create the presentations you envision.",
  keywords: ["prompt guide", "AI prompts", "how to use AI", "prompt engineering", "AI tips", "effective prompts"],
  alternates: {
    canonical: "/prompt-guide",
  },
  openGraph: {
    title: "PPTMaster Prompt Guide - Master AI Generation",
    description: "Learn how to write effective prompts for AI presentation generation.",
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

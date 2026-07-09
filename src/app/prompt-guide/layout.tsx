import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Prompt Guide",
  description: "Learn to write effective prompts for PPTera (PPTera) AI PowerPoint generation. Master the best AI PowerPoint generator to create the presentations you envision.",
  keywords: ["prompt guide", "AI prompts", "how to use AI", "prompt engineering", "AI tips", "effective prompts", "PPTera", "PPTera", "PowerPoint prompts", "AI PowerPoint", "best PowerPoint generator"],
  alternates: {
    canonical: "/prompt-guide",
  },
  openGraph: {
    title: "Prompt Guide – PPTera",
    description: "Learn how to write effective prompts for PPTera AI PowerPoint generation.",
    url: "/prompt-guide",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTera Prompt Guide",
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

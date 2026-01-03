import { type Metadata } from "next";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Prompt Guide",
  description: "Learn to write effective prompts for PPTMaster (PPT Master) AI PowerPoint generation. Master the best AI PowerPoint generator to create the presentations you envision.",
  keywords: ["prompt guide", "AI prompts", "how to use AI", "prompt engineering", "AI tips", "effective prompts", "PPTMaster", "PPT Master", "PowerPoint prompts", "AI PowerPoint", "best PowerPoint generator"],
  alternates: {
    canonical: "/prompt-guide",
  },
  openGraph: {
    title: "Prompt Guide – PPTMaster",
    description: "Learn how to write effective prompts for PPTMaster AI PowerPoint generation.",
    url: "/prompt-guide",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Prompt Guide",
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

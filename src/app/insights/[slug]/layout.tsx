import type { Metadata } from "next";
import { db } from "~/server/db";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await db.insightPost.findUnique({
      where: { slug: params.slug },
    });

    if (!post) {
      return {
        title: "Post Not Found | PPTMaster Insights",
        description: "The article you're looking for could not be found.",
      };
    }

    const title = `${post.title} | PPT Master Insights`;
    const description = post.excerpt;
    const imageUrl = post.coverImage || "https://www.pptmaster.app/og-image.jpeg";
    const url = `https://www.pptmaster.app/insights/${params.slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "PPT Master",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: [post.author],
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
        creator: "@pptmaster",
        site: "@pptmaster",
      },
      keywords: [
        ...post.tags,
        post.category,
        "presentation tips",
        "PPT Master",
        "PowerPoint tips",
        "AI PowerPoint",
        "best PowerPoint generator",
        "AI presentations",
      ],
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Insights | PPT Master",
      description: "Learn from experts about creating better PowerPoint presentations.",
    };
  }
}

export default function InsightPostLayout({
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

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
        title: post.title,
        description,
        url,
        siteName: "PPT Master - AI PowerPoint Generator",
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
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [imageUrl],
        creator: "@pptmaster",
        site: "@pptmaster",
      },
      keywords: [
        ...post.tags,
        post.category,
        "ppt master",
        "ai powerpoint generator",
        "presentation design",
        "powerpoint tips",
        "ai presentations",
        "presentation maker",
        "slide design",
        "powerpoint templates",
        "presentation software",
        "ai presentation tool",
      ],
      alternates: {
        canonical: url,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      authors: [{ name: post.author }],
      category: post.category,
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

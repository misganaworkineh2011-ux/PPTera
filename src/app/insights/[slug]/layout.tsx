import type { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await db.insightPost.findUnique({
      where: { slug: params.slug, isPublished: true },
      select: {
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        author: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    if (!post) {
      return {
        title: "Article Not Found",
        description: "The requested article could not be found.",
      };
    }

    const title = `${post.title} | PPTera Insights`;
    const description = post.excerpt;
    const url = `https://www.pptmaster.app/insights/${params.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        images: [
          {
            url: post.coverImage || "/og-image.jpeg",
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime: post.publishedAt?.toISOString() || post.updatedAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: [post.author],
        tags: [post.category, ...post.tags],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [post.coverImage || "/og-image.jpeg"],
      },
      keywords: [post.category, ...post.tags, "presentation design", "PPTera", "insights", "tips"].join(", "),
      authors: [{ name: post.author }],
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Insights | PPTera",
      description: "Presentation design insights and tips from PPTera",
    };
  }
}

export default function InsightPostLayout({ children }: Props) {
  return <>{children}</>;
}

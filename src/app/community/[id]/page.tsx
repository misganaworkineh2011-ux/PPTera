import { notFound } from "next/navigation";
import { db } from "~/server/db";
import type { Metadata } from "next";
import CommunityPostClient from "./CommunityPostClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate static params for all approved posts
export async function generateStaticParams() {
  const posts = await db.communityPost.findMany({
    where: { isApproved: true },
    select: { id: true },
  });

  return posts.map((post) => ({ id: post.id }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const post = await db.communityPost.findUnique({
    where: { id, isApproved: true },
    select: {
      title: true,
      content: true,
      category: true,
      authorName: true,
    },
  });

  if (!post) {
    return {
      title: "Post Not Found | PPTMaster Community",
    };
  }

  const description =
    post.content.length > 160
      ? post.content.substring(0, 157) + "..."
      : post.content;

  const categoryLabels: Record<string, string> = {
    "show-tell": "Show & Tell",
    discussion: "Discussion",
    tips: "Tips & Tricks",
    "feature-request": "Feature Request",
  };

  return {
    title: `${post.title} | PPTMaster Community`,
    description,
    alternates: {
      canonical: `https://www.pptmaster.app/community/${id}`,
    },
    keywords: `PPTMaster community, ${categoryLabels[post.category] || post.category}, presentation tips, ${post.authorName}`,
    openGraph: {
      title: post.title,
      description,
      url: `https://www.pptmaster.app/community/${id}`,
      type: "article",
      authors: [post.authorName],
      images: [
        {
          url: "https://www.pptmaster.app/og-image.jpeg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ["https://www.pptmaster.app/og-image.jpeg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function CommunityPostPage({ params }: Props) {
  const { id } = await params;

  const post = await db.communityPost.findUnique({
    where: { id, isApproved: true },
    include: {
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Increment view count
  await db.communityPost.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return <CommunityPostClient post={post} />;
}

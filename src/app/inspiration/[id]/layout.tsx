import type { Metadata } from "next";
import { db } from "~/server/db";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const item = await db.inspirationGallery.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return {
        title: "Inspiration Not Found | PPTMaster",
        description: "The inspiration item you're looking for could not be found.",
      };
    }

    const title = `${item.title} | PPTMaster Inspiration`;
    const description = item.description || `Explore this ${item.category} presentation design for inspiration. ${item.views} views, ${item.likes} likes.`;
    const imageUrl = item.imageUrl || "https://www.pptmaster.app/og-image.png";
    const url = `https://www.pptmaster.app/inspiration/${params.id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "PPTMaster",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
        type: "article",
        publishedTime: item.createdAt.toISOString(),
        modifiedTime: item.updatedAt.toISOString(),
        authors: item.authorName ? [item.authorName] : undefined,
        tags: item.tags,
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
        "presentation design",
        "inspiration",
        item.category,
        ...item.tags,
        "PPTMaster",
        "AI presentations",
      ],
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Inspiration | PPTMaster",
      description: "Explore amazing presentation designs for inspiration.",
    };
  }
}

export default function InspirationItemLayout({
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

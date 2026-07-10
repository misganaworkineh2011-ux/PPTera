import type { Metadata } from "next";
import { db } from "~/server/db";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const item = await db.inspirationGallery.findUnique({
      where: { id: params.id, isPublic: true },
      select: {
        title: true,
        description: true,
        imageUrl: true,
        category: true,
        tags: true,
        updatedAt: true,
      },
    });

    if (!item) {
      return {
        title: "Inspiration Not Found",
        description: "The requested inspiration item could not be found.",
      };
    }

    const title = `${item.title} | PPTera Inspiration`;
    const description = item.description || `${item.category} presentation design inspiration from PPTera`;
    const url = `https://www.pptera.com/inspiration/${params.id}`;

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
            url: item.imageUrl || "/og-image.jpeg",
            width: 1200,
            height: 630,
            alt: item.title,
          },
        ],
        publishedTime: item.updatedAt.toISOString(),
        tags: [item.category, ...item.tags],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [item.imageUrl || "/og-image.jpeg"],
      },
      keywords: [item.category, ...item.tags, "presentation design", "PPTera", "inspiration"].join(", "),
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Inspiration | PPTera",
      description: "Presentation design inspiration from PPTera",
    };
  }
}

export default function InspirationItemLayout({ children }: Props) {
  return <>{children}</>;
}

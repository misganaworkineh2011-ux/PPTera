import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { z } from "zod";

const reviewSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(200),
  content: z.string().min(20).max(2000),
});

// GET - Fetch public reviews or user's own review
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");
    const myReview = searchParams.get("my") === "true";

    // If requesting user's own review
    if (myReview) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ review: null });
      }

      // Get user's email from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { email: true },
      });

      if (!user) {
        return NextResponse.json({ review: null });
      }

      // Find review by user's email
      const review = await db.review.findFirst({
        where: { email: user.email },
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
          title: true,
          content: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ review });
    }

    // Public reviews
    const reviews = await db.review.findMany({
      where: {
        isPublic: true,
        ...(featured && { isFeatured: true }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        isFeatured: true,
      },
    });

    // Calculate average rating
    const stats = await db.review.aggregate({
      where: { isPublic: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0,
      },
    });
  } catch (error) {
    console.error("[Reviews GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Submit or update a review (one per user)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const validated = reviewSchema.parse(body);

    // Check if user already has a review (by email)
    const existingReview = await db.review.findFirst({
      where: { email: validated.email },
    });

    if (existingReview) {
      // Update existing review
      const review = await db.review.update({
        where: { id: existingReview.id },
        data: {
          name: validated.name,
          rating: validated.rating,
          title: validated.title,
          content: validated.content,
          isPublic: false, // Reset to pending approval after edit
        },
      });

      return NextResponse.json({
        success: true,
        message: "Your review has been updated! It will be visible after approval.",
        review: {
          id: review.id,
          rating: review.rating,
          title: review.title,
        },
        isUpdate: true,
      });
    }

    // Create new review
    const review = await db.review.create({
      data: {
        userId: userId || null,
        name: validated.name,
        email: validated.email,
        rating: validated.rating,
        title: validated.title,
        content: validated.content,
        isPublic: false, // Requires admin approval
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your review! It will be visible after approval.",
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
      },
      isUpdate: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid review data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[Reviews POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

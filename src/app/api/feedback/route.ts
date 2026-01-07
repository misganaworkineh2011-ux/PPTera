import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { presentationId, rating, type } = body;

    if (!presentationId || !rating || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log feedback for now - will be stored in database after migration
    console.log("Feedback received:", {
      presentationId,
      rating,
      type,
      userId: userId || "anonymous",
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database after running: npx prisma db push
    // const feedback = await db.feedback.create({
    //   data: {
    //     presentationId,
    //     rating,
    //     type,
    //     userId: userId || null,
    //   },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

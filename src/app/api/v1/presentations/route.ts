import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { validateApiKey } from "~/lib/api-auth";

export async function GET(req: Request) {
  const apiKey = req.headers.get("X-API-Key");
  
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
  }

  const user = await validateApiKey(apiKey);
  
  if (!user) {
    return NextResponse.json({ error: "Invalid API Key or membership too low." }, { status: 403 });
  }

  try {
    const presentations = await db.presentation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(presentations);
  } catch (error) {
    console.error("API Fetch presentations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

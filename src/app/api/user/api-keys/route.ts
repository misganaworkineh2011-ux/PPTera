import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { nanoid } from "nanoid";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { subscriptionPlan: true, id: true },
  });

  if (!user || user.subscriptionPlan !== "ultra") {
    return new NextResponse("Ultra plan required", { status: 403 });
  }

  const apiKeys = await db.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      key: true,
      name: true,
      createdAt: true,
      lastUsed: true,
    },
  });

  // Partially mask the keys for security
  const maskedKeys = apiKeys.map((key) => ({
    ...key,
    key: `pptm_${key.key.slice(0, 4)}...${key.key.slice(-4)}`,
  }));

  return NextResponse.json(maskedKeys);
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { subscriptionPlan: true, id: true },
  });

  if (!user || user.subscriptionPlan !== "ultra") {
    return new NextResponse("Ultra plan required", { status: 403 });
  }

  const body = await req.json();
  const name = body.name || "Default API Key";
  
  // Create a secure random key
  // We'll generate a long alphanumeric key
  const key = `pptm_${nanoid(32)}`;

  const apiKey = await db.apiKey.create({
    data: {
      key,
      name,
      userId: user.id,
    },
  });

  // Return the full key ONLY on creation
  return NextResponse.json(apiKey);
}

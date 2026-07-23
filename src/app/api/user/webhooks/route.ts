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

  const webhooks = await db.webhookConfig.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(webhooks);
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
  const { url, events } = body;

  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    return new NextResponse("Url and events are required", { status: 400 });
  }

  // Create a secret for signing the webhook payload
  const secret = `wh_sec_${nanoid(24)}`;

  const webhook = await db.webhookConfig.create({
    data: {
      url,
      events,
      secret,
      userId: user.id,
    },
  });

  return NextResponse.json(webhook);
}

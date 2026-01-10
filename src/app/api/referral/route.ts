import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { nanoid } from "nanoid";

const REFERRAL_CREDITS = 10;

// GET - Get user's referral info
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        referralCode: true,
        referredBy: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate referral code if user doesn't have one
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = nanoid(8).toUpperCase();
      await db.user.update({
        where: { id: user.id },
        data: { referralCode },
      });
    }

    // Get referral stats (purchase tracking stored in DB for admin use only)
    const referrals = await db.referral.findMany({
      where: { referrerId: user.id },
      select: {
        id: true,
        status: true,
        creditsAwarded: true,
        createdAt: true,
        completedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter((r) => r.status === "completed").length,
      pendingReferrals: referrals.filter((r) => r.status === "pending").length,
      totalCreditsEarned: referrals.reduce((sum, r) => sum + r.creditsAwarded, 0),
    };

    return NextResponse.json({
      referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}/?ref=${referralCode}`,
      stats,
      referrals,
      creditsPerReferral: REFERRAL_CREDITS,
    });
  } catch (error) {
    console.error("Error fetching referral info:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral info" },
      { status: 500 }
    );
  }
}

// POST - Complete a referral (called when a referred user signs up)
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralCode } = await request.json();
    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code required" },
        { status: 400 }
      );
    }

    // Get the new user
    const newUser = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true, referredBy: true },
    });

    if (!newUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already used a referral
    if (newUser.referredBy) {
      return NextResponse.json(
        { error: "Already used a referral code" },
        { status: 400 }
      );
    }

    // Find the referrer by their referral code
    const referrer = await db.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: { id: true, credits: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Can't refer yourself
    if (referrer.id === newUser.id) {
      return NextResponse.json(
        { error: "Cannot use your own referral code" },
        { status: 400 }
      );
    }

    // Check if this referral already exists
    const existingReferral = await db.referral.findFirst({
      where: {
        referrerId: referrer.id,
        referredUserId: newUser.id,
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "Referral already processed" },
        { status: 400 }
      );
    }

    // Create the referral and award credits in a transaction (BOTH users get credits)
    await db.$transaction([
      // Create referral record
      db.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUser.id,
          referredEmail: newUser.email,
          referralCode: nanoid(12),
          status: "completed",
          creditsAwarded: REFERRAL_CREDITS * 2, // Total credits awarded (both users)
          completedAt: new Date(),
        },
      }),
      // Award credits to referrer
      db.user.update({
        where: { id: referrer.id },
        data: { credits: { increment: REFERRAL_CREDITS } },
      }),
      // Award credits to referred user AND mark as referred
      db.user.update({
        where: { id: newUser.id },
        data: {
          referredBy: referralCode.toUpperCase(),
          credits: { increment: REFERRAL_CREDITS },
        },
      }),
      // Create notification for referrer
      db.notification.create({
        data: {
          userId: referrer.id,
          type: "referral",
          title: "Referral Bonus!",
          message: `You earned ${REFERRAL_CREDITS} credits! Someone signed up using your referral link.`,
          link: "/dashboard/billing",
        },
      }),
      // Create notification for referred user
      db.notification.create({
        data: {
          userId: newUser.id,
          type: "referral",
          title: "Welcome Bonus!",
          message: `You earned ${REFERRAL_CREDITS} bonus credits for using a referral link!`,
          link: "/dashboard/billing",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Referral completed! Both you and the referrer earned ${REFERRAL_CREDITS} credits.`,
      creditsAwarded: REFERRAL_CREDITS,
    });
  } catch (error) {
    console.error("Error processing referral:", error);
    return NextResponse.json(
      { error: "Failed to process referral" },
      { status: 500 }
    );
  }
}

import { redirect, notFound } from "next/navigation";
import { auth } from "~/lib/auth-server";
import { db } from "~/server/db";
import InvitationClient from "./InvitationClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { id: presentationId } = await params;
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  // Find the collaboration invite
  const collaboration = await db.collaboration.findFirst({
    where: {
      presentationId,
      inviteToken: token,
    },
    include: {
      presentation: {
        select: {
          id: true,
          title: true,
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  if (!collaboration) {
    notFound();
  }

  // Check if already accepted
  if (collaboration.status === "accepted") {
    redirect(`/presentation/${presentationId}`);
  }

  // Check if user is logged in
  const { userId: clerkId } = await auth();

  return (
    <InvitationClient
      collaboration={{
        id: collaboration.id,
        email: collaboration.email,
        role: collaboration.role,
        status: collaboration.status,
        presentationId: collaboration.presentationId,
        presentationTitle: collaboration.presentation.title,
        inviterName: collaboration.presentation.user.name || "Someone",
      }}
      token={token}
      isLoggedIn={!!clerkId}
    />
  );
}

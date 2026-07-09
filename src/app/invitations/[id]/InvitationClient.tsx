"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { CheckCircle2, Users, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface InvitationClientProps {
  collaboration: {
    id: string;
    email: string;
    role: string;
    status: string;
    presentationId: string;
    presentationTitle: string;
    inviterName: string;
  };
  token: string;
  isLoggedIn: boolean;
}

export default function InvitationClient({
  collaboration,
  token,
  isLoggedIn,
}: InvitationClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);

    try {
      const res = await fetch(`/api/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentationId: collaboration.presentationId,
          token,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      setAccepted(true);
      toast.success("Invitation accepted!");

      // Redirect to presentation after a short delay
      setTimeout(() => {
        router.push(`/presentation/${collaboration.presentationId}`);
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation"
      );
    } finally {
      setAccepting(false);
    }
  };

  const roleIcon =
    collaboration.role === "editor" ? (
      <Edit3 className="w-5 h-5" />
    ) : (
      <Eye className="w-5 h-5" />
    );
  const roleText = collaboration.role === "editor" ? "edit" : "view";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              You&apos;re Invited!
            </h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {accepted ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Invitation Accepted!
                </h2>
                <p className="text-slate-600 text-sm">
                  Redirecting you to the presentation...
                </p>
              </div>
            ) : (
              <>
                <p className="text-slate-600 text-center mb-6">
                  <strong className="text-slate-900">
                    {collaboration.inviterName}
                  </strong>{" "}
                  has invited you to {roleText}:
                </p>

                {/* Presentation Card */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <h2 className="font-semibold text-slate-900 text-lg mb-2">
                    {collaboration.presentationTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {roleIcon}
                    <span>
                      {collaboration.role === "editor"
                        ? "Can Edit"
                        : "Can View"}
                    </span>
                  </div>
                </div>

                {/* Invited Email */}
                <p className="text-xs text-slate-500 text-center mb-6">
                  Invitation sent to:{" "}
                  <span className="font-medium">{collaboration.email}</span>
                </p>

                {/* Action */}
                {isLoggedIn ? (
                  <button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {accepting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Accept Invitation
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 text-center">
                      Sign in to accept this invitation
                    </p>
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl={`/invitations/${collaboration.presentationId}?token=${token}`}
                    >
                      <button className="w-full py-3 px-4 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold rounded-xl hover:opacity-90 transition">
                        Sign In to Accept
                      </button>
                    </SignInButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Powered by{" "}
          <a href="/" className="text-[#1e3a8a] hover:underline">
            PPTera
          </a>
        </p>
      </div>
    </div>
  );
}

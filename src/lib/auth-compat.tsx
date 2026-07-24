"use client";

/**
 * Clerk-shaped client compat layer over Better Auth.
 *
 * The app was written against Clerk's React API (`useUser`, `SignedIn`,
 * `SignedOut`, `useClerk`, `UserButton`). This module re-implements those
 * shapes on Better Auth sessions so call sites only swap their import from
 * "@clerk/nextjs" to "~/lib/auth-compat".
 */

import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient, useSession } from "~/lib/auth-client";

interface CompatEmail {
  emailAddress: string;
  verification: { status: "verified" | "unverified" };
}

export interface CompatUser {
  id: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
  primaryEmailAddress: CompatEmail | null;
  emailAddresses: CompatEmail[];
}

function toCompatUser(sessionUser: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: boolean;
}): CompatUser {
  const name = (sessionUser.name ?? "").trim();
  const [firstName, ...rest] = name.split(/\s+/);
  const email: CompatEmail | null = sessionUser.email
    ? {
        emailAddress: sessionUser.email,
        verification: { status: sessionUser.emailVerified ? "verified" : "unverified" },
      }
    : null;
  return {
    id: sessionUser.id,
    fullName: name || null,
    firstName: firstName || null,
    lastName: rest.join(" ") || null,
    username: null,
    imageUrl: sessionUser.image ?? "",
    primaryEmailAddress: email,
    emailAddresses: email ? [email] : [],
  };
}

/** Clerk-compatible `useUser()`. */
export function useUser(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: CompatUser | null;
} {
  const { data, isPending } = useSession();
  const user = useMemo(
    () => (data?.user ? toCompatUser(data.user) : null),
    [data?.user],
  );
  return { isLoaded: !isPending, isSignedIn: !!user, user };
}

/** Clerk-compatible `useClerk()` — only the members this codebase uses. */
export function useClerk() {
  const router = useRouter();
  return {
    signOut: async (options?: { redirectUrl?: string }) => {
      await authClient.signOut();
      router.push(options?.redirectUrl ?? "/");
      router.refresh();
    },
    openSignIn: () => router.push("/sign-in"),
  };
}

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

function initialsOf(user: CompatUser): string {
  const source = user.fullName || user.primaryEmailAddress?.emailAddress || "?";
  const parts = source.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

/**
 * Non-interactive avatar (a <span>, never a <button>) — safe to embed inside
 * other clickable elements, e.g. the sidebar's account row, without invalid
 * button-in-button nesting.
 */
export function UserAvatar({ className }: { className?: string }) {
  const { user } = useUser();
  if (!user) return null;
  return (
    <span
      className={
        className ??
        "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-emerald-600 to-teal-500 text-[11px] font-black text-white shadow-sm dark:border-white/10"
      }
      title={user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Account"}
    >
      {user.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initialsOf(user)
      )}
    </span>
  );
}

/**
 * Clerk-compatible `<UserButton />`: avatar with a small sign-out menu.
 * Deliberately minimal — profile management lives in /dashboard/settings.
 * Accepts (and mostly ignores) Clerk's props so call sites don't churn.
 */
export function UserButton({
  afterSignOutUrl,
}: {
  afterSignOutUrl?: string;
  appearance?: unknown;
} = {}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full transition hover:brightness-110"
        title={user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Account"}
      >
        <UserAvatar />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          <div className="border-b border-slate-100 px-3.5 py-2.5 dark:border-zinc-700">
            <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
              {user.fullName ?? "Account"}
            </p>
            <p className="truncate text-[11px] text-slate-400 dark:text-zinc-400">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: afterSignOutUrl ?? "/" })}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

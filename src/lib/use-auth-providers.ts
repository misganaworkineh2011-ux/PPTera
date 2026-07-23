"use client";

import { useEffect, useState } from "react";

let cached: { google: boolean } | null = null;

/**
 * Availability of social sign-in providers (from /api/auth/providers).
 * `google` stays false until the server confirms credentials are configured.
 */
export function useAuthProviders(): { google: boolean; loaded: boolean } {
  const [state, setState] = useState<{ google: boolean; loaded: boolean }>(
    cached ? { ...cached, loaded: true } : { google: false, loaded: false },
  );

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const providers = { google: !!data?.google };
        cached = providers;
        if (!cancelled) setState({ ...providers, loaded: true });
      })
      .catch(() => {
        if (!cancelled) setState({ google: false, loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

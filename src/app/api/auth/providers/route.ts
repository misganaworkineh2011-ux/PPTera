import { NextResponse } from "next/server";

/**
 * Which social sign-in providers are configured on this deployment.
 * Public + cacheable: the sign-in/sign-up pages use it to decide whether to
 * render the Google button, so availability follows the server env — no
 * separate NEXT_PUBLIC flag to keep in sync.
 */
export async function GET() {
  // no-store: availability must flip the moment credentials are added or
  // removed — a cached "false" would hide the Google button for minutes.
  return NextResponse.json(
    {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

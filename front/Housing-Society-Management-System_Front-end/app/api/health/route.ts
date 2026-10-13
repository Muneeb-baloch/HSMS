import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lightweight health for Vercel / uptime monitors.
 * Does not call MongoDB or the Express API (safe when backend is down).
 */
export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "hsms-frontend",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      deployment: process.env.VERCEL_URL ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      time: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

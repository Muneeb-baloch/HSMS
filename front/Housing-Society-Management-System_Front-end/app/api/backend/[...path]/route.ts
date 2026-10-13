import type { NextRequest } from "next/server";

/**
 * Serverless BFF (Vercel / Next.js only): forwards `/api/backend/*` → Express API.
 *
 * **Single deploy model:** Express stays on Render/Railway/VPS; only this Next app
 * ships serverless routes to Vercel.
 *
 * Base URL (first match):
 * - `HSMS_BACKEND_URL` — server-only override (optional)
 * - `NEXT_PUBLIC_API_URL` — same value you already use for axios (typical on Vercel)
 *
 * Example: `NEXT_PUBLIC_API_URL=https://api.example.com/api`
 * → `GET /api/backend/v1/projects` → upstream `GET https://api.example.com/api/v1/projects`
 */
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FORWARD_HEADER_NAMES = [
  "authorization",
  "content-type",
  "cookie",
  "accept",
  "accept-language",
  "x-request-id",
] as const;

function backendBase(): string | null {
  const raw =
    process.env.HSMS_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

function buildTargetUrl(pathSegments: string[], search: string): string | null {
  const base = backendBase();
  if (!base) return null;
  const suffix = pathSegments.join("/");
  const path = suffix ? `${base}/${suffix}` : base;
  return `${path}${search}`;
}

function forwardRequestHeaders(source: Headers): Headers {
  const out = new Headers();
  for (const name of FORWARD_HEADER_NAMES) {
    const v = source.get(name);
    if (v) out.set(name, v);
  }
  return out;
}

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
): Promise<Response> {
  const { path: segments } = await ctx.params;
  const pathSegments = segments ?? [];
  const targetUrl = buildTargetUrl(
    pathSegments,
    req.nextUrl.search
  );

  if (!targetUrl) {
    return Response.json(
      {
        error: "Misconfigured",
        message:
          "Set NEXT_PUBLIC_API_URL (or HSMS_BACKEND_URL) in Vercel to your Express API root, e.g. https://api.example.com/api",
      },
      { status: 503 }
    );
  }

  const method = req.method.toUpperCase();
  const headers = forwardRequestHeaders(req.headers);

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(method) && req.body) {
    init.body = req.body;
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const resHeaders = new Headers(upstream.headers);
    resHeaders.delete("transfer-encoding");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upstream fetch failed";
    return Response.json(
      { error: "BadGateway", message },
      { status: 502 }
    );
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
      "Access-Control-Allow-Headers":
        "Authorization, Content-Type, Cookie, Accept, Accept-Language, X-Request-Id",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}

export function HEAD(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}

export function POST(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}

export function PUT(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}

export function PATCH(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}

export function DELETE(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}

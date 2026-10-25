import { NextRequest, NextResponse } from "next/server";
import { GITHUB_ORIGIN } from "./lib/site-auth";

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== GITHUB_ORIGIN) return NextResponse.next();
  const headers = {
    "Access-Control-Allow-Origin": GITHUB_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

export const config = { matcher: "/api/:path*" };

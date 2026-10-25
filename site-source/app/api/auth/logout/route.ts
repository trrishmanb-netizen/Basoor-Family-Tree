import { SESSION_COOKIE, cookieHeader, getDatabase, getSessionToken, hashToken, isSameOrigin, jsonError } from "../../../../lib/site-auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Request origin is not allowed.", 403);
  const token = getSessionToken(request);
  if (token) await getDatabase().prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hashToken(token)).run();
  const response = Response.json({ message: "Signed out." });
  response.headers.append("Set-Cookie", cookieHeader(SESSION_COOKIE, "", 0, request));
  return response;
}

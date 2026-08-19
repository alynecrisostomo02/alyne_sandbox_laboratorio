import { env } from "cloudflare:workers";
import { clearSessionCookie, createSessionCookie, credentialsMatch, isAuthenticated, json, readJson, sameOrigin } from "@/src/admin/server";

export async function GET(request) {
  try {
    return json({ authenticated: await isAuthenticated(request) });
  } catch {
    return json({ authenticated: false });
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  try {
    const limiter = env.ADMIN_LOGIN_RATE_LIMITER;
    if (limiter) {
      const key = request.headers.get("CF-Connecting-IP") || "local";
      const result = await limiter.limit({ key: `admin-login:${key}` });
      if (!result.success) return json({ code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
    }
    const body = await readJson(request, 2_000);
    if (!credentialsMatch(body?.email, body?.password)) return json({ code: "INVALID_CREDENTIALS" }, 401);
    return json({ authenticated: true }, 200, { "Set-Cookie": await createSessionCookie(request) });
  } catch (error) {
    return json({ code: error?.message === "ADMIN_SESSION_NOT_CONFIGURED" ? "ADMIN_NOT_CONFIGURED" : "INVALID_REQUEST" }, 503);
  }
}

export async function DELETE(request) {
  if (!sameOrigin(request)) return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  return json({ authenticated: false }, 200, { "Set-Cookie": clearSessionCookie(request) });
}

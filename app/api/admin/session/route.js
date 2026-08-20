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
    let limiter = null;
    try {
      if (typeof env !== "undefined" && env?.ADMIN_LOGIN_RATE_LIMITER) {
        limiter = env.ADMIN_LOGIN_RATE_LIMITER;
      }
    } catch {}

    if (limiter) {
      const key = request.headers.get("CF-Connecting-IP") || "local";
      const result = await limiter.limit({ key: `admin-login:${key}` });
      if (!result.success) return json({ code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
    }
    const body = await readJson(request, 2_000);
    if (!credentialsMatch(body?.email, body?.password)) return json({ code: "INVALID_CREDENTIALS" }, 401);
    const { token, cookie } = await createSessionCookie(request);
    return json({ authenticated: true, token }, 200, { "Set-Cookie": cookie });
  } catch (error) {
    return json({ code: error?.message === "ADMIN_SESSION_NOT_CONFIGURED" ? "ADMIN_NOT_CONFIGURED" : "INVALID_REQUEST" }, 503);
  }
}

export async function DELETE(request) {
  if (!sameOrigin(request)) return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  return json({ authenticated: false }, 200, { "Set-Cookie": clearSessionCookie(request) });
}

import { env } from "cloudflare:workers";
import { isAuthenticated, json, sameOrigin } from "@/src/admin/server";

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extension(type) {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  if (!(await isAuthenticated(request))) return json({ code: "UNAUTHORIZED" }, 401);
  const type = (request.headers.get("Content-Type") || "").toLowerCase().split(";")[0];
  const size = Number(request.headers.get("Content-Length") || 0);
  if (!ALLOWED_TYPES.has(type)) return json({ code: "UNSUPPORTED_IMAGE" }, 415);
  if (!request.body || size <= 0 || size > MAX_PHOTO_BYTES) return json({ code: "IMAGE_TOO_LARGE" }, 413);
  const propertyId = (request.headers.get("X-Property-Id") || "sem-referencia").replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const key = `properties/${propertyId}/${crypto.randomUUID()}.${extension(type)}`;
  try {
    const bytes = await request.arrayBuffer();
    await env.PROPERTY_IMAGES.put(key, bytes, { metadata: { contentType: type, uploadedBy: "admin" } });
    return json({ src: `/api/media/${key}`, key });
  } catch (error) {
    console.error(JSON.stringify({ event: "photo_upload_failed", message: error?.message }));
    return json({ code: "STORAGE_UNAVAILABLE" }, 503);
  }
}

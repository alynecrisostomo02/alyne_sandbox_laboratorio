import { env } from "cloudflare:workers";

export async function GET(request, context) {
  const params = await context.params;
  const key = Array.isArray(params?.key) ? params.key.join("/") : String(params?.key || "");
  if (!key.startsWith("properties/") || key.includes("..")) return new Response("Not found", { status: 404 });
  const object = await env.PROPERTY_IMAGES.getWithMetadata(key, { type: "arrayBuffer" });
  if (!object?.value) return new Response("Not found", { status: 404 });
  const headers = new Headers({
    "Content-Type": object.metadata?.contentType || "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.value, { status: 200, headers });
}

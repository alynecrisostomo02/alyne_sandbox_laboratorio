import { deleteProperty, isAuthenticated, json, sameOrigin } from "@/src/admin/server";

export async function DELETE(request, context) {
  if (!sameOrigin(request)) return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  if (!(await isAuthenticated(request))) return json({ code: "UNAUTHORIZED" }, 401);
  const params = await context.params;
  const id = decodeURIComponent(params?.id || "");
  if (!/^REF-[A-Z0-9-]+$/i.test(id)) return json({ code: "INVALID_PROPERTY" }, 400);
  try {
    await deleteProperty(id);
    return json({ deleted: true });
  } catch {
    return json({ code: "DATABASE_UNAVAILABLE" }, 503);
  }
}

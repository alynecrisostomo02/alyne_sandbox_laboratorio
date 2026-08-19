import { cleanProperty, isAuthenticated, json, listProperties, readJson, sameOrigin, saveProperty, seedCatalogIfEmpty } from "@/src/admin/server";

export async function GET(request) {
  if (!(await isAuthenticated(request))) return json({ code: "UNAUTHORIZED" }, 401);
  try {
    await seedCatalogIfEmpty();
    return json({ properties: await listProperties() });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_properties_read_failed", message: error?.message }));
    return json({ code: "DATABASE_UNAVAILABLE" }, 503);
  }
}

export async function PUT(request) {
  if (!sameOrigin(request)) return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  if (!(await isAuthenticated(request))) return json({ code: "UNAUTHORIZED" }, 401);
  try {
    const property = cleanProperty(await readJson(request));
    await saveProperty(property, { createOnly: request.headers.get("X-Admin-Operation") === "create" });
    return json({ property });
  } catch (error) {
    if (error?.message === "PROPERTY_CODE_EXISTS") return json({ code: "PROPERTY_CODE_EXISTS" }, 409);
    const invalid = ["INVALID_PROPERTY", "REQUEST_TOO_LARGE"].includes(error?.message);
    return json({ code: invalid ? error.message : "DATABASE_UNAVAILABLE" }, invalid ? 400 : 503);
  }
}

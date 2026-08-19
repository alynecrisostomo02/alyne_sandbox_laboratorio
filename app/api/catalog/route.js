import { json, listProperties } from "@/src/admin/server";

export async function GET() {
  try {
    const properties = (await listProperties()).filter((property) => property.status !== "Arquivado");
    return json({ properties }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error(JSON.stringify({ event: "catalog_read_failed", message: error?.message }));
    return json({ code: "CATALOG_UNAVAILABLE" }, 503);
  }
}

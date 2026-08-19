const baseUrl = process.env.ADMIN_TEST_URL;
const email = process.env.ADMIN_TEST_EMAIL;
const password = process.env.ADMIN_TEST_PASSWORD;
const id = "REF-TESTE-ADMIN";

if (!baseUrl || !email || !password) {
  throw new Error("Defina ADMIN_TEST_URL, ADMIN_TEST_EMAIL e ADMIN_TEST_PASSWORD.");
}

const origin = new URL(baseUrl).origin;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  if (!response.ok) throw new Error(`${options.method || "GET"} ${path}: HTTP ${response.status}`);
  return response;
}

const login = await request("/api/admin/session", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin },
  body: JSON.stringify({ email, password }),
});
const cookie = login.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("A sessão administrativa não foi criada.");

const adminHeaders = { "Content-Type": "application/json", Origin: origin, Cookie: cookie };
const property = {
  id,
  idRef: "TESTE-ADMIN",
  slug: "teste-admin-ref",
  title: "Imóvel temporário de verificação",
  purpose: "locacao",
  type: "casa",
  city: "Redenção",
  publicLocation: "Redenção, PA",
  price: 1500,
  status: "Disponível",
  publishedAt: "2026-08-13",
  features: ["Piscina", "Dois pisos"],
  gallery: [{ src: "/branding/logo-alyne-padrao.jpg", alt: "Teste" }],
};

async function save(status) {
  property.status = status;
  await request("/api/admin/properties", { method: "PUT", headers: adminHeaders, body: JSON.stringify(property) });
}

async function publicRecord() {
  const response = await request(`/api/catalog?check=${crypto.randomUUID()}`);
  const payload = await response.json();
  return payload.properties.find((item) => item.id === id);
}

try {
  await save("Disponível");
  const added = await publicRecord();
  await save("Indisponível");
  const unavailable = await publicRecord();
  await save("Arquivado");
  const archivedPublic = await publicRecord();
  const adminPayload = await (await request("/api/admin/properties", { headers: { Cookie: cookie } })).json();
  const archivedAdmin = adminPayload.properties.find((item) => item.id === id);
  await save("Disponível");
  const restored = await publicRecord();

  const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
  const upload = await request("/api/admin/photos", {
    method: "POST",
    headers: { "Content-Type": "image/png", "X-Property-Id": id, Origin: origin, Cookie: cookie },
    body: png,
  });
  const uploaded = await upload.json();
  const photo = await request(uploaded.src);

  const checks = {
    added: added?.status === "Disponível",
    unavailable: unavailable?.status === "Indisponível",
    archivedHidden: !archivedPublic,
    archivedKeptInAdmin: archivedAdmin?.status === "Arquivado",
    restored: restored?.status === "Disponível",
    advancedFilters: restored?.features?.includes("Piscina") && restored?.features?.includes("Dois pisos"),
    photoUpload: photo.headers.get("content-type") === "image/png",
  };
  const failed = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  if (failed.length) throw new Error(`Falharam: ${failed.join(", ")}`);
  console.log("Admin verificado ao vivo: adicionar, indisponível, arquivar, restaurar, filtros e foto passaram.");
} finally {
  await fetch(`${baseUrl}/api/admin/properties/${id}`, { method: "DELETE", headers: { Origin: origin, Cookie: cookie } });
}

import { env } from "cloudflare:workers";
import { properties as fallbackProperties } from "../properties";

const encoder = new TextEncoder();
const SESSION_SECONDS = 60 * 60 * 8;
const MAX_PROPERTY_BYTES = 120_000;

export function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getEnvVar(name, fallback = "") {
  let val = "";
  try {
    if (typeof env !== "undefined" && env && env[name]) {
      val = env[name];
    }
  } catch {}
  if (!val) {
    try {
      if (typeof process !== "undefined" && process?.env && process.env[name]) {
        val = process.env[name];
      }
    } catch {}
  }
  return String(val || fallback).trim();
}

async function hmac(value) {
  const secret = String(env.ADMIN_SESSION_SECRET || "");
  if (!secret) throw new Error("ADMIN_SESSION_NOT_CONFIGURED");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function readCookie(request, name) {
  const pair = (request.headers.get("Cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

export async function createSessionCookie(request) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = crypto.randomUUID();
  const payload = `${expires}.${nonce}`;
  const signature = await hmac(payload);
  const token = `${payload}.${signature}`;
  const isHttps = request?.headers?.get("x-forwarded-proto") === "https" || (request?.url && new URL(request.url).protocol === "https:");
  const cookieFlags = isHttps ? "SameSite=None; Secure" : "SameSite=Lax";
  const cookie = `alyne_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; ${cookieFlags}; Max-Age=${SESSION_SECONDS}`;
  return { token, cookie };
}

export function clearSessionCookie(request) {
  const isHttps = request?.headers?.get("x-forwarded-proto") === "https" || (request?.url && new URL(request.url).protocol === "https:");
  const cookieFlags = isHttps ? "SameSite=None; Secure" : "SameSite=Lax";
  return `alyne_admin_session=; Path=/; HttpOnly; ${cookieFlags}; Max-Age=0`;
}

export async function isAuthenticated(request) {
  let token = readCookie(request, "alyne_admin_session");
  if (!token) {
    token = request.headers.get("x-admin-token") || "";
  }
  if (!token) {
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }
  if (!token) return false;
  const parts = decodeURIComponent(token).split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, signature] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) <= Math.floor(Date.now() / 1000) || !nonce || !signature) return false;
  const expected = await hmac(`${expires}.${nonce}`);
  const left = encoder.encode(signature);
  const right = encoder.encode(expected);
  return left.byteLength === right.byteLength && crypto.subtle.timingSafeEqual(left, right);
}

function secretMatches(actualValue, expectedValue, ignoreCase = false) {
  const normalize = (value) => {
    const clean = String(value || "").trim();
    return ignoreCase ? clean.toLocaleLowerCase("pt-BR") : clean;
  };
  const expected = encoder.encode(normalize(expectedValue));
  const actual = encoder.encode(normalize(actualValue));
  return expected.byteLength > 0 && expected.byteLength === actual.byteLength && crypto.subtle.timingSafeEqual(expected, actual);
}

export function credentialsMatch(email, password) {
  return secretMatches(email, env.ADMIN_EMAIL, true) && secretMatches(password, env.ADMIN_PASSWORD);
}

export async function readJson(request, maxBytes = MAX_PROPERTY_BYTES) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > maxBytes) throw new Error("REQUEST_TOO_LARGE");
  const text = await request.text();
  if (encoder.encode(text).byteLength > maxBytes) throw new Error("REQUEST_TOO_LARGE");
  return JSON.parse(text);
}

export function cleanProperty(value) {
  if (!value || typeof value !== "object") throw new Error("INVALID_PROPERTY");
  const id = String(value.id || "").trim().slice(0, 32);
  const title = String(value.title || "").trim().slice(0, 180);
  if (!/^REF-[A-Z0-9-]+$/i.test(id) || !title) throw new Error("INVALID_PROPERTY");
  const clone = JSON.parse(JSON.stringify(value));
  clone.id = id;
  clone.title = title;
  clone.updatedAt = new Date().toISOString();
  return clone;
}

let tablesEnsured = false;

export async function ensureTablesExist() {
  if (!env?.CATALOG_DB || tablesEnsured) return;
  try {
    await env.CATALOG_DB.prepare(
      "CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, status TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL)"
    ).run();
    try {
      await env.CATALOG_DB.prepare(
        "CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status)"
      ).run();
      await env.CATALOG_DB.prepare(
        "CREATE INDEX IF NOT EXISTS properties_updated_at_idx ON properties(updated_at DESC)"
      ).run();
    } catch {}

    await env.CATALOG_DB.prepare(
      "CREATE TABLE IF NOT EXISTS capture_forms (id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'draft', data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"
    ).run();
    try {
      await env.CATALOG_DB.prepare(
        "CREATE INDEX IF NOT EXISTS capture_forms_status_idx ON capture_forms(status)"
      ).run();
      await env.CATALOG_DB.prepare(
        "CREATE INDEX IF NOT EXISTS capture_forms_updated_at_idx ON capture_forms(updated_at DESC)"
      ).run();
    } catch {}

    tablesEnsured = true;
  } catch (error) {
    console.warn("D1 ensureTablesExist:", error?.message);
  }
}

export async function listProperties() {
  if (!env?.CATALOG_DB) return fallbackProperties;
  try {
    await ensureTablesExist();
    const result = await env.CATALOG_DB.prepare("SELECT data FROM properties ORDER BY updated_at DESC").all();
    if (!result?.results?.length) return fallbackProperties;
    return result.results.map((row) => JSON.parse(row.data));
  } catch (error) {
    console.warn("listProperties fallback triggered:", error?.message);
    return fallbackProperties;
  }
}

export async function seedCatalogIfEmpty() {
  if (!env?.CATALOG_DB) return;
  try {
    await ensureTablesExist();
    const count = await env.CATALOG_DB.prepare("SELECT COUNT(*) AS total FROM properties").first();
    if (Number(count?.total) > 0) return;
    await env.CATALOG_DB.batch(fallbackProperties.map((property) => env.CATALOG_DB.prepare(
      "INSERT INTO properties (id, status, data, updated_at) VALUES (?, ?, ?, ?)"
    ).bind(property.id, property.status || "Disponibilidade sob consulta", JSON.stringify(property), new Date().toISOString())));
  } catch (error) {
    console.warn("seedCatalogIfEmpty failed:", error?.message);
  }
}

export async function saveProperty(property, { createOnly = false } = {}) {
  await ensureTablesExist();
  await seedCatalogIfEmpty();
  if (createOnly) {
    const result = await env.CATALOG_DB.prepare(`
      INSERT INTO properties (id, status, data, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).bind(property.id, property.status || "Disponibilidade sob consulta", JSON.stringify(property), property.updatedAt).run();
    if (Number(result.meta?.changes) !== 1) throw new Error("PROPERTY_CODE_EXISTS");
    return;
  }
  await env.CATALOG_DB.prepare(`
    INSERT INTO properties (id, status, data, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET status = excluded.status, data = excluded.data, updated_at = excluded.updated_at
  `).bind(property.id, property.status || "Disponibilidade sob consulta", JSON.stringify(property), property.updatedAt).run();
}

export async function deleteProperty(id) {
  await ensureTablesExist();
  await seedCatalogIfEmpty();
  await env.CATALOG_DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();
}


export function cleanCaptureForm(value) {
  if (!value || typeof value !== "object") throw new Error("INVALID_CAPTURE_FORM");

  const clone = JSON.parse(JSON.stringify(value));

  clone.id = String(
    clone.id || `CAP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  ).trim().slice(0, 64);

  clone.status = String(clone.status || "draft").trim().slice(0, 32);
  clone.createdAt = clone.createdAt || new Date().toISOString();
  clone.updatedAt = new Date().toISOString();

  return clone;
}

export async function listCaptureForms() {
  if (!env?.CATALOG_DB) return [];
  try {
    await ensureTablesExist();
    const result = await env.CATALOG_DB.prepare(
      "SELECT data FROM capture_forms ORDER BY updated_at DESC"
    ).all();

    return (result?.results || []).map((row) => JSON.parse(row.data));
  } catch (error) {
    console.warn("listCaptureForms failed:", error?.message);
    return [];
  }
}

export async function saveCaptureForm(form) {
  await ensureTablesExist();
  await env.CATALOG_DB.prepare(`
    INSERT INTO capture_forms (id, status, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      data = excluded.data,
      updated_at = excluded.updated_at
  `).bind(
    form.id,
    form.status,
    JSON.stringify(form),
    form.createdAt,
    form.updatedAt
  ).run();
}

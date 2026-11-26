import { requireAdmin } from "../_lib/access.js";

const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const fields = ["title", "location", "price", "status", "beds", "baths", "details", "image_url"];

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "Property database is not connected yet." }, 503);
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, title, location, price, status, beds, baths, details, image_url, created_at, updated_at FROM properties ORDER BY updated_at DESC"
    ).all();
    return json({ properties: results || [] });
  } catch {
    return json({ error: "Unable to load properties. Check the database setup." }, 503);
  }
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (!env.DB) return json({ error: "Property database is not connected yet." }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Please submit valid property details." }, 400); }
  const value = {};
  for (const field of fields) value[field] = String(body[field] ?? "").trim();
  if (!value.title || !value.location) return json({ error: "Property title and location are required." }, 400);
  if (!["available", "sold"].includes(value.status)) return json({ error: "Choose Available or Sold status." }, 400);
  if (value.title.length > 160 || value.location.length > 180 || value.details.length > 6000) return json({ error: "One or more fields exceed the allowed length." }, 400);

  const id = String(body.id || crypto.randomUUID());
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(`
      INSERT INTO properties (id, title, location, price, status, beds, baths, details, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, location=excluded.location, price=excluded.price, status=excluded.status,
        beds=excluded.beds, baths=excluded.baths, details=excluded.details, image_url=excluded.image_url,
        updated_at=excluded.updated_at
    `).bind(id, value.title, value.location, value.price, value.status, value.beds, value.baths, value.details, value.image_url, now, now).run();
    return json({ ok: true, id });
  } catch {
    return json({ error: "The property could not be saved. Check the database migration." }, 503);
  }
}

export async function onRequestDelete({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (!env.DB) return json({ error: "Property database is not connected yet." }, 503);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "A property ID is required." }, 400);
  try {
    await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();
    return json({ ok: true });
  } catch {
    return json({ error: "The property could not be deleted." }, 503);
  }
}

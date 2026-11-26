import { requireAdmin } from "../../_lib/auth.js";
const json = (data, status=200) => Response.json(data, { status });
function clean(v, max=3000) { return String(v ?? "").trim().slice(0,max); }
function valid(body) {
  return body && clean(body.title,180) && clean(body.location,220) &&
    ["available","sold"].includes(body.status || "available");
}
export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const { results } = await env.DB.prepare("SELECT * FROM properties ORDER BY updated_at DESC").all();
  return json(results || []);
}
export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  let body; try { body = await request.json(); } catch { return json({error:"Invalid JSON."},400); }
  if (!valid(body)) return json({error:"Enter a property title, location and valid status."},400);
  const item = {
    id: crypto.randomUUID(), title:clean(body.title,180), location:clean(body.location,220),
    price:clean(body.price,80), status:body.status || "available", beds:clean(body.beds,80),
    baths:clean(body.baths,80), details:clean(body.details,3000), image:clean(body.image,1000)
  };
  await env.DB.prepare("INSERT INTO properties (id,title,location,price,status,beds,baths,details,image,updated_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)")
    .bind(item.id,item.title,item.location,item.price,item.status,item.beds,item.baths,item.details,item.image).run();
  return json(item,201);
}
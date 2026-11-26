import { requireAdmin } from "../../../_lib/auth.js";
const json = (data, status=200) => Response.json(data, { status });
function clean(v, max=3000) { return String(v ?? "").trim().slice(0,max); }
export async function onRequestPut({ request, env, params }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  let body; try { body = await request.json(); } catch { return json({error:"Invalid JSON."},400); }
  if (!clean(body.title,180) || !clean(body.location,220) || !["available","sold"].includes(body.status)) {
    return json({error:"Enter a property title, location and valid status."},400);
  }
  const result = await env.DB.prepare("UPDATE properties SET title=?,location=?,price=?,status=?,beds=?,baths=?,details=?,image=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .bind(clean(body.title,180),clean(body.location,220),clean(body.price,80),body.status,clean(body.beds,80),clean(body.baths,80),clean(body.details,3000),clean(body.image,1000),params.id).run();
  if (!result.meta.changes) return json({error:"Property not found."},404);
  return json({success:true});
}
export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const result = await env.DB.prepare("DELETE FROM properties WHERE id=?").bind(params.id).run();
  if (!result.meta.changes) return json({error:"Property not found."},404);
  return json({success:true});
}
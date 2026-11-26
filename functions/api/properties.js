export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id,title,location,price,status,beds,baths,details,image FROM properties ORDER BY updated_at DESC"
    ).all();
    return Response.json(results || [], { headers: { "Cache-Control": "public, max-age=60" } });
  } catch {
    return Response.json({ error: "Property service is not configured yet." }, { status: 503 });
  }
}
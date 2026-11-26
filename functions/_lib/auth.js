export async function requireAdmin(request, env) {
  const expected = env.ADMIN;
  const supplied = request.headers.get("x-admin-password") || "";
  if (!expected || !supplied || supplied.length > 512) {
    return new Response("Enter the admin password in the dashboard.", { status: 401 });
  }
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(supplied);
  if (a.length !== b.length) return new Response("Incorrect admin password.", { status: 401 });
  const digestA = await crypto.subtle.digest("SHA-256", a);
  const digestB = await crypto.subtle.digest("SHA-256", b);
  const x = new Uint8Array(digestA), y = new Uint8Array(digestB);
  let diff = 0; for (let i=0;i<x.length;i++) diff |= x[i] ^ y[i];
  if (diff !== 0) return new Response("Incorrect admin password.", { status: 401 });
  return null;
}
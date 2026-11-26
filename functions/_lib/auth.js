function decodePart(part) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - part.length % 4) % 4);
  return JSON.parse(atob(padded));
}
function decodeBytes(part) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - part.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
export async function requireAdmin(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAIL) {
    return new Response("Admin access is not configured.", { status: 403 });
  }
  try {
    const [headerPart, payloadPart, signaturePart] = token.split(".");
    const header = decodePart(headerPart);
    const claims = decodePart(payloadPart);
    const issuer = "https://" + env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const now = Math.floor(Date.now() / 1000);
    if (claims.iss !== issuer || !Array.isArray(claims.aud) || !claims.aud.includes(env.ACCESS_AUD) ||
        !claims.exp || claims.exp < now || (claims.nbf && claims.nbf > now) ||
        String(claims.email || "").toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return new Response("Not authorised.", { status: 403 });
    }
    const response = await fetch(issuer + "/cdn-cgi/access/certs");
    if (!response.ok) return new Response("Could not verify admin session.", { status: 503 });
    const certs = await response.json();
    const jwk = certs.keys.find(key => key.kid === header.kid);
    if (!jwk || header.alg !== "RS256") return new Response("Invalid admin session.", { status: 403 });
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decodeBytes(signaturePart), new TextEncoder().encode(headerPart + "." + payloadPart));
    if (!valid) return new Response("Invalid admin session.", { status: 403 });
    return null;
  } catch {
    return new Response("Invalid admin session.", { status: 403 });
  }
}
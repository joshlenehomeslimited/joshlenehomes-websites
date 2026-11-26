const decode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
};

const decodeJson = (value) => JSON.parse(decode(value));

export async function requireAdmin(request, env) {
  const teamDomain = String(env.CF_ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const audience = String(env.CF_ACCESS_AUD || "");
  if (!teamDomain || !audience) {
    return { ok: false, response: Response.json({ error: "Admin authentication is not configured. Contact the site administrator." }, { status: 503 }) };
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { ok: false, response: Response.json({ error: "Authentication required." }, { status: 401 }) };

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) throw new Error("Malformed token");
    const header = decodeJson(encodedHeader);
    const claims = decodeJson(encodedPayload);
    if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported token");

    const issuer = `https://${teamDomain}`;
    if (claims.iss !== issuer || !Array.isArray(claims.aud) || !claims.aud.includes(audience)) throw new Error("Invalid issuer or audience");
    if (typeof claims.exp !== "number" || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error("Expired token");

    const certsResponse = await fetch(`${issuer}/cdn-cgi/access/certs`);
    if (!certsResponse.ok) throw new Error("Could not load Access signing keys");
    const certs = await certsResponse.json();
    const jwk = (certs.keys || []).find((key) => key.kid === header.kid);
    if (!jwk) throw new Error("Signing key not found");

    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signature = Uint8Array.from(decode(encodedSignature), (character) => character.charCodeAt(0));
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
    if (!valid) throw new Error("Invalid signature");

    const email = String(claims.email || "").toLowerCase();
    const allowed = String(env.ADMIN_EMAILS || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(email)) {
      return { ok: false, response: Response.json({ error: "This account is not authorised to manage properties." }, { status: 403 }) };
    }
    return { ok: true, email };
  } catch {
    return { ok: false, response: Response.json({ error: "Your admin session could not be verified. Sign in again." }, { status: 401 }) };
  }
}

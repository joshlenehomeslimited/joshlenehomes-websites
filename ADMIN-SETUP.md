# Joshlene Homes — Phase 2 admin setup

This branch adds the first server-side property-management foundation. The live `main` branch is unchanged.

## What is included
- D1 schema for persistent property listings.
- Public read API at `/api/properties`.
- Admin-only create/update/delete API operations.
- Cloudflare Access JWT verification, including optional administrator email allow-list.

## Required Cloudflare setup before the admin API can be used

1. Create a Cloudflare D1 database for this Pages project.
2. Apply `migrations/0001_create_properties.sql` to that database.
3. In the Pages project settings, add a D1 binding named `DB` pointing to the new database for both Preview and Production environments.
4. Create a Cloudflare Access self-hosted application protecting both `/admin.html` and `/api/properties` (or protect the entire admin path and the write API path with equivalent policies).
5. Set these Pages environment variables for Preview first:
   - `CF_ACCESS_TEAM_DOMAIN`: the Access team domain hostname, e.g. `your-team.cloudflareaccess.com` (no protocol).
   - `CF_ACCESS_AUD`: the Access application AUD tag.
   - `ADMIN_EMAILS`: comma-separated administrator email addresses allowed to manage listings.
6. Keep the Access policy restricted to the owner's email address. Do not expose the admin API to the public.
7. Test the Preview deployment before considering a Production rollout.

## Important
- Do not enable the Production D1 binding or Production Access settings until Preview has been tested.
- Property records are stored in D1, not browser local storage.
- Image upload and storage in R2 are a separate next implementation step.
- Existing seed content in the current website remains untouched on the live branch. The admin frontend must be connected to this API before the manager is operational.

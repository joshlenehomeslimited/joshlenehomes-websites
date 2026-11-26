# Joshlene Homes Limited website

Premium responsive static website for Joshlene Homes Limited, deployed on Cloudflare Pages.

## Phase 2 architecture
- Cloudflare Pages serves the public website.
- Pages Functions provide the property API.
- Cloudflare D1 stores shared property records.
- Cloudflare Access protects the admin page and admin API.
- Property images are served as normal files in the GitHub repository / Pages deployment (no R2 required).

## Deploy configuration
- Build command: leave empty
- Build output directory: `/` or `.` (repository root)
- Root directory: `/`
- Do not use `npx wrangler deploy`; this is a Pages project.

## D1 database setup
1. In Cloudflare Dashboard, open **Workers & Pages → D1 SQL Database** and create a database named `joshlene-homes-db`.
2. Open the database's **Console** and run the complete contents of `schema.sql`.
3. Open **Workers & Pages → Pages → joshlene-homes-website → Settings → Functions → D1 database bindings**.
4. Add a binding with variable name `DB` and select `joshlene-homes-db`.
5. Save and redeploy the Pages project.

The exact Pages project name may differ in the account. Select the project currently serving joshlenehomes.com.

## Admin protection
Create a Cloudflare Access self-hosted application for the website and protect both:
- `www.joshlenehomes.com/admin*`
- `www.joshlenehomes.com/api/admin/*`

Create an Allow policy for the administrator's exact email address only. Do not protect `/api/properties`; it is the public read-only endpoint used by the website.

Then add these Pages environment variables (Production and Preview as appropriate):
- `ACCESS_TEAM_DOMAIN`: your Cloudflare Access team domain, e.g. `your-team.cloudflareaccess.com` (without https://)
- `ACCESS_AUD`: the Access application's AUD tag
- `ADMIN_EMAIL`: the exact email address allowed to manage listings

The API independently verifies the Cloudflare Access JWT signature, issuer, audience, expiry and administrator email. Do not publish or commit secrets.

## Property images without R2
Place approved, optimised property images in the repository, for example `images/meg-001-front.jpg`. In the admin dashboard, enter the relative path `images/meg-001-front.jpg` in the Image URL field. Add image files through GitHub; each change is deployed with the Pages site. Avoid very large original camera files; resize/compress images before adding them.

## Admin
After Cloudflare Access and D1 are configured, visit `https://www.joshlenehomes.com/admin.html`. Sign-in is handled by Cloudflare Access. Add, edit, mark sold, or delete listings there. The public site reads the shared D1 data from `/api/properties`.

## Safety / launch notes
- Work on the `phase-2-admin` branch first. Do not change the production `main` branch until the preview has been tested.
- The existing public design and domain configuration are retained.
- The admin dashboard is not secure until the Cloudflare Access applications, allow policy, D1 binding and Pages environment variables above have all been configured.
- Verify property availability, details and price before publishing. The Megamound listing currently carries the previously supplied ₦480,000,000 price.

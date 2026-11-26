# Joshlene Homes Limited website starter

Premium black-and-gold responsive static website for Joshlene Homes Limited.

## Included
- Home, About Us, Services, featured property and contact sections
- Available / sold portfolio tabs
- WhatsApp and email enquiry links
- Starter listing manager at `admin.html`
- Responsive mobile layout

## Cloudflare Pages deployment
This is a static site; it does not need a build step.

For a Git-connected Cloudflare Pages project:
- Build command: leave empty / None
- Build output directory: `/` (repository root, if the dashboard accepts it) or `.` depending on the Pages UI
- Root directory: `/`
- Remove the Worker deploy command `npx wrangler deploy`.
- Use Cloudflare Pages deployment for static assets, not Workers deployment.

If the project requires a deploy command, use:
`npx wrangler pages deploy . --project-name=joshlenehomes-website`

Do not use `npx wrangler deploy` for this static Pages site.

## Important production notes
The admin manager in this starter uses browser local storage. It is suitable for previewing the workflow but is not secure and does not synchronise between devices. Before using it for real property management, protect `/admin.html` with Cloudflare Access and implement Cloudflare Pages Functions with D1 for listing records and R2 for uploaded images.

Replace demo property imagery with the company's own approved photographs and add sold listings after confirming their details. The Megamound listing is populated from the details previously supplied; verify availability and price before publication.

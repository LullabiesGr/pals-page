# PALS Theme Documentation & Support

Public documentation and merchant-support website for the PALS Shopify theme.

## Included

- Responsive PALS-branded public homepage
- Searchable documentation with merchant-focused setup guides
- Header, product card, collection, product page and cart documentation
- Pet Finder Quiz and Build a Box configuration guides
- Changelog, privacy notice, support terms and custom 404 page
- Working support form with validation, file attachment, merchant autoresponder and reference number
- Route metadata, sitemap, robots file, security headers and reduced-motion support

## Local development

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run typecheck
npm run build
npm run preview
```

## Hosting with Bolt and Netlify

1. Import `https://github.com/LullabiesGr/pals-page` into Bolt.
2. Connect the project to Netlify.
3. Keep the build command as `npm run build` and the publish directory as `dist`.
4. Add the required environment variables in the hosting dashboard.
5. Deploy the site and send a real test request through `/support`.
6. Use the deployed `/support` URL as the Shopify Theme Store contact form URL.
7. Use the deployed `/documentation` URL as the documentation URL.

## Required environment variables

Copy `.env.example` and set these values in Netlify or Bolt hosting settings:

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=PALS Support <support@your-verified-domain.com>
SUPPORT_TO_EMAIL=your-support-inbox@example.com
```

`RESEND_FROM_EMAIL` must use a domain verified in Resend. `SUPPORT_TO_EMAIL` is the inbox that receives merchant requests. Never prefix browser-facing variables with `VITE_` when they contain secrets.

## Support form test

Before using the site for Shopify submission, verify all of the following:

- A valid request returns a `PALS-YYYYMMDD-XXXX` reference.
- The support inbox receives the complete request.
- The merchant receives the confirmation email.
- Replying to the support notification replies to the merchant.
- PNG, JPG, WEBP, PDF, TXT and ZIP attachments under 4 MB arrive correctly.
- Invalid URLs, missing consent and descriptions under 30 characters are rejected.

## Content updates

Documentation lives in `src/content.ts`. Shared application layout and page components live in `src/main.tsx`. Brand and responsive styling live in `src/styles.css`.

## Demo store

The public demo link currently points to:

`https://pack-wpsu1enm.myshopify.com`

Update the `DEMO_URL` constant in `src/main.tsx` if the demo-store address changes.

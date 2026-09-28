---
type: minor
areas:
  - collections
  - enquiry
  - platform.i18n
  - platform.next
  - products
  - site
  - tooling
---

## Intent

Rebuild the storefront's presentation layer as the Millnex online machinery store — product-first homepage, ecommerce header (search, account, cart drawer), `/shop` with category/facet/availability filters, redesigned PDP and cart, a device-local wishlist, plus `/about`, `/contact`, `/insights`, `/credits` (`/machines` now redirects to `/shop`) —, add an `enquiry` feature for quote requests, and keep the static export building when the Vendure channel has no products or collections yet.

## Invariants

- Vendure commerce behavior is unchanged: cart (ActiveOrder), checkout, pricing, currency, auth and every GraphQL operation are untouched; cart/checkout/account routes still build and work.
- `product/[slug]/[[...variant]]` and `collection/[slug]` still prerender every catalog slug; when the catalog is empty they prerender a single `__empty__` placeholder that 404s (`platform/next/static-export.ts`) instead of failing `output: 'export'`.
- Every product surface (homepage rails, shop, collections, PDP, wishlist) reads Vendure; there is no frontend product catalogue, and no invented prices, ratings, reviews, statistics or certifications. Structured data never includes ratings or reviews.
- The wishlist stores only Vendure product IDs in `localStorage` and never touches the ActiveOrder.
- All contact details come from `config/contact.ts`; placeholder values are never turned into `tel:`/`wa.me`/`mailto:` links or JSON-LD.
- No component calls `useSearchParams()`; the enquiry form reads `?product=` (or legacy `?machine=`) from `window.location` after mount.
- `app/` files remain re-export shims; the only non-re-export statement allowed is a literal `export const dynamic|revalidate` (required on `sitemap.ts`/`robots.ts` under static export).

## Integration guidance

Downstream storefronts that keep a commerce homepage can ignore `site/home/*` and the marketing routes; the reusable pieces are `platform/next/static-export.ts` (empty-catalog fallback), the brand tokens in `globals.css`, and the `enquiry` feature. The header (`site/navigation/navbar/site-header.tsx`) mounts search, `AccountMenu` and `CartDrawer` (ActiveOrder-backed). `next-themes`' provider is no longer mounted (light-only brand); remount `site/providers/theme-provider.tsx` to restore theme switching. Configure `NEXT_PUBLIC_ENQUIRY_ENDPOINT` to deliver enquiries to a form service or serverless function; without it the form hands off to WhatsApp or email.

## Verification

- Run `npm run check-types`, `npm run lint`, `npm run test`, and `npm run build` against a channel with an empty catalog and confirm the export succeeds.
- Inspect `out/en/index.html`, `out/en/machines/<slug>/index.html` and `out/en/contact/index.html` for a single `<h1>`, canonical links, JSON-LD, and no `BAILOUT_TO_CLIENT_SIDE_RENDERING`.
- Submit the contact form with no delivery channel configured (error state), with `NEXT_PUBLIC_ENQUIRY_ENDPOINT` set (loading → success/error), and with only a WhatsApp number configured (wa.me hand-off).

# CLAUDE.md — Storefront Modernization Guide

Read this first for every task in `apps/storefront`. See also `AGENTS.md` (upstream/upgrade conventions — still binding) and `docs/architecture.md`, `docs/commerce.md`, `docs/ui-system.md`, `docs/decisions.md`, `docs/changelog.md`.

## Mission

Modernize the storefront UI/UX into a premium ecommerce experience **without** changing the Vendure commerce engine: cart (ActiveOrder), checkout, pricing, currency, inventory, auth, or SSR behavior. Redesign the experience, not the commerce engine.

## Vendure protection rules

Treat as protected infrastructure — preserve behavior exactly, only restyle presentation:
- All GraphQL operations/mutations and generated types (`src/graphql-env.d.ts`, `graphql.config.yml`, `tsconfig.json` gql.tada schema pointer)
- `src/platform/vendure/**` (transport, auth-token cookie, channel/currency resolution)
- ActiveOrder is the single source of truth for cart — never a second/local cart state
- Checkout flow order and Stripe PaymentIntent/webhook settlement timing (see `docs/commerce.md` gotchas)
- Facet filter OR-within-group / AND-across-group semantics (`src/features/search/search-helpers.ts`)
- Currency/channel resolution (`src/features/currency/currency-server.ts`) — never assume USD

Never: hardcode product/variant/collection IDs, prices, stock, currency, discounts, ratings, or reviews. Never fake data that isn't backed by a real Vendure field. Sole client-approved exception: the display-only struck-through reference price via `DiscountedPrice` — the variant's original price (Vendure `customFields.mrp` when the backend adds it, else the client-supplied `src/config/pricing.ts` by SKU) with "N% OFF" when set, else Vendure price × 1.10 (no % claim) (`features/pricing/display-price.ts`); never used in cart/checkout/orders (see `docs/commerce.md` "MRP custom field", `docs/decisions.md` 2026-09-29).

## Millnex marketing layer (2026-09-28)

The storefront presents the Millnex machinery site; details in `docs/ui-system.md` and `docs/decisions.md`.
- Contact details: `src/config/contact.ts` only (filled 2026-09-28 with the millnex.in address, email and phone/WhatsApp; never hardcode a number/email elsewhere).
- Products: **Vendure only** — no frontend product catalogue (the old `site/catalog/machines.ts` was removed; `/machines` redirects to `/shop`). Copy: `src/site/content/*`. Replaceable stock imagery + credits: `src/site/content/media.ts`. Local images live in `public/site/` and `public/products category/products image/`; after moving anything in `public/`, run `npm run test` (`tests/assets/public-images.test.mjs` lists broken references).
- Wishlist: device-local product IDs (`src/features/products/wishlist.ts`); Vendure has no wishlist API.
- Enquiries: `src/features/enquiry` (endpoint via `NEXT_PUBLIC_ENQUIRY_ENDPOINT`, else WhatsApp/email hand-off).
- No fake statistics, testimonials, certifications or ratings — the stats/testimonials/insights sections render only real entries. Don't show visitors notes explaining missing content ("X isn't published yet", "stock images", etc.) — just omit it.
- Industrial redesign (2026-09-29): **light only** — no dark mode/dark sections, logo blue/green/orange as the secondary palette (tints for bands, `logo-blue` for secondary actions), no eyebrow/kicker labels above headings; one site-wide quote modal (`features/enquiry/quote-dialog.tsx`), marketing cards resolve to real catalog data by name (`site/home/catalog-links.ts`) — see `docs/ui-system.md`. Product photos are always `object-contain` on `bg-stage`, never cropped.

## Coding rules

- Keep `src/app/**` thin; substantial logic lives in the owning `src/features/*` module (per `docs/architecture.md`).
- Import a feature only through its top-level module, never its internal `components/`/`routes/`.
- Site modules (`src/site/**`) may compose features; features must not import from `site/`.
- Colocate GraphQL operations and translations with the owning feature.
- Prefer Server Components; add `"use client"` only where interactivity requires it (variant selectors, drawers, carousels, forms).
- Reuse `src/components/ui/*` primitives (large existing shadcn set — see `docs/ui-system.md`) before adding new ones or new dependencies.

## Workflow rule (token efficiency)

For every task: `CLAUDE.md` → relevant doc (`commerce.md` for commerce, `ui-system.md` for UI, `decisions.md` for architectural precedent, `changelog.md` for recent history) → minimum source files → implement → validate → update docs if behavior or convention changed. Do not re-audit the whole repo per task; only re-audit if docs are stale or missing.

## SSR/SEO/performance rules

**Static export, not SSR** — `next.config.ts` sets `output: 'export'` (full static export for S3+CloudFront, no Node/server runtime). There are no Server Actions, no `cookies()`/`headers()` reads, and no middleware anywhere in `src/`; cart/checkout/auth/currency run client-side against Vendure directly. See `docs/architecture.md` (Rendering strategy) and `docs/decisions.md` for the full rationale.

- `product/[slug]/[[...variant]]` and `collection/[slug]` use `generateStaticParams` to enumerate every slug/variant at build time (`features/products/data.ts`, `features/collections/data.ts`) — static export has no on-demand fallback for unknown slugs.
- Product price/stock and collection product grids are baked in from build-time Vendure data for SEO/crawlability, then superseded by a live client-side fetch (`product-price-client.tsx`, `product-info.tsx`, `collection-results.tsx`).
- Preserve route-level `loading.tsx` skeletons and metadata/OpenGraph/structured data on product and collection routes.
- Use `next/image` with `unoptimized: true` (no Image Optimization API under static export) and existing responsive/skeleton patterns.
- No reactive component may call `next/navigation`'s `useSearchParams()` directly — use `features/search/search-params-sync.tsx`'s pattern instead.
- `next/link` prefetch is disabled globally (static-export bug workaround, see `docs/decisions.md`) — don't re-enable per-link without checking that decision first.

## Testing / validation rules

Before declaring a task complete, run (per `AGENTS.md`):
```
npm run check-types
npm run lint
npm run test
npm run build
```
`npm run build` clears the Vendure fetch cache first (the `prebuild` hook can't run: `.npmrc` has `ignore-scripts=true`). Verify static output in `out/` (e.g. product cards and ₹ prices present in `out/en/shop/index.html`).

For commerce-adjacent UI changes, additionally walk the affected flow (add-to-cart, checkout step, filter, search) manually per the regression checklist in the master prompt.

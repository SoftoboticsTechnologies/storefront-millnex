# UI system

Current state of the design system in `apps/storefront`, updated 2026-09-29 for the Millnex industrial redesign. Update this file whenever a reusable UI convention is established — don't let pages invent divergent styles.

## Stack
- Tailwind v4 (CSS-based config, no `tailwind.config.js`). Tokens declared in `src/app/[locale]/globals.css` via `@theme inline` + `:root` (oklch).
- shadcn (`components.json`: style `base-vega`, icons `lucide`), primitives in `src/components/ui/*` (base-ui based: triggers take `render={<button/>}`; `DialogContent` has a base `sm:max-w-md`, so override with `sm:max-w-*`).
- No animation library: CSS keyframes/transitions, CSS scroll-driven animations (progressive), and one IntersectionObserver (`site/ui/reveal-observer.tsx`).

## Direction
Premium industrial-machinery brand with a D2C store: engineering, power, precision, trust. Strong contrast, large display type, product photography as the focus, restrained motion. Engineered, not playful: 10px button corners, hairline dividers, mono spec labels, crop-mark frames.

## Tokens (registered as Tailwind colours)
- **Light only (2026-09-29)** — no dark mode and no dark sections; `color-scheme: light only` on `<html>`. The former graphite "ink" sections are logo-tinted light bands: `bg-tint-sheen` (blue/orange/green wash on `--surface`: home hero, footer, PageHero `tone="tint"`, listing banner) or a flat `bg-tint-blue` / `bg-tint-green` / `bg-tint-orange` (spotlight, trust strip, manufacturing, about approach, split panels, quote-modal side panel, mega-menu help card).
- **Light** — `bg-background` (warm near-white), `bg-surface` (alternate band), `bg-card`.
- **Secondary palette = logo ring** — `logo-blue` (#0070c0) / `logo-green` / `logo-orange`, with text-safe `*-deep` variants and `tint-*` backgrounds. `--secondary` = `tint-blue` / `logo-blue-deep`. Solid secondary actions (Get a Quote, Buy now, active tabs/pagination, compare CTAs) are `bg-logo-blue text-white hover:bg-logo-blue-deep`; `siteButton({variant: 'secondary'})`.
- **Steel** — `text-steel` (spec labels, secondary icons), `bg-steel-soft`.
- **Brand** — `--brand` red-orange from the logo, AA with white (also `--primary`/`--ring`).
- **Status** — `success` (in stock), `warning` (low stock), `stock-out` (neutral dark red for Out of Stock — deliberately not the brand colour).
- `--radius: 0.625rem`. Buttons `rounded-lg`, cards `rounded-xl`, large panels/image frames `rounded-2xl`.
- Fonts (`next/font/google` in `site/locale-layout.tsx`): display **Archivo** (`--font-display`; `font-display-wide` = 112% width, tight tracking, for hero/section headlines), body **Inter** (`--font-sans`), **Geist Mono** (`--font-mono`, spec labels/indices).
- The `.dark` palette is unused (no theme provider mounted, see `docs/decisions.md`).

## Utilities (globals.css)
- `site-container` — max 84rem, 16/24/32px gutters. Use for every section.
- `spec-label` — 11px mono uppercase tracked: indices ("01"), SKUs, counts, kickers.
- `bg-tint-sheen` — soft logo-tint wash for hero/footer bands. (The `bg-blueprint` grid texture was removed site-wide on 2026-09-29 by request — backgrounds are plain colour/tint only.)
- `bg-stage` — light plinth for product photos. **Product photos have white backgrounds and often baked-in text/models: always `object-contain` + `mix-blend-multiply` on a stage, never crop.**
- `frame-ticks` — engineering crop-mark corners (`--tick-color` to tint).
- Motion: `data-reveal` (fade-up on scroll, `--reveal-delay` to stagger); `data-reveal="image"` (clip wipe — the clip is applied to the element's *children*, because a fully clipped observed element never intersects); `.reveal-line` / `.reveal-line-y` connectors; `.animate-hero-rise` / `.animate-hero-image-in` (transform-only, safe for LCP); `.parallax-slow` (scroll-driven); `.dust-mote` (hero particles, `--dust-*` vars); `.animate-drift`; `.animate-pulse-ring`; `.animate-page-enter` (route change, `site/navigation/page-transition.tsx` via `app/[locale]/template.tsx`, skipped on first load). Everything is disabled under reduced motion and never hides content without JS.

## Shared components
- `site/ui/button-styles.ts` — `siteButton` cva (`brand`, `secondary` (logo blue), `outline`, `whatsapp`, `link`; `sm|md|lg|icon`) + `arrowNudge`. Server-safe; for `<a>`/`<Link>`/`QuoteButton`. Features can't import `site/`, so feature code mirrors the classes or uses `components/ui/button`.
- `site/ui/section-heading.tsx` — `SectionHeading` (`title`, `body`, `align`, `as`). **No eyebrow/kicker labels** (the small "—— LABEL" line above headings) anywhere — removed site-wide 2026-09-29 at the client's request; don't reintroduce them.
- `site/ui/page-hero.tsx` — inner-page hero with breadcrumb; `tone="light"` (FAQ/Contact/Insights) or `tone="tint"` (About/Manufacturing; header space included), optional `aside` visual.
- `site/ui/machine-comparison.tsx` — comparison table with a tab per Vendure collection; data from `site/home/comparison-data.ts` (`getComparisonGroups`). Rows = live price, availability, every facet present, variants, SKU. Home section + `/compare`.
- `site/ui/iso-badge.tsx` — "ISO 9001:2015 Certified" pill (`home.ts#CERTIFICATION`, client-confirmed claim): under the footer logo and in the About hero; the homepage trust strip leads with the same item.
- `site/ui/machine-features.tsx` — "Smart Features in Every Millnex Mill": the six Millnex machine features with icons (`home.ts#MACHINE_FEATURES_COPY`); on the homepage after the trust strip and on About after What We Build.
- `site/about/machine-stage.tsx` — product photo on a framed stage.
- **Quote modal** — `features/enquiry/quote-dialog.tsx`: `QuoteProvider` (mounted once in the locale layout with real product options), `QuoteButton` (`product`, `hideIcon`, children) and `useQuote().openQuote({product, message})`. Triggers: header, mobile drawer, mega-menu, home hero/finder/spotlight, product cards (out of stock), PDP, collection band, comparison, About/Manufacturing CTA, footer band. Form: `EnquiryForm` `variant="quote"` adds business type + quantity; `defaultProduct`, `defaultMessage`, `submitLabel`.
- `site/ui/contact-links.ts`, `site/ui/whatsapp-icon.tsx` — as before; contact data only from `config/contact.ts`.

## Navigation (`src/site/navigation/`)
- `navbar.tsx` (server) builds the mega-menu data from Vendure: every top-level collection with up to 5 products (thumb, name, stock) and its count, plus the catalog's largest facet (e.g. "Type", minus values that repeat a collection name) as `/shop?facets=` links.
- `navbar/site-header.tsx` (client): lg+ 32px blue-tint utility bar (tagline, phone, Compare) that slides away on scroll; 64px main bar with logo · Home / Shop / Categories (mega-menu, `navbar/mega-menu.tsx`) / About / Manufacturing / FAQ / Contact (from xl; below xl the right drawer) · Search · Account · Wishlist · Cart · **Get a Quote**. Transparent with light text over the ink heroes of `TRANSPARENT_ROUTES` (home, about, manufacturing, shop, collection, search — first path segment) until 24px of scroll; solid elsewhere. Active page = brand underline.
- `navbar/search-overlay.tsx`: large overlay — recent searches (device-local, `millnex:recent-searches`), popular categories, live Vendure matches (image, name, SKU, price, availability), "see all results". Vendure's search covers name, description, SKU and facet values.
- `navbar/mobile-tab-bar.tsx` (< lg): Home / Shop / Search / Cart / Account with a brand top indicator.
- `footer.tsx`: `bg-tint-sheen`. CTA band (quote + WhatsApp) → brand column → Shop (real collections + Compare) / Company / Customer / Contact → credit bar (copyright, "Promoted and Marketed By", DripFunnel). Social links only for configured profiles.
- `whatsapp-float.tsx`: 52px circle bottom-right (16px above the tab bar below lg, 24px on lg), "Chat with Millnex" slides out on hover. `back-to-top.tsx` is centred 12px above it — keep offsets in sync.

## Homepage (`src/site/home/page.tsx`)
Each section answers one question. Order: `Hero` (full-width banner carousel, `hero-carousel.tsx`: Millnex's own banners from `public/hero` via `media.ts#HERO_SLIDES`, filling an 8:3 frame edge to edge (object-cover, anchored top; export banners at 2048×768), 3s autoplay (pauses only while the tab is hidden), left/right arrows, dots, swipe, each slide links to /shop; a caption band under the banner (headline, copy, buttons from `home.ts#HERO_SLIDE_COPY`, links resolved via `catalog-links.ts`; slide 1 adds Request a Quote) follows the active slide; the H1 is visually hidden because the headline is in the artwork; header is solid on the homepage) → `ShopByCategory` (`site/home/shop-by-category.tsx`: one card per real top-level Vendure collection — same set as the mega-menu — with product count, first 4 products (image, name, stock) and a collection link; header bands cycle tint-blue/orange/green; hidden when there are no categories) → `TrustStrip` (01–05 qualities, no numbers) → Featured Machines (`ProductRail`, Vendure) → `CategoryShowcase` (editorial bento of 4 brief categories; links resolved by `catalog-links.ts`) → `ProductSpotlight` (04, tint-blue; the Vendure product with the most facet values, only its catalog facts) → `MachineFinder` (03, 3-step client selector → live Vendure search per material → quote pre-filled with the answers) → `WhyMillnex` (05, sticky stage + interactive 01–06) → `ManufacturingSection` (06, tint-orange timeline 01–05 + Millnex photos) → comparison (07) → `SplitSection` (08/09 home vs business) → footer CTA band. Copy: `site/content/home.ts`; machine photos: `site/content/media.ts#MACHINE_PHOTOS`.

`catalog-links.ts#resolveCatalogLink` maps a `CatalogMatch` to real data at build: collection-name regex → one facet's matching values → search term → `/shop`. Never hardcode Vendure ids.

## Shop / listings (`src/features/search/`)
`/shop`, `/collection/[slug]`, `/search`: tinted title band (`components/listing-banner.tsx`, breadcrumb, H1, count, product-image tiles; collections add a Get a Quote), `category-tabs.tsx` (All + real collections), then sticky filter sidebar (lg) / drawer (< lg) with Categories (unscoped listings incl. search), every Vendure facet (OR within, AND across — unchanged), Availability; active-filter chips; toolbar (count, range, sort: Featured / Name / Price — no Newest/Availability sort or price filter, see decisions). Refetches run in a transition (grid dims instead of flashing a skeleton); the listing remembers facet values it has seen so a selected value with zero matches stays removable. The build-time default listing is passed to `use()` as an already-fulfilled thenable (`catalog-results.tsx#fulfilled`) so the static HTML contains the real product cards.

## Product card / PDP (`src/features/products/`)
- Product prices: always `features/products/discounted-price.tsx` (`DiscountedPrice`) — display-only reference price (Vendure × 1.10, `features/pricing/display-price.ts`) struck through at 0.68em / 60% opacity of `currentColor` (uses `currentColor`), then the real price at the caller's size; `layout="stacked"` for right-aligned lists; missing/zero price → `fallback`, never ₹0. Cart/checkout/order amounts stay plain `Price`.
- `components/product-card.tsx`: 4:5 framed stage image (zoom on hover), `StockBadge` (top-left), wishlist (top-right), Quick View reveal (lg, `quick-view-button.tsx` — modal with Vendure images/description/facets fetched on open), category, name, SKU, live price; one full-width Add to cart (`QuickAddButton`; disabled "Out of Stock" when Vendure has no stock) — no enquiry or view-details buttons on the card (2026-09-29). `components/stock-badge.tsx` is the one availability pill.
- PDP (`routes/page.tsx`): gallery (`product-image-carousel.tsx` — stage, thumbnails, pointer-following hover zoom, swipe/keys, fullscreen `product-lightbox.tsx`); right column category badge, H1, SKU, price, `StockBadge`, options; out of stock → notice + "Ask about availability" primary, add to cart disabled; wishlist / ask about this product / Get a Quote; trust list (store-backed only). Tabs (all panels `keepMounted` for SEO): Overview (description or "Contact us for specifications"), Specifications (facets, SKU, variants + spec-sheet request), Delivery & Support, Questions. No Applications/Features tabs (no data). "You May Also Like" carousel.
- Wishlist (`wishlist.ts`, `/wishlist`): device-local ids, re-read from Vendure.

## Cart / account / checkout
- Cart page + drawer: stage images, SKU/variant, stepper, line total, remove, "Save to wishlist" (uses the line's product id), summary card (subtotal, discounts, shipping "calculated at checkout", tax, estimated total), sticky on desktop; `CartEmptyState` shared.
- Account: sidebar (lg) / scrolling tabs, "Welcome back" dashboard cards (orders count, wishlist count, addresses, details), `components/order-card.tsx` for recent orders and the orders list.
- Checkout / confirmation / auth: presentation only (`site-container` with header offset, display headings, stage images).

## Company pages (`src/site/`)
About (tinted hero; Who We Are; What We Build = real collections; approach timeline; Why 01–06; `about/company-cta.tsx`), `/manufacturing` (new: tinted hero, 5-step timeline, result band, gallery of Millnex's own photos — no facility photography exists), FAQ (`faq/faq-browser.tsx`, categories Buying/Products/Orders/Support, FAQPage JSON-LD), Insights (topic chips + honest empty state; renders `INSIGHTS` entries when added), Contact (contact cards + "Get My Recommendation" form, `#contact-details` / `#enquiry` anchors), `/compare`, credits, 404. Copy: `site/content/{home,company,faq,insights}.ts`.

## Route structure (`src/app/[locale]/`)
`page.tsx` (home), `template.tsx` (page transition), `shop`, `search`, `collection/[slug]`, `product/[slug]/[[...variant]]`, `compare`, `wishlist`, `cart`, `checkout`, `order-confirmation`, `account/*`, auth routes, `about`, `manufacturing`, `contact`, `faq`, `insights`, `credits`, `machines` (legacy redirect), `not-found`. Every major commerce route pairs with a `loading.tsx`.

## Known gaps / backlog
1. Product data: every product is out of stock; descriptions are empty; no motor/capacity/dimension fields (comparison/spec tabs show only facets, SKU, variants). One product name in Vendure starts with a stray "name\t" (`name-stoneless-flour-mill-light-model-2-in-1`) — fix in Vendure admin.
2. Photography: all Millnex photos are 500px promo tiles (baked-in text/models, white backgrounds). Clean high-resolution cut-outs and real facility/process photography would lift every hero, stage and the zoom/lightbox.
3. Product JSON-LD: none (features can't import `site/seo`); add a `productSchema` wired from a site wrapper.
4. Verified company figures and articles — sections render them as soon as entries exist.
5. Price filter, Newest/Availability sort — need the Elasticsearch plugin / custom sort.

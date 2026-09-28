# UI system

Current state of the design system in `apps/storefront`, updated 2026-09-28 for the Millnex ecommerce redesign. Update this file whenever a reusable UI convention is established — don't let pages invent divergent styles.

## Stack
- Tailwind v4 (CSS-based config, no `tailwind.config.js`). Tokens declared in `src/app/[locale]/globals.css` via `@theme inline` + `:root`/`.dark` (oklch color space).
- shadcn (`components.json`: style `base-vega`, baseColor `slate`, icons `lucide`), primitives in `src/components/ui/*`.
- No animation library: motion is CSS keyframes/transitions plus one IntersectionObserver (`site/ui/reveal-observer.tsx`).

## Brand tokens (Millnex, 2026-09-28)
Declared in `:root` and registered in `@theme inline`, so they work as Tailwind colors (`bg-ink`, `text-brand`, …):
- `--brand` — red-orange from the logo wordmark, darkened for AA contrast with white text (4.7:1). Also `--primary`/`--ring`, so shadcn buttons and commerce pages pick it up.
- `--brand-bright` — decorative accent only (eyebrows/lines on dark, glows). Never for body text on light surfaces.
- `--wheat` — gold accent (application labels).
- `--ink`, `--ink-card`, `--ink-foreground`, `--ink-muted`, `--ink-border` — charcoal tokens. **The site is fully light since 2026-09-28**: hero band, Why Millnex, promo/CTA banners, page heroes and footer all use `bg-surface`/`bg-card` with `text-foreground`/`text-muted-foreground` and `text-brand` accents. Ink remains only as a scrim behind white caption text on photos (`listing-banner`) and in button styles. Don't add new dark sections without a design decision.
- `--surface` — warm off-white alternate section background; `--background` is a warmer near-white.
- `--success` — enquiry success state.
- Radius base `--radius: 0.75rem`; cards use `rounded-2xl`/`rounded-3xl`.
- Fonts: `--font-sans`/`--font-display` = Manrope (via `next/font/google` in `site/locale-layout.tsx`), `--font-mono` = Geist Mono (spec numerals, step indices).
- The `.dark` palette is kept but unused: the brand is light-first and `next-themes`' provider is not mounted (see `docs/decisions.md`).

## Marketing-layer utilities and primitives
- `site-container` (utility) — max-w-80rem page container with 16/24/32px gutters. Use it instead of `container mx-auto px-4` on marketing pages.
- `bg-blueprint` (utility) — engineering grid texture for ink sections.
- Scroll reveal — add `data-reveal` (and optional `style={{'--reveal-delay': '80ms'}}`) to any element; `RevealObserver` (mounted once in the layout) fades it up on scroll. Hidden state never applies without JS (`@media (scripting: none)`) or with reduced motion. `.reveal-line` + `data-reveal` draws a connector line instead.
- Hero motion — `.animate-hero-in` (fade + rise, decorative elements) and `.animate-hero-rise` / `.animate-hero-image-in` (transform-only, for LCP candidates: headline, lead text, hero image). Do not start an above-the-fold headline or image at `opacity: 0`.
- `.animate-drift` (floating hero cards), `.animate-pulse-ring` (WhatsApp button). All motion is disabled under `prefers-reduced-motion`.
- `site/ui/button-styles.ts` — `siteButton` cva (`brand`, `ink`, `outline`, `outline-light`, `whatsapp`, `link`; `sm`/`md`/`lg`/`icon`). Server-safe, meant for `<a>`/`<Link>` CTAs. `components/ui/button` remains the primitive for real `<button>`s in commerce UI.
- `site/ui/section-heading.tsx` — `SectionHeading` (eyebrow + h2/h1 + body, light/dark tone) and `Eyebrow`.
- `site/ui/page-hero.tsx` — light title band with breadcrumb for inner marketing pages; Millnex logo card on the right from md up (decorative, hidden on phones).
- `site/ui/contact-links.ts` — resolves WhatsApp/phone/email CTAs from `config/contact.ts`; unconfigured values fall back to `/contact/#contact-details` so no dead links ship.
- `site/ui/whatsapp-icon.tsx` — lucide ships no brand icons.
- Product photos have white backgrounds; show them on `bg-surface` with `mix-blend-multiply` so the white drops out.

## Existing UI primitives (`src/components/ui/`)
Broad shadcn set already scaffolded: accordion, alert(-dialog), aspect-ratio, avatar, badge, breadcrumb, button(-group), calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, country-select, dialog, direction, drawer, dropdown-menu, empty, field, form, hover-card, input(-group/-otp), item, kbd, label, menubar, native-select, navigation-menu, pagination, password-input, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner (toast), spinner, switch, table, tabs, textarea, toggle(-group), tooltip.

Used by the marketing layer: `sheet` (mobile nav drawer), `accordion` (FAQ), `carousel` (testimonials), `form`/`input`/`textarea` (enquiry form), `skeleton` (route loading states). Note `form`'s `FormControl` clones props onto its child, so wrap a native `<select>` directly — not `NativeSelect`, whose props land on a wrapper div.

## Navigation (`src/site/navigation/`)
Ecommerce header (rebuilt 2026-09-28). `navbar.tsx` (server) resolves labels and the real Vendure category list (`getShopCategories`) and renders `navbar/site-header.tsx` (client): logo · Home / Shop / Categories (dropdown of Vendure collections, only when some exist) / About / Contact · Search (field-style trigger on xl, icon below; opens `search-overlay.tsx` with live Vendure suggestions) · `account-menu.tsx` (real `useAuth` session: My account, Orders, Wishlist, Addresses, Profile, Sign out — or Sign in / Create account / Wishlist) · `CartDrawer` (count badge from ActiveOrder `totalQuantity`). Transparent over ink heroes (`TRANSPARENT_ROUTES` is empty since the light redesign — the header is solid on every route), solid after 16px of scroll and on every commerce route; 64px tall. < lg: right sheet with search, links, categories, account + wishlist links, and `mobile-tab-bar.tsx` (Home / Shop / Search / Cart / Account) fixed at the bottom.

**No WhatsApp or Request-a-Quote in the header** (by requirement). WhatsApp is only the floating button; enquiries live on the PDP, contact page and footer.

Site-wide chrome is hidden on auth routes by `navigation/site-chrome.tsx` (`BARE_ROUTES`; a floating logo links home instead). `footer.tsx` (light `bg-surface`, colour DripFunnel logo `public/logo/dripfunnel-logo.png` in the bottom bar, all contact data from `config/contact.ts`; no language picker or credits link is mounted — `/credits` exists but is unlinked), `back-to-top.tsx` (floating, shown after 600px scroll, stacked above the WhatsApp button — keep their offsets in sync), `whatsapp-float.tsx` (fixed **bottom-right**: 24px/24px on ≥ lg; 18px right and 18px above the mobile tab bar below lg; hover label opens leftward), skip-to-content link in `locale-layout.tsx`.

## Homepage (`src/site/home/page.tsx`)
Product-first store homepage — every product shown is fetched from Vendure at build time; nothing is hardcoded. Order: `ShopHero` (Millnex banner artwork `SITE_MEDIA.heroBanner` = `public/hero/banner.resized.jpg`, full-width and uncropped because its text is part of the image, linking to `/shop`; then the real `<h1>`, copy and CTAs on a light band) → `FeatureStrip` (4-up feature banner, `FEATURES_COPY`) → `CategoryGrid` ("Shop by category", `#categories`; artwork = the collection's own `featuredAsset` (cover) if set in Vendure, else a collage of up to 4 distinct product images from that collection shown whole with `object-contain` (they are portrait promo tiles with captions — never crop them; 2 on phones, 2 max when > 2 categories), else a monogram) → `ApplicationsSection` (`#applications`, use-case cards that open a live `/search?q=` — copy from millnex.in in `site/content/home.ts#APPLICATIONS_COPY`) → product rails (`ProductRail`): Featured (collection slug `featured`/`featured-products` if curated, else the catalog) → New arrivals (`createdAt DESC`) → Best sellers (only if a `best-sellers` collection exists — never inferred) — or `CatalogEmpty` when the channel has no products → `StorySection` ("About us" band, wheat SVG, `STORY_COPY`; also on /about) → `AboutSection` ("Our company / Who we are") → `PromoBanner` (account benefits, no invented discount) → `WhyMillnex` → `CtaSection` (shop CTA). Company story deliberately follows the products.

Copy lives in `site/content/*` (English brand content); UI chrome is translated through next-intl (`Navigation`, `Footer`, `Site`, `SiteMeta`, `Home`, `Enquiry`). The old `/machines` URL is a noindex client redirect to `/shop` (`site/legacy/`); the hardcoded machine catalog was removed.

## Shop / listings (`src/features/search/`)
`/shop` (`routes/shop-page.tsx`) is the main shopping destination: build-time default listing for SEO, then live client fetch (`catalog-results.tsx`, shared with `/search` and `/collection/[slug]`). Filters sidebar (sheet < lg, `facet-filters.tsx`): In stock only (`?inStock=1`), **Categories** (`?category=<slug>`, repeatable → Vendure `collectionSlugs`, any-of; unscoped listings only), and every Vendure facet (OR within a facet, AND across — so e.g. a "Motor Power" facet appears automatically once defined in Vendure). Sort: Featured (default — no sort sent, Vendure's ranking/relevance), Name A–Z/Z–A, Price low→high/high→low. Grid columns via `features/products/product-grid-layout.ts`: 2 phone / 3 tablet / 4 desktop.

Not offered, deliberately: a **price filter** (the Shop API's `SearchInput` has no price range — only the Elasticsearch plugin adds one — and filtering one page client-side would be wrong) and a **Newest sort** on filtered listings (`SearchResultSortParameter` is name/price only; "New arrivals" on the homepage uses the Product list's `createdAt`).

## Product card / PDP (`src/features/products/`)
`components/product-card.tsx`: image (zoom on hover, "View product" hover chip), wishlist heart (top-right), category label, name, description excerpt, live price, stock, `QuickAddButton` (single-variant → adds to ActiveOrder; multi-variant → PDP) and view button. PDP (`routes/page.tsx`): sticky gallery left; right: category, name, price incl. tax, availability, variant options (each variant has its own static URL), quantity, Add to cart, Buy now, Wishlist, "Ask about this product" (`/contact?product=<slug>#enquiry`). Below: description, specifications (Vendure facet values grouped by facet), Shipping & support (only store-backed statements: shipping priced at checkout, secure checkout, order tracking, enquiry), related products.

**Wishlist** (`wishlist.ts`, `components/wishlist-button.tsx`, `/wishlist`): device-local list of Vendure product IDs (see `docs/decisions.md`); the page re-reads every product from Vendure (`GetWishlistProductsQuery`) and prunes IDs that no longer exist.

## Cart presentation (`src/features/cart/`)
`cart-drawer.tsx` (header slide-over mini cart), `/cart` (`routes/cart.tsx`, `components/cart-line.tsx`, `order-totals.tsx`): image, name, unit price, quantity stepper, line total, remove, promotion code, totals, checkout. `active-order.ts#useActiveOrder` de-duplicates concurrent ActiveOrder reads; it never caches or holds a second cart.

## Route structure (`src/app/[locale]/`)
`page.tsx` (home), `faq` (standalone FAQ, `site/faq/page.tsx`), `shop`, `search`, `collection/[slug]`, `product/[slug]/[[...variant]]`, `wishlist`, `cart`, `checkout`, `order-confirmation`, `account/*`, auth routes, `about`, `contact`, `insights`, `credits`, `machines` (legacy redirect), `not-found`. `src/app/sitemap.ts` and `robots.ts` are static metadata routes. Every major route pairs with a `loading.tsx` — preserve this pattern.

## Known gaps / backlog
1. The Millnex channel has no products yet — every product surface renders its empty state until products are added in Vendure admin.
2. Real Millnex facility/application photography (current non-product images are CC0/CC BY stock, listed on `/credits`).
3. Verified company figures (`COMPANY_STATS`) and articles (`site/content/insights.ts`) — sections render them as soon as entries exist.
4. PDP gallery has no zoom/lightbox. Structured spec fields (motor power, capacity) need Vendure facets or custom fields to show as filters/specs.
5. PDP URL is `/product/<slug>` (singular); a `/products/` alias was not added.

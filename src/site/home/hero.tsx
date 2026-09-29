import type {CatalogFacet} from '@/features/products/data';
import {HERO_SLIDE_COPY, HOME_HERO} from '@/site/content/home';
import {HERO_SLIDES} from '@/site/content/media';
import {resolveCatalogLink, type CatalogCategory} from '@/site/home/catalog-links';
import {HeroCarousel, type HeroCaption} from '@/site/home/hero-carousel';

/**
 * Homepage hero: a full-width banner carousel of Millnex's own artwork
 * (public/hero), sitting directly under the fixed header (the top padding
 * reserves the header's 64px, plus the 32px utility bar from lg), with a
 * caption band (headline, line of copy, buttons) for the active banner.
 *
 * Caption buttons that point at catalog data are resolved here, at build
 * time, against the real Vendure collections/facets (catalog-links.ts).
 * The page's one H1 is kept for SEO but visually hidden — each caption's
 * headline is a visible paragraph, and the banners carry theirs in the art.
 */
export function Hero({categories, facets}: {categories: CatalogCategory[]; facets: CatalogFacet[]}) {
    const captions: HeroCaption[] = HERO_SLIDE_COPY.map((copy) => ({
        title: copy.title,
        body: copy.body,
        quote: copy.quote ?? false,
        actions: copy.actions.map((action) => ({
            label: action.label,
            href: action.href ?? (action.match ? resolveCatalogLink(action.match, categories, facets).href : '/shop'),
        })),
    }));

    return (
        <section aria-labelledby="home-hero-title" className="bg-surface pt-16 lg:pt-24">
            <h1 id="home-hero-title" className="sr-only">
                {HOME_HERO.titleLines.join(' ')} {HOME_HERO.body}
            </h1>
            <HeroCarousel slides={HERO_SLIDES} captions={captions} />
        </section>
    );
}

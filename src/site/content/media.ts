export interface CatalogImage {
    src: string;
    alt: string;
    width: number;
    height: number;
}

/**
 * Non-product imagery used across the marketing pages, in one place so it
 * can be swapped without touching components.
 *
 * TEMPORARY ASSETS: Millnex has not published facility or application
 * photography yet, so these are openly licensed stock photos (CC0 / CC BY)
 * sourced via Openverse and optimised into /public/site/.
 * Replace each `src` with real Millnex photography when available (keep the
 * same aspect ratio or update width/height), and drop its `credit` entry —
 * the /credits page lists whatever credits remain here.
 */
export interface SiteImage extends CatalogImage {
    credit?: {
        title: string;
        author: string;
        license: 'CC0 1.0' | 'CC BY 2.0' | 'CC BY 3.0';
        sourceUrl: string;
    };
}

export const SITE_MEDIA = {
    /** Millnex's own banner artwork (headline and "Order now" are part of the image). */
    heroBanner: {
        src: '/site/banner.resized.jpg',
        alt: 'We are manufacturer of high-quality domestic flour mills, commercial flour mills and masala machinery, pulverizers, kandap machines, electric motors, vertical flour mills, table-top flour mills, gravy machines, vegetable cutters and double-stage pulverizers. Order now.',
        width: 1920,
        height: 552,
    },
    // Millnex's own artwork (headline + phone numbers baked in): always shown
    // uncropped. Supplied by Millnex, so no credit entry.
    aboutBanner: {
        src: '/site/Millnex-about.jpg',
        alt: 'Millnex — we are a leading manufacturer of domestic aata chakki',
        width: 1024,
        height: 690,
    },
    grainProcessing: {
        src: '/site/millnex-grain-processing.webp',
        alt: 'Freshly milled whole wheat flour in a steel scoop',
        width: 1600,
        height: 1067,
        credit: {
            title: 'Whole wheat grain flour being scooped',
            author: 'Margaret Hoogstrate',
            license: 'CC BY 3.0',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Whole_wheat_grain_flour_being_scooped.jpg',
        },
    },
    applicationHome: {
        src: '/site/millnex-application-home.webp',
        alt: 'A stack of fresh homemade chapatis',
        width: 900,
        height: 600,
        credit: {
            title: 'Chapati-1',
            author: 'safaritravelplus',
            license: 'CC0 1.0',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chapati-1.jpg',
        },
    },
    applicationRetail: {
        src: '/site/millnex-application-retail.webp',
        alt: 'Open sacks of grains and pulses at a market stall',
        width: 900,
        height: 675,
        credit: {
            title: 'Spice market @ Walled City @ Lahore',
            author: 'Guilhem Vellut from Annecy, France',
            license: 'CC BY 2.0',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Spice_market_@_Walled_City_@_Lahore_(15449651456).jpg',
        },
    },
    applicationCommercial: {
        src: '/site/millnex-application-commercial.webp',
        alt: 'A large stainless steel commercial kitchen',
        width: 900,
        height: 675,
        credit: {
            title: 'Kitchen at CIA Copia',
            author: 'Shrinks99',
            license: 'CC0 1.0',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kitchen_at_CIA_Copia.jpg',
        },
    },
    applicationSpice: {
        src: '/site/millnex-application-spice.webp',
        alt: 'Baskets of ground spices and chillies on display',
        width: 900,
        height: 600,
        credit: {
            title: 'Spice Market, Granada',
            author: 'Sharon Mollerus',
            license: 'CC BY 2.0',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Spice_Market,_Granada_(14468771558).jpg',
        },
    },
} satisfies Record<string, SiteImage>;

/** Millnex's own flour mill product photos (supplied by Millnex, so no credits), shown as the Manufacturing section's 2×2 gallery. */
export const MILL_GALLERY: CatalogImage[] = [
    {src: '/products%20category/products%20image/millnex-flour-mill-1-5hp-2in1-01.webp', alt: 'Millnex 1.5 HP 2-in-1 domestic flour mill', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-flour-mill-2hp-2in1-01.webp', alt: 'Millnex 2 HP 2-in-1 flour mill with its door open, showing the grinding chamber', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-flour-mill-2hp-regular-01.webp', alt: 'Millnex 2 HP regular flour mill', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-flour-mill-standard-01.webp', alt: 'Millnex standard domestic flour mill', width: 500, height: 500},
];

/**
 * Millnex's own machine photographs (supplied by Millnex, white backgrounds;
 * several have baked-in text, food props or models). Always show them whole
 * — `object-contain` on a light stage with `mix-blend-multiply` — never
 * cropped. These are brand imagery, not product records: nothing here is
 * labelled as a specific Vendure product.
 */
export const MACHINE_PHOTOS = {
    pulverizer: {src: '/products%20category/products%20image/millnex-pulverizer-01.webp', alt: 'Millnex stainless-steel pulverizer with feed hopper and collection drum', width: 500, height: 500},
    pulverizerSpices: {src: '/products%20category/products%20image/millnex-pulverizer-02.webp', alt: 'Millnex pulverizer shown with dry chillies and spices', width: 500, height: 500},
    flourMill2in1: {src: '/products%20category/products%20image/millnex-flour-mill-2hp-2in1-01.webp', alt: 'Millnex 2-in-1 domestic flour mill with its door open, showing the grinding chamber', width: 500, height: 500},
    flourMillStandard: {src: '/products%20category/products%20image/millnex-flour-mill-standard-02.webp', alt: 'Millnex standard domestic flour mill with its door open and sieve set', width: 500, height: 615},
    flourMillRegular: {src: '/products%20category/products%20image/millnex-flour-mill-2hp-regular-01.webp', alt: 'Millnex domestic flour mill cabinet', width: 500, height: 500},
    gravy: {src: '/products%20category/products%20image/millnex-gravy-machine-01.webp', alt: 'Millnex stainless-steel gravy machine with its chamber open', width: 500, height: 500},
    vegetableCutter: {src: '/products%20category/products%20image/millnex-vegetable-cutter-01.webp', alt: 'Millnex cutter machine beside fresh vegetables', width: 500, height: 500},
    fafda: {src: '/products%20category/products%20image/millnex-fafda-machine-01.webp', alt: 'Millnex stainless-steel fafda machine', width: 500, height: 500},
} satisfies Record<string, CatalogImage>;

/**
 * Homepage hero carousel — Millnex's own banner artwork (public/hero). Slides
 * fill an 8:3 frame edge to edge: export banners at 2048×768 for an exact fit;
 * a taller one is trimmed from the bottom (`objectPosition`, default "top"). `src` is up to 2048px wide, `mobileSrc`
 * 1024px; both are generated from the PNGs in the same folder by
 * scripts/optimize-hero-images.mjs (run by `npm run build`) — replace a
 * PNG and its WebPs follow. Keep width/height in step with the PNG.
 */
export interface HeroSlide {
    src: string;
    mobileSrc: string;
    alt: string;
    width: number;
    height: number;
    /** CSS object-position inside the 8:3 frame; defaults to "top". */
    objectPosition?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
    {
        src: '/hero/1.webp',
        mobileSrc: '/hero/1-1024.webp',
        alt: 'Millnex Atta Chakki — fully automatic domestic flour mills and a fafda machine, with smart sensor, overload protection and low-temperature grinding',
        width: 2048,
        height: 768,
    },
    {
        src: '/hero/2.webp',
        mobileSrc: '/hero/2-1024.webp',
        alt: 'We are leading manufacturer of domestic aata chakki — Millnex flour mills and a fafda machine',
        width: 2048,
        height: 768,
    },
    {
        src: '/hero/3.webp',
        mobileSrc: '/hero/3-1024.webp',
        alt: 'Millnex grinding machines and cutters — gravy machine, pulverizers and a chilli cutter with spices and vegetables. Shop now',
        width: 2048,
        height: 768,
    },
    {
        src: '/hero/4.webp',
        mobileSrc: '/hero/4-1024.webp',
        alt: 'Millnex Atta Chakki, we are manufacturer — pulverizers, gravy, fafda and grinding machines with grains, spices and vegetables',
        width: 2048,
        height: 768,
    },
];

export const BRAND_LOGO = {
    src: '/site/millnex-logo.webp',
    width: 273,
    height: 160,
} as const;

export const OG_IMAGE = {
    src: '/site/millnex-og.jpg',
    width: 1200,
    height: 630,
} as const;

/**
 * Millnex's own category banners (the category name is printed on the art,
 * so they're shown whole, never cropped). Matched to real Vendure
 * collections by name in "Shop by category" — never by id; a collection
 * with no matching banner keeps the plain tinted header.
 */
export const CATEGORY_BANNERS: Array<{match: RegExp; image: CatalogImage}> = [
    {
        match: /flour|chakki|atta/i,
        image: {src: '/products%20category/category-flour-mill.webp', alt: 'Millnex stoneless flour mills', width: 960, height: 960},
    },
    {
        match: /grind|cutter|pulveri/i,
        image: {src: '/products%20category/category-grinding-cutters.webp', alt: 'Millnex grinding machines and cutters', width: 960, height: 960},
    },
];

export function findCategoryBanner(categoryName: string): CatalogImage | null {
    return CATEGORY_BANNERS.find((banner) => banner.match.test(categoryName))?.image ?? null;
}

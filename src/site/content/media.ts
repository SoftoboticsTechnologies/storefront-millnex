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
 * sourced via Openverse and optimised into /public/assets/millnex/site/.
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
        src: '/hero/banner.resized.jpg',
        alt: 'We are manufacturer of high-quality domestic flour mills, commercial flour mills and masala machinery, pulverizers, kandap machines, electric motors, vertical flour mills, table-top flour mills, gravy machines, vegetable cutters and double-stage pulverizers. Order now.',
        width: 1920,
        height: 552,
    },
    // Millnex's own artwork (headline + phone numbers baked in): always shown
    // uncropped. Supplied by Millnex, so no credit entry.
    aboutBanner: {
        src: '/assets/Millnex-about.jpg',
        alt: 'Millnex — we are a leading manufacturer of domestic aata chakki',
        width: 1024,
        height: 690,
    },
    grainProcessing: {
        src: '/assets/millnex/site/millnex-grain-processing.webp',
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
        src: '/assets/millnex/site/millnex-application-home.webp',
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
        src: '/assets/millnex/site/millnex-application-retail.webp',
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
        src: '/assets/millnex/site/millnex-application-commercial.webp',
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
        src: '/assets/millnex/site/millnex-application-spice.webp',
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
    {src: '/assets/millnex/products/millnex-flour-mill-1-5hp-2in1-01.webp', alt: 'Millnex 1.5 HP 2-in-1 domestic flour mill', width: 500, height: 500},
    {src: '/assets/millnex/products/millnex-flour-mill-2hp-2in1-01.webp', alt: 'Millnex 2 HP 2-in-1 flour mill with its door open, showing the grinding chamber', width: 500, height: 500},
    {src: '/assets/millnex/products/millnex-flour-mill-2hp-regular-01.webp', alt: 'Millnex 2 HP regular flour mill', width: 500, height: 500},
    {src: '/assets/millnex/products/millnex-flour-mill-standard-01.webp', alt: 'Millnex standard domestic flour mill', width: 500, height: 500},
];

export const BRAND_LOGO = {
    src: '/assets/millnex/millnex-logo.webp',
    width: 273,
    height: 160,
} as const;

export const OG_IMAGE = {
    src: '/assets/millnex/millnex-og.jpg',
    width: 1200,
    height: 630,
} as const;

import {DISPLAY_MACHINE_PHOTO, MILL_GALLERY, type CatalogImage} from '@/site/content/media';
import {ABOUT_COPY, CTA_COPY, MANUFACTURING_COPY, WHY_COPY} from '@/site/content/home';

/**
 * Copy for the company pages (/about, /manufacturing). Every statement is
 * restated from `home.ts` (ABOUT_COPY / MANUFACTURING_COPY / WHY_COPY), which
 * in turn restates millnex.in. No figures, certifications, years, customer
 * counts, facility claims or test procedures are added here — Millnex hasn't
 * published any. English-only brand content, like catalog data.
 */

const [materialPillar, fabricationPillar, qualityPillar, lastingPillar] = MANUFACTURING_COPY.pillars;

export const ABOUT_PAGE_COPY = {
    // Hero title/body are UI messages (Site.aboutTitle / Site.aboutBody) so
    // they match the page metadata in every locale.
    who: {
        title: 'Milling solutions built on durability, efficiency and precision.',
        lead: ABOUT_COPY.paragraphs[0],
        paragraphs: ABOUT_COPY.paragraphs.slice(1),
        highlights: ABOUT_COPY.highlights,
        image: ABOUT_COPY.image,
    },
    build: {
        title: 'Machines for every scale of production',
        body: 'From compact domestic flour mills to robust grinding systems — browse each category with its current range.',
    },
    approach: {
        title: 'From raw material to a machine you can rely on',
        body: 'Quality engineering at every stage — the fundamentals that decide how a mill performs over years of use.',
        steps: [
            {title: 'Material Selection', body: materialPillar.body},
            {title: 'Fabrication', body: fabricationPillar.body},
            {title: 'Quality Control', body: qualityPillar.body},
            {title: 'Final Product', body: lastingPillar.body},
        ],
    },
    why: {
        title: 'Why Customers Choose Millnex',
        body: WHY_COPY.body,
        items: WHY_COPY.items,
    },
} as const;

export const COMPANY_CTA_COPY = {
    title: CTA_COPY.title,
    body: 'Browse the full range online, or tell our team what you need to grind and we will help you choose the right model.',
} as const;

/** Product photographs for the Manufacturing gallery — Millnex's own (no credits needed). */
export const MACHINE_GALLERY: CatalogImage[] = [
    ...MILL_GALLERY,
    {src: '/products%20category/products%20image/millnex-pulverizer-01.webp', alt: 'Millnex steel pulverizer', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-gravy-machine-01.webp', alt: 'Millnex gravy machine', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-vegetable-cutter-01.webp', alt: 'Millnex vegetable cutter', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-fafda-machine-01.webp', alt: 'Millnex fafda machine', width: 500, height: 500},
    DISPLAY_MACHINE_PHOTO,
];

export const MANUFACTURING_PAGE_COPY = {
    // Hero title/body: Site.manufacturing* messages (restating MANUFACTURING_COPY).
    heroImage: {src: '/products%20category/products%20image/millnex-pulverizer-02.webp', alt: 'Millnex pulverizer machine', width: 500, height: 500} satisfies CatalogImage,
    process: {
        title: 'Five stages, one standard',
        body: 'Premium-grade materials, modern manufacturing techniques and stringent quality control — applied across the range.',
        // Bodies restate MANUFACTURING_COPY / WHY_COPY / ABOUT_COPY only. Steps
        // 04–05 describe design intent and quality standards, not a test
        // procedure Millnex hasn't published.
        steps: [
            {title: 'Material Selection', body: 'Premium-grade materials are chosen for every model, with stainless-steel blades and bodies on the machines that need them.'},
            {title: 'Fabrication & Assembly', body: 'Modern manufacturing techniques produce robust cabinets, grinding chambers and cutter assemblies.'},
            {title: 'Quality Checks', body: 'Vigilant quality control and safety standards are applied across the range.'},
            {title: 'Performance Testing', body: 'Machines are engineered for smooth, even grinding and consistent output, with published motor ratings and power consumption for every model.'},
            {title: 'Final Inspection', body: 'Stringent quality control carries through to the finished machine — built for long-lasting performance, minimal maintenance and optimal output.'},
        ],
    },
    outcome: {
        title: 'Built for long-lasting performance',
        body: ABOUT_COPY.paragraphs[1],
        items: ABOUT_COPY.highlights,
    },
    gallery: {
        title: 'Machines we build',
        body: 'Millnex’s own product photography — flour mills, pulverizers and food-processing machines.',
    },
} as const;

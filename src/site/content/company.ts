// DISPLAY_MACHINE_PHOTO hidden from the gallery 2026-10-08 (the S.S Body 2-in-1 reads as a pulverizer).
import {DESIGN_PHOTOS, MACHINE_PHOTOS, MILL_GALLERY, type CatalogImage} from '@/site/content/media';
import {ABOUT_COPY, CTA_COPY, MANUFACTURING_COPY, WHY_COPY} from '@/site/content/home';

/**
 * Copy for the company pages (/about, /manufacturing). Every statement is
 * restated from `home.ts` (ABOUT_COPY / MANUFACTURING_COPY / WHY_COPY), which
 * in turn restates millnex.in. No figures, certifications, years, customer
 * counts, facility claims or test procedures are added here — Millnex hasn't
 * published any. English-only brand content, like catalog data.
 *
 * Atta Chakki focus (2026-10-08): pulverizer, gravy, cutter and fafda imagery
 * and multi-machine wording are commented out ("Hidden 2026-10-08").
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
        // Hidden 2026-10-08: title 'Machines for every scale of production', body 'From compact domestic flour mills to robust grinding systems — browse each category with its current range.'
        title: 'The Millnex Atta Chakki range',
        body: 'Fully automatic domestic flour mills for fresh, hygienic atta at home — browse every model with live prices.',
    },
    approach: {
        title: 'From raw material to an Atta Chakki you can rely on',
        body: 'Quality engineering at every stage — the fundamentals that decide how a mill performs over years of use.',
        steps: [
            {title: 'Material Selection', body: materialPillar.body},
            {title: 'Fabrication', body: fabricationPillar.body},
            {title: 'Quality Control', body: qualityPillar.body},
            {title: 'Final Product', body: lastingPillar.body},
        ],
    },
    why: {
        title: WHY_COPY.title,
        body: WHY_COPY.body,
        items: WHY_COPY.items,
    },
} as const;

export const COMPANY_CTA_COPY = {
    title: CTA_COPY.title,
    body: 'Book a free home demo and see the Millnex Atta Chakki in action — or browse every model online.',
} as const;

/** Product photographs for the Manufacturing gallery — Millnex's own (no credits needed). */
export const MACHINE_GALLERY: CatalogImage[] = [
    ...MILL_GALLERY,
    MACHINE_PHOTOS.flourMillStandard,
    // 2026-10-08: the 1.5 HP 2-in-1 in its three door designs (client photos).
    ...DESIGN_PHOTOS,
    /* Hidden 2026-10-08 — unrelated machinery (client wants an Atta Chakki-focused site):
    {src: '/products%20category/products%20image/millnex-pulverizer-01.webp', alt: 'Millnex steel pulverizer', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-gravy-machine-01.webp', alt: 'Millnex gravy machine', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-vegetable-cutter-01.webp', alt: 'Millnex vegetable cutter', width: 500, height: 500},
    {src: '/products%20category/products%20image/millnex-fafda-machine-01.webp', alt: 'Millnex fafda machine', width: 500, height: 500},
    DISPLAY_MACHINE_PHOTO,
    */
];

export const MANUFACTURING_PAGE_COPY = {
    // Hero title/body: Site.manufacturing* messages (restating MANUFACTURING_COPY).
    // Hidden 2026-10-08: heroImage was the pulverizer photo (millnex-pulverizer-02.webp).
    heroImage: MACHINE_PHOTOS.flourMill2in1 satisfies CatalogImage,
    process: {
        title: 'Five stages, one standard',
        body: 'Every Millnex Atta Chakki is manufactured with attention to material quality, motor performance, safety and long-term everyday use.',
        // Bodies restate MANUFACTURING_COPY / WHY_COPY / ABOUT_COPY only. Steps
        // 04–05 describe design intent and quality standards, not a test
        // procedure Millnex hasn't published.
        steps: [
            {title: 'Material Selection', body: 'Premium-grade materials are chosen for every model, with a stainless-steel grinding chamber and blade cutter.'},
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
        // Hidden 2026-10-08: body 'Millnex’s own product photography — flour mills, pulverizers and food-processing machines.'
        title: 'Atta Chakki models we build',
        body: 'Millnex’s own product photography of the Atta Chakki range.',
    },
} as const;

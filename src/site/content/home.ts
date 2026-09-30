import {MACHINE_PHOTOS, MILL_GALLERY, SITE_MEDIA, type CatalogImage} from '@/site/content/media';

/**
 * Marketing copy for the Millnex homepage and company pages.
 *
 * Content rules (see CLAUDE.md "Never fake data"):
 * - Company claims are restated from millnex.in (About / Why Millnex).
 * - Figures are restated from the machine specifications Millnex publishes.
 * - No statistics, customer counts, certifications or awards are stated
 *   unless Millnex publishes them. Sections render only real entries.
 *
 * This copy is English-only brand content, like catalog data; UI chrome
 * (buttons, navigation, form labels) is translated through next-intl messages.
 */

/** "Who we are" — paragraphs are Millnex's own About Us text from millnex.in. */
export const ABOUT_COPY = {
    title: 'Who we are',
    paragraphs: [
        'At Millnex, we are committed to delivering high-performance milling solutions that combine durability, efficiency, and precision. As a leading manufacturer of domestic flour mills, commercial flour mills, masala machinery, and pulverizer machines, we cater to a wide spectrum of customers ranging from households to large-scale industrial operations.',
        'With a strong focus on quality engineering and innovation, Millnex products are designed to meet the evolving needs of modern users. Our machines are built using premium-grade materials and advanced manufacturing techniques to ensure long-lasting performance, minimal maintenance, and optimal output.',
        'We understand that every customer has unique requirements. Whether it is a compact domestic flour mill for everyday home use or a robust commercial system for high-capacity production, Millnex offers reliable and customized solutions that deliver consistent results.',
        'Our mission is to empower our customers with efficient grinding technology that enhances productivity while maintaining superior quality standards. Backed by a dedicated team, stringent quality control, and a customer-first approach, Millnex continues to build trust and set benchmarks in the milling industry.',
    ],
    highlights: [
        'High-quality, durable machinery',
        'Efficient performance with modern technology',
        'Wide range of domestic and commercial solutions',
        'Low-maintenance, energy-efficient designs',
    ],
    image: SITE_MEDIA.aboutBanner,
} as const;

export const WHY_COPY = {
    title: 'Why Businesses Choose Millnex',
    body: 'Dependable machines, honest specifications and a team that helps you choose the right model for your volume.',
    items: [
        {icon: 'ruler', title: 'Precision Engineering', body: 'Multi-blade cutter systems and 2800 RPM motors engineered for smooth, even grinding.'},
        {icon: 'badge', title: 'Quality-Focused Manufacturing', body: 'Premium-grade materials with vigilant quality control and safety standards.'},
        {icon: 'zap', title: 'Efficient Performance', body: 'Energy-efficient designs with published power consumption for every model.'},
        {icon: 'wrench', title: 'Low Maintenance', body: 'Stoneless grinding and durable blade systems designed for minimal upkeep.'},
        {icon: 'headset', title: 'Reliable Product Support', body: 'Customer support and service from a dedicated Millnex team.'},
        {icon: 'scale', title: 'Solutions for Every Scale', body: 'From a 1 HP household mill to a 5 HP pulverizer for commercial volumes.'},
    ],
} as const;

export const MANUFACTURING_COPY = {
    title: 'Built With Engineering Discipline',
    body: 'Performance on the shop floor starts long before a machine reaches it. Millnex machines are made with a focus on the fundamentals that decide how a mill performs over years of use.',
    pillars: [
        {title: 'Material selection', body: 'Premium-grade materials, with stainless-steel blades and bodies on models that need them.'},
        {title: 'Fabrication & assembly', body: 'Modern manufacturing techniques for robust cabinets, chambers and cutter assemblies.'},
        {title: 'Quality checks', body: 'Vigilant quality control and safety standards applied across the range.'},
        {title: 'Built to last', body: 'Designed for long-lasting performance, minimal maintenance and consistent output.'},
    ],
    images: MILL_GALLERY,
    imageCaption: 'Engineered, fabricated and quality-checked.',
} as const;

export const FOOTER_COPY = {
    description: 'Flour mills, pulverizers and food-processing machines built for efficiency and durability.',
    tagline: 'Engineered for performance. Built for business.',
} as const;

export const CTA_COPY = {
    title: 'Ready to Find the Right Machine?',
    body: 'Browse the full range online, add machines to your cart and check out securely — or talk to our team if you need help choosing.',
    image: SITE_MEDIA.grainProcessing,
} as const;

/* ---------- Homepage (2026-09-29 industrial redesign) ----------
 * Every claim below restates millnex.in (About, Why Millnex, product pages)
 * or describes what the store itself does. No figures, certifications or
 * testimonials that Millnex hasn't published. Live numbers (machine and
 * category counts) are read from Vendure at build time, never typed here. */

/**
 * How a marketing card finds real catalog data at build time, in order: a
 * Vendure collection whose name matches `collection`; else shop filters for
 * the main facet's values matching `facetValues`; else a live search for
 * `search`; else /shop. So a card always lands on what the store lists.
 */
export interface CatalogMatch {
    collection?: RegExp;
    facetValues?: RegExp;
    search?: string;
}

export const HOME_HERO = {
    titleLines: ['Powering Better Milling.', 'Built for Performance.'],
    body: 'Domestic flour mills, pulverizers and food-processing machinery engineered for reliable performance, efficiency and everyday use.',
    trust: ['Precision Engineered', 'Built for Durability', 'Domestic & Commercial', 'Reliable Support'],
    image: MACHINE_PHOTOS.pulverizer,
    stageLabel: 'Millnex · Rajkot, Gujarat',
} as const;

/** Numbered trust strip under the hero — qualities, not statistics. */
export const TRUST_STRIP = [
    {icon: 'ruler', title: 'Precision Engineering', body: 'Multi-blade cutter systems for smooth, even grinding.'},
    {icon: 'zap', title: 'Energy Efficient', body: 'Designs with published power consumption per model.'},
    {icon: 'wrench', title: 'Low Maintenance', body: 'Stoneless grinding and durable blade systems.'},
    {icon: 'scale', title: 'Domestic & Commercial', body: 'From household mills to commercial machinery.'},
    {icon: 'headset', title: 'Dedicated Support', body: 'A Millnex team to help you choose and run your machine.'},
] as const;

export const SHOWCASE_COPY: {
    title: string;
    body: string;
    cards: Array<{title: string; body: string; image: CatalogImage; match: CatalogMatch}>;
} = {
    title: 'Machines Built for Every Need',
    body: 'From a compact atta chakki for the family kitchen to grinding systems built for production volumes.',
    cards: [
        {
            title: 'Domestic Flour Mills',
            body: 'Fresh flour, ground your way.',
            image: MACHINE_PHOTOS.flourMill2in1,
            match: {collection: /flour/i, facetValues: /flour/i, search: 'flour mill'},
        },
        {
            title: 'Commercial Milling',
            body: 'Built for higher production volumes.',
            image: MACHINE_PHOTOS.pulverizer,
            match: {facetValues: /pulveri/i, search: 'pulverizer'},
        },
        {
            title: 'Pulverizers & Grinding',
            body: 'Powerful grinding for spices and dry materials.',
            image: MACHINE_PHOTOS.pulverizerSpices,
            match: {collection: /grind/i, facetValues: /pulveri|grind/i, search: 'grinding'},
        },
        {
            title: 'Food Processing',
            body: 'Efficient machines for modern kitchens and food businesses.',
            image: MACHINE_PHOTOS.gravy,
            match: {facetValues: /gravy|vegetable|fafda|cutter/i, search: 'machine'},
        },
    ],
};

/**
 * Food-processing pair shown after the category showcase. Products are
 * matched by name against the live Vendure catalog (never by id), in this
 * order; a match that doesn't exist is simply skipped.
 */
export const FOOD_PREP_COPY = {
    title: 'Food Processing Made Effortless',
    body: 'Machines that take the effort out of everyday food preparation — from slicing vegetables to making papad.',
    matches: [/vegetable\s*cutter/i, /papad/i],
} as const;

export const FEATURED_COPY = {
    title: 'Featured Machines',
    body: 'Explore Millnex machines engineered for everyday reliability and professional performance.',
} as const;

/**
 * "Not sure which machine you need?" guided finder. The recommendation is a
 * live Vendure search for the chosen material's `searchTerm` — the same
 * mapping the FAQ states (grains → flour mills; spices/masala → pulverizer).
 * Usage and volume are not product data in the store, so they are passed on
 * to the quote request instead of pretending to filter by them.
 */
export const FINDER_COPY = {
    title: 'Not Sure Which Machine You Need?',
    body: 'Answer three quick questions and we’ll show the machines in our range that match — then our team can confirm the right model.',
    steps: {
        use: {
            question: 'What do you need it for?',
            options: [
                {value: 'home', label: 'Home use', hint: 'Fresh atta for the family'},
                {value: 'smallBusiness', label: 'Small business', hint: 'Shop, chakki or retail'},
                {value: 'commercial', label: 'Commercial production', hint: 'Higher daily volumes'},
                {value: 'foodBusiness', label: 'Food processing', hint: 'Kitchens & food businesses'},
            ],
        },
        material: {
            question: 'What do you want to process?',
            options: [
                {value: 'grains', label: 'Wheat / Grains', searchTerm: 'flour mill'},
                {value: 'spices', label: 'Spices', searchTerm: 'pulverizer'},
                {value: 'masala', label: 'Masala', searchTerm: 'pulverizer'},
                {value: 'vegetables', label: 'Vegetables', searchTerm: 'vegetable'},
                {value: 'gravy', label: 'Gravy', searchTerm: 'gravy'},
                {value: 'fafda', label: 'Fafda', searchTerm: 'fafda'},
            ],
        },
        volume: {
            question: 'How much will you process?',
            options: [
                {value: 'light', label: 'A few kilos a day', hint: 'Household use'},
                {value: 'regular', label: 'Regular daily batches', hint: 'Shop or large household'},
                {value: 'high', label: 'Continuous production', hint: 'Commercial volumes'},
            ],
        },
    },
    resultNote: 'Capacity and usage aren’t listed for every model online, so send them with a quote request and our team will confirm the right machine and motor.',
} as const;


export const WHY_SECTION = {
    /** Screen-reader heading for the trust strip. */
    label: 'Why Millnex',
    title: 'Why Businesses Choose Millnex',
    body: WHY_COPY.body,
    image: MACHINE_PHOTOS.flourMillStandard,
} as const;

/** Five-step manufacturing journey (homepage). Restates MANUFACTURING_COPY / ABOUT_COPY. */
export const MANUFACTURING_STEPS = {
    title: 'Built With Engineering Discipline',
    body: 'Millnex is a manufacturer, not a reseller — the fundamentals that decide how a mill performs over years of use are built in, step by step.',
    steps: [
        {title: 'Material Selection', body: 'Premium-grade materials, with stainless-steel blades and bodies on the models that need them.'},
        {title: 'Fabrication & Assembly', body: 'Modern manufacturing techniques for robust cabinets, grinding chambers and cutter assemblies.'},
        {title: 'Quality Checks', body: 'Vigilant quality control and safety standards applied across the range.'},
        {title: 'Performance Testing', body: 'Grinding systems built for consistent output and minimal maintenance.'},
        {title: 'Final Inspection', body: 'Stringent quality control before a machine is ready for your home or business.'},
    ],
    images: [MACHINE_PHOTOS.pulverizer, MACHINE_PHOTOS.fafda, MACHINE_PHOTOS.flourMill2in1],
} as const;

export const COMPARE_COPY = {
    title: 'Which Machine Is Right for You?',
    body: 'Side-by-side details for every machine in a category, straight from our catalogue.',
} as const;

export const SPLIT_COPY: Record<'home' | 'business', {
    title: string;
    body: string;
    cta: string;
    image: CatalogImage;
    match: CatalogMatch;
}> = {
    home: {
        title: 'Fresh flour whenever you need it.',
        body: 'Compact stoneless flour mills for daily household grinding — you choose the grain, and you know exactly what goes into your flour.',
        cta: 'Explore Domestic Mills',
        image: MACHINE_PHOTOS.flourMillRegular,
        match: {collection: /flour/i, facetValues: /flour/i, search: 'flour mill'},
    },
    business: {
        title: 'Reliable machinery for higher-volume operations.',
        body: 'Pulverizers, grinding machines and food-processing equipment built for shops, kitchens and commercial production.',
        cta: 'Explore Commercial Machines',
        image: MACHINE_PHOTOS.pulverizer,
        match: {collection: /grind/i, facetValues: /pulveri|grind/i, search: 'pulverizer'},
    },
};

/**
 * Caption band under each hero banner, in HERO_SLIDES order (media.ts).
 * Claims restate millnex.in. Each action links to real catalog data resolved
 * at build time (`match`, see CatalogMatch) or to a fixed site page (`href`);
 * `quote: true` adds a "Request a Quote" button that opens the quote modal.
 */
export interface HeroSlideCopy {
    title: string;
    body: string;
    actions: Array<{label: string; href?: string; match?: CatalogMatch}>;
    quote?: boolean;
}

export const HERO_SLIDE_COPY: HeroSlideCopy[] = [
    {
        title: 'Millnex Atta Chakki',
        body: 'Domestic flour mills, pulverizers and food-processing machinery engineered for reliable performance, efficiency and everyday use.',
        actions: [{label: 'Explore Machines', href: '/shop'}],
        quote: true,
    },
    {
        title: 'Leading Manufacturer of Domestic Aata Chakki',
        body: 'Compact stoneless flour mills for fresh atta at home — built with premium-grade materials for long-lasting performance.',
        actions: [{label: 'Explore Domestic Mills', match: {collection: /flour/i, facetValues: /flour/i, search: 'flour mill'}}],
    },
    {
        title: 'Grinding Machines & Cutters',
        body: 'Pulverizers, gravy machines and cutters for spices, masala and vegetables — for shops, kitchens and commercial production.',
        actions: [{label: 'Shop Grinding Machines', match: {collection: /grind/i, facetValues: /pulveri|grind/i, search: 'grinding'}}],
    },
    {
        title: 'We Are Manufacturer',
        body: 'Millnex builds its own machines — from household flour mills to pulverizers and food-processing equipment.',
        actions: [{label: 'How We Manufacture', href: '/manufacturing'}],
    },
];

/**
 * Machine features — Millnex's own feature list from its product artwork
 * (spelling corrected). Shown on the homepage and the About page
 * (site/ui/machine-features.tsx). `icon` keys map to lucide icons there.
 */
export const MACHINE_FEATURES_COPY = {
    title: 'Smart Features in Every Millnex Mill',
    body: 'Technology built into Millnex machines for safer, cleaner and easier everyday grinding.',
    items: [
        {icon: 'sensor', title: 'Smart Sensor Technology'},
        {icon: 'shield', title: 'Overload Protection'},
        {icon: 'thermometer', title: 'Low Temperature Grinding Technology'},
        {icon: 'chamber', title: 'Stainless Steel Grinding Chamber'},
        {icon: 'motor', title: '100% Copper Winding Power Saver Motor'},
        {icon: 'auto', title: 'Auto Start, Auto Stop, Auto Cleaning'},
    ],
} as const;

/**
 * Quality certification — Millnex's own claim (its logo reads "AN ISO
 * 9001 : 2015"; confirmed by the client 2026-09-29). Shown as a badge on
 * the homepage trust strip, under the footer logo and on the About page.
 */
export const CERTIFICATION = {
    label: 'ISO 9001:2015 Certified',
    body: 'Quality management system certified to ISO 9001:2015.',
} as const;

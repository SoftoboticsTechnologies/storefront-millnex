import {CUSTOMER_OFFERS} from '@/config/catalog-focus';
import {DESIGN_PHOTOS, LIVE_PHOTOS, MACHINE_PHOTOS, MILL_GALLERY, SITE_MEDIA, type CatalogImage} from '@/site/content/media';

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
 *
 * ATTA CHAKKI FOCUS (client direction 2026-10-08): the site now presents
 * Millnex's Atta Chakki as its one primary product. Copy that promoted
 * pulverizers, food-processing or commercial machinery is kept below in
 * comments (marked "Hidden 2026-10-08") or in constants the homepage no
 * longer renders, so it can be restored. Product features restate the
 * Vendure product descriptions; the demo and shipping offers are the
 * client's (values in config/catalog-focus.ts#CUSTOMER_OFFERS).
 */

const FREE_SHIPPING_KM = CUSTOMER_OFFERS.freeShippingKm;

/** "Who we are" — paragraphs are Millnex's own About Us text from millnex.in. */
/* Hidden 2026-10-08 — Millnex's full About text names commercial flour mills,
 * masala machinery and pulverizers; the site is now Atta Chakki-focused.
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
*/

/** "Who we are" — Millnex's About Us text (millnex.in), narrowed to the Atta Chakki (2026-10-08). */
export const ABOUT_COPY = {
    title: 'Who we are',
    paragraphs: [
        'At Millnex, we are committed to delivering high-performance milling solutions that combine durability, efficiency, and precision. As a leading manufacturer of domestic flour mills, the Millnex Atta Chakki brings fresh, hygienic and convenient flour milling into homes.',
        'With a strong focus on quality engineering and innovation, Millnex products are designed to meet the evolving needs of modern users. Our machines are built using premium-grade materials and advanced manufacturing techniques to ensure long-lasting performance, minimal maintenance, and optimal output.',
        'We understand that every family has unique requirements. Whether you grind wheat every day or prefer multi-grain flour, Millnex offers an Atta Chakki model that delivers consistent results at home.',
        'Our mission is to empower our customers with efficient grinding technology while maintaining superior quality standards. Backed by a dedicated team, stringent quality control, and a customer-first approach, Millnex continues to build trust in the milling industry.',
    ],
    highlights: [
        'High-quality, durable Atta Chakki',
        'Efficient performance with modern technology',
        'Fully automatic domestic flour mills',
        'Low-maintenance, energy-efficient designs',
    ],
    image: SITE_MEDIA.aboutBanner,
} as const;

/* Hidden 2026-10-08 — business/commercial positioning; client wants an Atta Chakki-focused site.
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
*/

/** Atta Chakki strengths — restated from the Vendure product descriptions and millnex.in. */
export const WHY_COPY = {
    title: 'Why Families Choose Millnex',
    body: 'Fresh, hygienic flour at home from a machine made by its manufacturer — with a team that stays with you after the sale.',
    items: [
        {icon: 'badge', title: 'Fresh, Hygienic Flour at Home', body: 'Grind your own grain whenever you need it, in a stainless-steel grinding chamber — you know exactly what goes into your atta.'},
        {icon: 'zap', title: '100% Copper Winding Motor', body: 'A power-saver motor with overload protection, on standard household electricity.'},
        {icon: 'ruler', title: 'Fully Automatic & Child-Safe', body: 'Auto start, auto stop and auto cleaning, with a child safety lock on the 1.5 HP model.'},
        {icon: 'scale', title: 'Multi-Grain Grinding', body: 'Wheat, jowar, bajra and gram (besan), with a sieve set for the texture you like.'},
        {icon: 'wrench', title: 'Low Maintenance, Energy Efficient', body: 'Stoneless grinding with low-temperature technology, designed for minimal upkeep and low running cost.'},
        {icon: 'headset', title: 'Manufacturer-Backed Support', body: 'Millnex builds its own machines, and a dedicated Millnex team helps you before and after you buy.'},
    ],
} as const;

export const MANUFACTURING_COPY = {
    title: 'Built With Engineering Discipline',
    // Hidden 2026-10-08: 'Performance on the shop floor starts long before a machine reaches it. Millnex machines are made with a focus on the fundamentals that decide how a mill performs over years of use.'
    body: 'Every Millnex Atta Chakki is manufactured with attention to material quality, motor performance, safety and long-term everyday use.',
    pillars: [
        {title: 'Material selection', body: 'Premium-grade materials, with stainless-steel blades and bodies on models that need them.'},
        {title: 'Fabrication & assembly', body: 'Modern manufacturing techniques for robust cabinets, chambers and cutter assemblies.'},
        {title: 'Quality checks', body: 'Vigilant quality control and safety standards applied across the range.'},
        {title: 'Built to last', body: 'Designed for long-lasting performance, minimal maintenance and consistent output.'},
    ],
    images: MILL_GALLERY,
    imageCaption: 'Engineered, fabricated and quality-checked.',
} as const;

/* Hidden 2026-10-08 — multi-machine positioning.
export const FOOTER_COPY = {
    description: 'Flour mills, pulverizers and food-processing machines built for efficiency and durability.',
    tagline: 'Engineered for performance. Built for business.',
} as const;

export const CTA_COPY = {
    title: 'Ready to Find the Right Machine?',
    body: 'Browse the full range online, add machines to your cart and check out securely — or talk to our team if you need help choosing.',
    image: SITE_MEDIA.grainProcessing,
} as const;
*/

export const FOOTER_COPY = {
    description: 'Millnex Atta Chakki — fully automatic domestic flour mills for fresh, hygienic atta at home.',
    tagline: 'Fresh atta. Made right at home.',
} as const;

export const CTA_COPY = {
    title: 'Ready for Fresh Atta at Home?',
    body: 'Book a free home demo and see the Millnex Atta Chakki in action — or order online and check out securely.',
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

/* Hidden 2026-10-08 — multi-machine hero; client wants the Atta Chakki as the hero product.
export const HOME_HERO = {
    titleLines: ['Powering Better Milling.', 'Built for Performance.'],
    body: 'Domestic flour mills, pulverizers and food-processing machinery engineered for reliable performance, efficiency and everyday use.',
    trust: ['Precision Engineered', 'Built for Durability', 'Domestic & Commercial', 'Reliable Support'],
    image: MACHINE_PHOTOS.pulverizer,
    stageLabel: 'Millnex · Rajkot, Gujarat',
} as const;

export const TRUST_STRIP = [
    {icon: 'ruler', title: 'Precision Engineering', body: 'Multi-blade cutter systems for smooth, even grinding.'},
    {icon: 'zap', title: 'Energy Efficient', body: 'Designs with published power consumption per model.'},
    {icon: 'wrench', title: 'Low Maintenance', body: 'Stoneless grinding and durable blade systems.'},
    {icon: 'scale', title: 'Domestic & Commercial', body: 'From household mills to commercial machinery.'},
    {icon: 'headset', title: 'Dedicated Support', body: 'A Millnex team to help you choose and run your machine.'},
] as const;
*/

export const HOME_HERO = {
    titleLines: ['Fresh Atta. Better Taste.', 'Made Right at Home.'],
    body: 'Millnex Atta Chakki brings fresh, hygienic and convenient flour milling directly to your home.',
    trust: ['Free Home Demo', `Free Shipping up to ${FREE_SHIPPING_KM} KM`, '100% Copper Winding Motor', 'Fully Automatic'],
    image: MACHINE_PHOTOS.flourMill2in1,
    stageLabel: 'Millnex Atta Chakki · Rajkot, Gujarat',
} as const;

/** Numbered trust strip under the hero — the customer offers first, then product qualities. No statistics. */
export const TRUST_STRIP = [
    {icon: 'demo', title: 'Free Home Demo', body: 'We come to your home and show you the machine in action.'},
    {icon: 'truck', title: `Free Shipping up to ${FREE_SHIPPING_KM} KM`, body: `Free delivery for orders within ${FREE_SHIPPING_KM} km.`},
    {icon: 'zap', title: 'Copper Winding Motor', body: '100% copper winding, power-saver motor.'},
    {icon: 'shield', title: 'Safe & Automatic', body: 'Auto start, auto stop and overload protection.'},
    {icon: 'headset', title: 'Dedicated Support', body: 'A Millnex team before and after you buy.'},
] as const;

/** Copy for the CategoryShowcase card grid (cards resolve to real catalog data). */
export interface ShowcaseCopy {
    title: string;
    body: string;
    cards: Array<{title: string; body: string; image: CatalogImage; match: CatalogMatch}>;
}

/* Hidden 2026-10-08 — "Machines Built for Every Need" (commercial, pulverizer and
 * food-processing cards) is no longer rendered; the homepage uses FRESH_FLOUR_COPY.
 * Kept for reactivation. */
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

/** The Atta Chakki collection, matched by name (never by id). */
const ATTA_CHAKKI_MATCH: CatalogMatch = {collection: /flour|chakki|atta/i, facetValues: /flour/i, search: 'atta chakki'};

/**
 * "Designed for Fresh Flour at Home" (replaces SHOWCASE_COPY on the homepage,
 * 2026-10-08). Every card leads to the Atta Chakki collection; claims restate
 * the Vendure product descriptions and Millnex's published features.
 */
export const FRESH_FLOUR_COPY: ShowcaseCopy = {
    title: 'Designed for Fresh Flour at Home',
    body: 'From everyday wheat flour to multi-grain grinding, Millnex Atta Chakki is designed to make fresh flour preparation simple, hygienic and convenient for your family.',
    cards: [
        {
            title: 'Everyday Wheat Atta',
            body: 'Fresh atta for the family, ground at home whenever you need it.',
            image: DESIGN_PHOTOS[0], // was MACHINE_PHOTOS.flourMill2in1 until 2026-10-08
            match: ATTA_CHAKKI_MATCH,
        },
        {
            title: 'Multi-Grain Flour',
            body: 'Wheat, jowar, bajra and gram (besan) — choose your grain and know exactly what goes into your flour.',
            image: LIVE_PHOTOS[0],
            match: ATTA_CHAKKI_MATCH,
        },
        {
            title: 'Fine or Coarse',
            body: 'A sieve (chalni) set lets you choose the texture of your flour.',
            image: MACHINE_PHOTOS.flourMillStandard,
            match: ATTA_CHAKKI_MATCH,
        },
        {
            title: 'Hygienic & Automatic',
            body: 'Stainless-steel grinding chamber with auto start, auto stop and auto cleaning.',
            image: DESIGN_PHOTOS[2], // was MILL_GALLERY[0] until 2026-10-08
            match: ATTA_CHAKKI_MATCH,
        },
    ],
};

/**
 * Hidden 2026-10-08 — no longer rendered on the homepage (client wants an
 * Atta Chakki-focused site). Kept for reactivation.
 *
 * Food-processing pair shown after the category showcase. Products are
 * matched by name against the live Vendure catalog (never by id), in this
 * order; a match that doesn't exist is simply skipped.
 */
export const FOOD_PREP_COPY = {
    title: 'Food Processing Made Effortless',
    body: 'Machines that take the effort out of everyday food preparation — from slicing vegetables to making papad.',
    matches: [/vegetable\s*cutter/i, /papad/i],
} as const;

/**
 * Flagship highlight: Millnex's hero product, matched by name against the
 * live Vendure catalog (never by id). Features restate Millnex's own banner
 * artwork (public/hero/1.png). Price, stock and image always come from Vendure.
 */
export const HERO_PRODUCT_COPY = {
    match: /1\.5\s*hp/i,
    badge: 'Millnex flagship',
    title: 'Millnex 1.5 HP Atta Chakki',
    body: 'Our flagship home flour mill — fully automatic 2-in-1 grinding for fresh, hygienic atta every day.',
    // Restated from the product's Vendure description (KEY FEATURES), 2026-10-08.
    features: [
        '1.5 HP powerful motor',
        'Fully automatic operation',
        '100% copper winding motor',
        '7 sieves / 7 chalni',
        'Child safety lock',
        'Auto start system',
        'Multi-grain grinding',
        'Approx. 8–10 kg/hour capacity',
        '1-year motor warranty',
    ],
    /* Hidden 2026-10-08 — previous feature list (banner artwork):
       'Smart sensor technology', 'Overload protection', 'Low-temperature grinding',
       'Stainless-steel grinding chamber', '100% copper winding, power-saver motor',
       'Auto start, auto stop, auto cleaning' */
    cta: 'View Product',
} as const;

/**
 * Free Home Demo + free shipping section (client direction 2026-10-08).
 * Only the client's stated offer: a free demonstration at home and free
 * shipping within the configured radius. No payment terms are promised —
 * "pay only after you're satisfied" is not a confirmed policy, so the copy
 * says the customer decides after the demo, nothing more.
 */
export const DEMO_COPY = {
    title: 'See the Millnex Atta Chakki at Your Home Before You Buy',
    body: 'Not sure if the Atta Chakki is right for you? No problem. Our team will visit your home and give you a live demonstration of the machine.',
    steps: [
        {title: 'Book a free demo', body: 'Share your name, phone number and area — our team will get in touch to fix a convenient time.'},
        {title: 'We come to your home', body: 'We demonstrate the Atta Chakki and answer all your questions.'},
        {title: 'You decide', body: 'You decide only after you’re satisfied.'},
    ],
    tryTitle: 'Try It at Home Before You Buy',
    tryBody: 'We believe you should see the machine in action before making your decision. Our team will visit your home for a live demonstration. If you’re satisfied with the product and its performance, you can proceed with your order.',
    shippingTitle: `Free Shipping up to ${FREE_SHIPPING_KM} KM`,
    shippingBody: `Enjoy free shipping for orders within ${FREE_SHIPPING_KM} KM.`,
    image: LIVE_PHOTOS[1],
} as const;

/** Real-photo band (home, About, Manufacturing) — images: media.ts#LIVE_PHOTOS. */
export const LIVE_PHOTOS_COPY = {
    title: 'See the Machine Up Close',
    body: 'Real photos of an atta chakki — the finish, grinding chamber and stainless-steel parts you get at home.',
} as const;

/* Hidden 2026-10-08:
export const FEATURED_COPY = {
    title: 'Featured Machines',
    body: 'Explore Millnex machines engineered for everyday reliability and professional performance.',
} as const;
*/
export const FEATURED_COPY = {
    // Was 'Choose Your Millnex Atta Chakki' (renamed 2026-10-08, client request).
    title: 'Featured Products',
    body: 'Every Millnex Atta Chakki model with live prices — book a free home demo before you decide.',
    /**
     * Client direction 2026-10-08: Featured shows only the 1.5 HP, 2 HP and
     * 3 HP models, in this order. Matched by name against the live Vendure
     * catalog (never by id); every product matching a pattern is shown.
     */
    matches: [/\b1\.5\s*hp\b/i, /\b2\s*hp\b/i, /\b3\s*hp\b/i],
} as const;

/**
 * Hidden 2026-10-08 — the multi-machine finder is no longer rendered on the
 * homepage (it recommends pulverizers, gravy and fafda machines). Kept for
 * reactivation.
 *
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
    title: WHY_COPY.title,
    body: WHY_COPY.body,
    image: MACHINE_PHOTOS.flourMillStandard,
} as const;

/** Five-step manufacturing journey (homepage). Restates MANUFACTURING_COPY / ABOUT_COPY. */
export const MANUFACTURING_STEPS = {
    title: 'Built With Engineering Discipline',
    body: 'Every Millnex Atta Chakki is manufactured with attention to material quality, motor performance, safety and long-term everyday use.',
    steps: [
        {title: 'Material Selection', body: 'Premium-grade materials, with a stainless-steel grinding chamber and blade cutter.'},
        {title: 'Fabrication & Assembly', body: 'Modern manufacturing techniques for robust cabinets, grinding chambers and cutter assemblies.'},
        {title: 'Motor & Safety', body: '100% copper winding motors with overload protection and safety features built in.'},
        {title: 'Performance Testing', body: 'Grinding systems built for consistent output and minimal maintenance.'},
        {title: 'Final Inspection', body: 'Stringent quality control before an Atta Chakki is ready for your home.'},
    ],
    // Hidden 2026-10-08 (pulverizer and fafda photos): images: [MACHINE_PHOTOS.pulverizer, MACHINE_PHOTOS.fafda, MACHINE_PHOTOS.flourMill2in1],
    images: [MILL_GALLERY[0], MACHINE_PHOTOS.flourMill2in1, MACHINE_PHOTOS.flourMillStandard],
} as const;

export const COMPARE_COPY = {
    title: 'Which Atta Chakki Is Right for You?',
    body: 'Side-by-side details for every Millnex Atta Chakki model, straight from our catalogue.',
} as const;

/** Hidden 2026-10-08 — the home/business split (SplitSection) is no longer rendered on the homepage. Kept for reactivation. */
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

/** Atta Chakki hero (2026-10-08) — one caption per HERO_SLIDES entry. The quote button opens "Book a Free Demo". */
export const HERO_SLIDE_COPY: HeroSlideCopy[] = [
    {
        title: 'Fully Automatic Domestic Flour Mill',
        body: 'Smart sensor technology, overload protection and low temperature grinding — the Millnex Atta Chakki for fresh, hygienic atta at home.',
        actions: [{label: 'View Atta Chakki', match: ATTA_CHAKKI_MATCH}],
        quote: true,
    },
    {
        title: 'Leading Manufacturer of Domestic Aata Chakki',
        body: 'Compact stoneless flour mills for fresh atta at home — built with premium-grade materials for long-lasting performance.',
        actions: [{label: 'View Atta Chakki', match: ATTA_CHAKKI_MATCH}],
        quote: true,
    },
    {
        title: 'Stainless-Steel Grinding, Designer Doors',
        body: 'Stainless steel grinding chamber, 100% copper winding power saver motor and auto start, auto stop, auto cleaning — in a cabinet that suits your kitchen.',
        actions: [{label: 'View Atta Chakki', match: ATTA_CHAKKI_MATCH}],
        quote: true,
    },
    {
        title: 'See It Before You Buy',
        body: 'Book a free home demo and watch the Millnex Atta Chakki grind fresh atta in your own kitchen.',
        actions: [{label: 'View Atta Chakki', match: ATTA_CHAKKI_MATCH}],
        quote: true,
    },
    {
        title: 'Fresh Atta. Made Right at Home.',
        body: 'Millnex Atta Chakki brings fresh, hygienic and convenient flour milling directly to your home.',
        actions: [{label: 'View Atta Chakki', match: ATTA_CHAKKI_MATCH}],
        quote: true,
    },
];

/* Hidden 2026-10-08 — captions for the previous four multi-machine banners.
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
*/

/**
 * Machine features — Millnex's own feature list from its product artwork
 * (spelling corrected). Shown on the homepage and the About page
 * (site/ui/machine-features.tsx). `icon` keys map to lucide icons there.
 */
export const MACHINE_FEATURES_COPY = {
    title: 'Smart Features in Every Millnex Atta Chakki',
    body: 'Technology built into the Millnex Atta Chakki for safer, cleaner and easier everyday grinding.',
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

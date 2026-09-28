import {MILL_GALLERY, SITE_MEDIA} from '@/site/content/media';

/**
 * Marketing copy for the Millnex homepage and company pages.
 *
 * Content rules (see CLAUDE.md "Never fake data"):
 * - Company claims are restated from millnex.in (About / Why Millnex).
 * - Figures are restated from the machine specifications Millnex publishes.
 * - No statistics, customer counts, certifications or awards are stated
 *   unless Millnex publishes them. Add verified numbers to `COMPANY_STATS`
 *   (currently empty) and the About section will render them.
 *
 * This copy is English-only brand content, like catalog data; UI chrome
 * (buttons, navigation, form labels) is translated through next-intl messages.
 */

export const HERO_COPY = {
    eyebrow: 'Precision engineered • Performance driven',
    titleLines: ['Advanced Milling Solutions', 'Built for Everyday Performance.'],
    body: 'From domestic atta chakki to commercial grinding and food-processing machinery, Millnex delivers dependable machines engineered for efficiency, durability and consistent performance.',
    segments: ['Domestic', 'Commercial', 'Industrial'],
    floatingCards: [
        {title: 'High Performance', detail: 'Motor options from 1 HP to 5 HP'},
        {title: 'Low Maintenance', detail: 'Stoneless grinding design'},
        {title: 'Built for Reliability', detail: 'Heavy-duty steel construction'},
    ],
} as const;

/**
 * Four-up feature strip under the homepage hero. Restated from millnex.in's
 * "Why Choose Millnex?" cards and list — no new figures or claims.
 */
export const FEATURES_COPY = [
    {icon: 'thumbsUp', title: 'Year-round supply', body: 'Quality products, competitive pricing & global suppliers'},
    {icon: 'award', title: 'Rich in experience', body: 'Qualified & dedicated promoters'},
    {icon: 'factory', title: 'Certified facility', body: 'Certified manufacturing facility'},
    {icon: 'headset', title: 'Dedicated support', body: 'Strong customer support and service'},
] as const;

/** "Who we are" — paragraphs are Millnex's own About Us text from millnex.in. */
export const ABOUT_COPY = {
    eyebrow: 'Our company',
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

/**
 * Editorial "About us" band (home + about page): two-tone headline, wheat
 * illustration, story paragraphs. Restates ABOUT_COPY / WHY_COPY claims — no
 * rankings, health claims or figures Millnex hasn't published.
 * `title` lines: plain strings render light, `{accent}` bold brand red,
 * `{strong}` bold in the text colour.
 */
export const STORY_COPY = {
    eyebrow: 'About us',
    title: [
        ['Your ', {accent: 'fresh'}, ' flour,'],
        [{strong: 'ground'}, ' your way,'],
        ['every day.'],
    ],
    image: {src: '/assets/millnex/site/wheat-ear.svg', width: 640, height: 560},
    paragraphs: [
        'Millnex builds milling machines for homes, shops and commercial operations — from compact domestic atta chakkis to robust pulverizers and grinding systems for high-capacity production.',
        'With your own mill you grind the grains you choose, when you need them, and you know exactly what goes into your flour. The same machines handle masala and spices too.',
        'Stoneless grinding and durable blade systems keep upkeep to a minimum, and heavy-duty steel construction is built for everyday use.',
        'Whether the machine is for your kitchen or your business, our team helps you choose the right model for your volume.',
    ],
} as const;

/**
 * Verified company figures (years in business, machines delivered, etc.).
 * Intentionally empty — Millnex hasn't published any. Add real numbers here
 * and they render in the About section with an animated counter.
 */
export const COMPANY_STATS: Array<{value: number; suffix?: string; label: string}> = [];

export const WHY_COPY = {
    eyebrow: 'Why Millnex',
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
    eyebrow: 'Manufacturing',
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

export const PROCESS_COPY = {
    eyebrow: 'How ordering works',
    title: 'From Browsing to Running Machine',
    steps: [
        {title: 'Browse the Range', body: 'Explore every machine online with its details and current price.'},
        {title: 'Choose Your Options', body: 'Pick the model and variant that fits your requirement.'},
        {title: 'Add to Cart', body: 'Review quantities and totals before you check out.'},
        {title: 'Check Out Securely', body: 'Enter delivery details and pay online.'},
        {title: 'Track Your Order', body: 'Follow your order status from your account.'},
        {title: 'After-Sales Support', body: 'Reach our team for support and service once you are running.'},
    ],
} as const;

export const FAQ_COPY = {
    eyebrow: 'FAQ',
    title: 'Questions, Answered',
    body: 'Can’t find what you’re looking for? Our team will help you choose the right machine.',
} as const;

export const FOOTER_COPY = {
    description: 'Millnex manufactures domestic flour mills, pulverizers, masala machinery and food-processing machines engineered for efficiency, durability and consistent performance.',
    tagline: 'Engineered for performance. Built for business.',
} as const;

export const CTA_COPY = {
    title: 'Ready to Find the Right Machine?',
    body: 'Browse the full range online, add machines to your cart and check out securely — or talk to our team if you need help choosing.',
    image: SITE_MEDIA.grainProcessing,
} as const;

export const CONTACT_COPY = {
    eyebrow: 'Contact',
    title: 'Talk to the Millnex Team',
    body: 'Questions about a product, an order or delivery? Send us a message and our team will get back to you.',
} as const;

/**
 * Where Millnex machines are used — restated from millnex.in ("from
 * households to large-scale industrial operations"; domestic and commercial
 * flour mills, masala machinery, pulverizers, gravy/vegetable-cutting/fafda
 * machines). Each card opens a live Vendure search for `searchTerm`, so the
 * products shown are whatever the store currently lists — nothing here is a
 * product entry.
 */
export const APPLICATIONS_COPY = {
    eyebrow: 'Industrial applications',
    title: 'Machines for every scale of production',
    body: 'From a compact flour mill for everyday home use to robust systems for high-capacity production — find the right machine for the job.',
    items: [
        {
            icon: 'home',
            title: 'Home kitchens',
            body: 'Compact domestic flour mills for fresh atta at home, every day.',
            searchTerm: 'flour mill',
        },
        {
            icon: 'factory',
            title: 'Commercial milling',
            body: 'Robust commercial systems built for high-capacity production.',
            searchTerm: 'commercial',
        },
        {
            icon: 'wheat',
            title: 'Spices & pulverizing',
            body: 'Masala machinery and pulverizers for grinding spices and dry materials.',
            searchTerm: 'pulverizer',
        },
        {
            icon: 'cooking',
            title: 'Food preparation',
            body: 'Gravy, vegetable-cutting and fafda machines for kitchens and food businesses.',
            searchTerm: 'gravy',
        },
    ],
} as const;

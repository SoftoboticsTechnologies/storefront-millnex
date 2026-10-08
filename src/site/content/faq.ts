import {CUSTOMER_OFFERS} from '@/config/catalog-focus';

/**
 * Atta Chakki focus (2026-10-08): questions about pulverizers, spices and
 * commercial machinery are commented out ("Hidden 2026-10-08"); demo and
 * delivery answers state the client's offer (config/catalog-focus.ts).
 *
 * FAQ answers use only what millnex.in publishes (machine specs, About page
 * claims) and what the store itself does (cart, secure online checkout,
 * order tracking, enquiry/quote requests). Anything Millnex hasn't
 * published — delivery coverage, warranty terms, service turnaround — uses
 * `UNVERIFIED_ANSWER` until confirmed. These entries also feed the FAQPage
 * JSON-LD on the /faq page.
 */
export const UNVERIFIED_ANSWER = 'Please contact our team for current availability and details.';

const FREE_SHIPPING_KM = CUSTOMER_OFFERS.freeShippingKm;

export const FAQ_CATEGORIES = [
    {id: 'buying', label: 'Buying'},
    {id: 'products', label: 'Products'},
    {id: 'orders', label: 'Orders'},
    {id: 'support', label: 'Support'},
] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORIES)[number]['id'];

export interface FaqItem {
    question: string;
    answer: string;
    category: FaqCategoryId;
}

export const FAQ_ITEMS: FaqItem[] = [
    {
        category: 'buying',
        question: 'Which flour mill is suitable for home use?',
        answer: 'For household grinding, the 1 HP Standard Model (8–10 kg capacity) and the 1.5 HP Box Model (2 in 1) are compact stoneless mills designed for daily home use. Larger households that grind more often can consider the 2 HP models with a 10–12 kg capacity.',
    },
    {
        category: 'buying',
        question: 'Can I see the Atta Chakki before I buy?',
        answer: 'Yes. Book a free home demo and our team will visit your home, demonstrate the Atta Chakki and answer all your questions. You decide only after you are satisfied.',
    },
    {
        category: 'buying',
        question: 'Which Atta Chakki is right for my family?',
        answer: 'Tell us which grains you use and roughly how much flour your family needs. Our team will recommend the right model — book a free home demo, send an enquiry or message us on WhatsApp.',
    },
    /* Hidden 2026-10-08 — multi-machine / commercial questions:
    {
        category: 'buying',
        question: 'Which machine is suitable for my requirements?',
        answer: 'Tell us what you want to grind, roughly how much you process each day and whether the machine is for home or business use. Our team will recommend the right model and motor for your requirement — send an enquiry, request a quote or message us on WhatsApp.',
    },
    {
        category: 'products',
        question: 'What is the difference between domestic and commercial mills?',
        answer: 'Domestic models are compact machines for everyday home use, while commercial machines are built for higher volumes and continuous operation. In the Millnex range, the 2 HP Model (2 in 1) suits domestic and semi-commercial use, and the Steel Pulverizer (2, 3 or 5 HP) is designed for commercial applications such as flour mills, spice processing and grain grinding.',
    },
    {
        category: 'products',
        question: 'Which machine is suitable for spices?',
        answer: 'The Steel Pulverizer is rated for chilli, turmeric and coriander alongside grains, with 2, 3 and 5 HP options. For home use, the 1.5 HP Box Model (2 in 1) also lists chilli and turmeric among its grinding materials.',
    },
    */
    {
        category: 'products',
        question: 'Which grains can I grind?',
        answer: 'The Millnex 1.5 HP Atta Chakki is suitable for wheat, jowar, bajra and gram (besan), as well as turmeric, chilli and other dry spices. Its 7-sieve (7 chalni) set lets you choose how fine your flour is.',
    },
    {
        category: 'products',
        question: 'How much electricity does the Atta Chakki use?',
        answer: 'The Millnex 1.5 HP Atta Chakki runs on standard single-phase household electricity and uses approximately 1 unit of electricity for 10 kg of grinding, with a capacity of approximately 8–10 kg per hour.',
    },
    {
        category: 'products',
        question: 'Is the Atta Chakki safe to use at home?',
        answer: 'The Millnex 1.5 HP Atta Chakki has a child safety lock and an auto start system, and Millnex mills feature overload protection and a 100% copper winding motor.',
    },
    {
        category: 'orders',
        question: 'How do I place an order?',
        answer: 'Add the machine you want to your cart and complete the secure online checkout — you can then follow the order status from your account. If a machine is out of stock, or you would like help choosing first, send an enquiry or request a quote and our team will get back to you.',
    },
    {
        category: 'orders',
        question: 'What information is required to book a demo or get a quote?',
        // Hidden 2026-10-08: 'Tell us the machine you are interested in (or what you need to grind), your approximate daily quantity, whether you need it for home or business use, and your delivery location. That is enough for our team to recommend a model and prepare a quote.'
        answer: 'Your name, phone number and area are enough to book a free home demo. For a quote, tell us the Atta Chakki model you are interested in and your delivery location.',
    },
    {
        category: 'orders',
        question: 'Do you provide delivery?',
        answer: `Yes — shipping is free for orders within ${FREE_SHIPPING_KM} km. Delivery options for your address are shown at checkout before you pay; for locations further away, please contact our team.`,
    },
    {
        category: 'support',
        question: 'Do you provide technical support?',
        answer: 'Yes — Millnex provides customer support and service, and our team can guide you on choosing the right model and motor for your requirement. Please contact us for support specific to your machine.',
    },
    {
        category: 'support',
        question: 'Do you provide after-sales support?',
        answer: UNVERIFIED_ANSWER,
    },
];

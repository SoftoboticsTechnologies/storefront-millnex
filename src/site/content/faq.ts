/**
 * FAQ answers use only what millnex.in publishes (machine specs, About page
 * claims). Anything Millnex hasn't published — delivery coverage, warranty
 * terms, service turnaround — uses `UNVERIFIED_ANSWER` until confirmed.
 * These entries also feed the FAQPage JSON-LD on the /faq page.
 */
export const UNVERIFIED_ANSWER = 'Please contact our team for current availability and details.';

export const FAQ_ITEMS: Array<{question: string; answer: string}> = [
    {
        question: 'Which flour mill is suitable for home use?',
        answer: 'For household grinding, the 1 HP Standard Model (8–10 kg capacity) and the 1.5 HP Box Model (2 in 1) are compact stoneless mills designed for daily home use. Larger households that grind more often can consider the 2 HP models with a 10–12 kg capacity.',
    },
    {
        question: 'What is the difference between domestic and commercial flour mills?',
        answer: 'Domestic models are compact machines for everyday home use, while commercial machines are built for higher volumes and continuous operation. In the Millnex range, the 2 HP Model (2 in 1) suits domestic and semi-commercial use, and the Steel Pulverizer (2, 3 or 5 HP) is designed for commercial applications such as flour mills, spice processing and grain grinding.',
    },
    {
        question: 'Which machine is suitable for spices?',
        answer: 'The Steel Pulverizer is rated for chilli, turmeric and coriander alongside grains, with 2, 3 and 5 HP options. For home use, the 1.5 HP Box Model (2 in 1) also lists chilli and turmeric among its grinding materials.',
    },
    {
        question: 'What information is required for a quotation?',
        answer: 'Tell us the machine you are interested in (or what you need to grind), your approximate daily quantity, whether you need it for home or business use, and your delivery location. That is enough for our team to recommend a model and prepare a quote.',
    },
    {
        question: 'Do you provide technical support?',
        answer: 'Yes — Millnex provides customer support and service, and our team can guide you on choosing the right model and motor for your requirement. Please contact us for support specific to your machine.',
    },
    {
        question: 'Do you provide delivery?',
        answer: UNVERIFIED_ANSWER,
    },
    {
        question: 'Do you provide after-sales support?',
        answer: UNVERIFIED_ANSWER,
    },
];

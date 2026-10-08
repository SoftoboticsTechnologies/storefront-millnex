/**
 * Insights / articles. Millnex has no published articles yet, so the
 * Insights page renders an empty state. Add entries here (newest first) to
 * populate it — keep them factual and specific to Millnex machines. Never
 * add placeholder or sample articles.
 *
 * Atta Chakki focus (2026-10-08): topics are Atta Chakki only. Suggested
 * first articles (write real ones before adding): how to choose the right
 * Atta Chakki, benefits of freshly ground atta, electricity use, maintenance,
 * multi-grain flour at home, child safety features.
 */
export const INSIGHT_TOPICS = [
    'Buying Guides',
    'Fresh Atta at Home',
    'Machine Maintenance',
    'Energy & Running Cost',
    'Safety',
    // Hidden 2026-10-08 (Atta Chakki focus): 'Flour Milling', 'Spice Grinding', 'Food Processing', 'Business & Commercial Milling',
] as const;

export type InsightTopic = (typeof INSIGHT_TOPICS)[number];

export interface InsightArticle {
    slug: string;
    title: string;
    excerpt: string;
    /** ISO date, e.g. "2026-10-01". */
    publishedAt: string;
    topic: InsightTopic;
    /** Optional article URL (e.g. an external post) — cards link only when set. */
    href?: string;
}

export const INSIGHTS_COPY = {
    title: 'Millnex Insights',
    // Hidden 2026-10-08: 'Guides, buying advice and practical knowledge for milling and food-processing.'
    body: 'Guides and buying advice for fresh, homemade atta with the Millnex Atta Chakki.',
    topicsTitle: 'Topics',
    emptyTitle: 'Practical guides are coming soon.',
    emptyBody: 'We are preparing practical guides on choosing, running and maintaining your Atta Chakki. In the meantime, our team is happy to answer your questions directly.',
} as const;

export const INSIGHTS: InsightArticle[] = [];

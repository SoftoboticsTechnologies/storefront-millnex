/**
 * Insights / articles. Millnex has no published articles yet, so the
 * Insights page renders an empty state. Add entries here (newest first) to
 * populate it — keep them factual and specific to Millnex machines. Never
 * add placeholder or sample articles.
 */
export const INSIGHT_TOPICS = [
    'Buying Guides',
    'Machine Maintenance',
    'Flour Milling',
    'Spice Grinding',
    'Food Processing',
    'Business & Commercial Milling',
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
    body: 'Guides, buying advice and practical knowledge for milling and food-processing.',
    topicsTitle: 'Topics',
    emptyTitle: 'Practical guides are coming soon.',
    emptyBody: 'We are preparing practical guides on choosing, running and maintaining flour mills and grinding machines. In the meantime, our team is happy to answer your questions directly.',
} as const;

export const INSIGHTS: InsightArticle[] = [];

/**
 * Insights / articles. Millnex has no published articles yet, so the
 * Insights page renders an empty state. Add entries here (newest first) to
 * populate it — keep them factual and specific to Millnex machines.
 */
export interface InsightArticle {
    slug: string;
    title: string;
    excerpt: string;
    /** ISO date, e.g. "2026-10-01". */
    publishedAt: string;
    topic: string;
}

export const INSIGHTS_COPY = {
    eyebrow: 'Insights',
    title: 'Guides for Better Milling',
    body: 'Buying guides, maintenance tips and application notes from the Millnex team.',
    emptyTitle: 'Articles are on the way',
    emptyBody: 'We are preparing practical guides on choosing, running and maintaining flour mills and grinding machines. In the meantime, our team is happy to answer your questions directly.',
} as const;

export const INSIGHTS: InsightArticle[] = [];

/**
 * Placeholder route param for dynamic routes whose catalog-backed
 * `generateStaticParams()` can legitimately come back empty (e.g. a channel
 * with no products or collections yet).
 *
 * Under `output: 'export'`, Next.js fails the whole build when a dynamic
 * route generates zero pages. Returning this sentinel instead keeps the build
 * green; the route's page must call `notFound()` when it receives it, so the
 * only thing exported for it is a 404 page no link ever points at.
 */
export const EMPTY_STATIC_PARAM = '__empty__';

export function withEmptyCatalogFallback<T extends Record<string, unknown>>(params: T[], fallback: T): T[] {
    return params.length > 0 ? params : [fallback];
}

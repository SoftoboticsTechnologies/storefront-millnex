import {query} from '@/platform/vendure/api';
import {ResultOf} from '@/platform/vendure/graphql';
import {GetTopCollectionsQuery} from './graphql';
import {hasCatalogFocus, isFocusCollection} from '@/config/catalog-focus';

// Page size used while enumerating the full catalog at build time.
const COLLECTION_PAGE_SIZE = 100;

type TopCollection = ResultOf<typeof GetTopCollectionsQuery>['collections']['items'][number];

/**
 * Every top-level (and child) collection in the catalog, used to prerender
 * collection pages at build time. Static export has no on-demand fallback for
 * a slug that wasn't prerendered, so this must enumerate the full catalog
 * (paginated) rather than relying on a single unpaginated request.
 */
// Build-time memo: the collection tree is read by the navbar, footer, home,
// shop and collection pages for every prerendered page. Static export has no
// per-request lifecycle (and no Data Cache), so share one fetch per locale
// for the life of the build process instead of refetching per page.
const topCollectionsByLocale = new Map<string, Promise<TopCollection[]>>();

export function getTopCollections(locale: string): Promise<TopCollection[]> {
    if (process.env.NODE_ENV !== 'production') return fetchTopCollections(locale);
    let pending = topCollectionsByLocale.get(locale);
    if (!pending) {
        pending = fetchTopCollections(locale);
        pending.catch(() => topCollectionsByLocale.delete(locale));
        topCollectionsByLocale.set(locale, pending);
    }
    return pending;
}

async function fetchTopCollections(locale: string): Promise<TopCollection[]> {
    const items: TopCollection[] = [];
    let skip = 0;

    for (;;) {
        const result = await query(GetTopCollectionsQuery, {
            take: COLLECTION_PAGE_SIZE,
            skip,
        }, {languageCode: locale});

        const page = result.data.collections.items;
        items.push(...page);

        if (page.length < COLLECTION_PAGE_SIZE || items.length >= result.data.collections.totalItems) {
            break;
        }
        skip += COLLECTION_PAGE_SIZE;
    }

    return items;
}

type CategoryAsset = NonNullable<TopCollection['featuredAsset']>;

export type ShopCategory = Pick<TopCollection, 'id' | 'name' | 'slug' | 'description' | 'featuredAsset' | 'children'> & {
    /** Distinct product images (one per product) from inside the collection, in Vendure order. */
    productImages: Array<CategoryAsset & {alt: string}>;
};

const MAX_CATEGORY_PRODUCT_IMAGES = 4;

/**
 * Top-level shop categories: every collection that isn't itself a child of
 * another collection. GetTopCollectionsQuery returns the whole collection
 * tree flattened (root children *and* their children), so this derives the
 * roots from the data instead of assuming a root collection id.
 *
 * Only the catalog focus categories are returned while a focus is set
 * (config/catalog-focus.ts): every other collection stays in Vendure and its
 * page is still prerendered (getTopCollections), but isn't offered to
 * visitors in navigation, tabs, footer, compare or the homepage. If none of
 * the focus slugs exist in the store, every category is returned. Pass
 * `{all: true}` for every category regardless of the focus (`/shop`).
 */
export async function getShopCategories(locale: string, {all = false}: {all?: boolean} = {}): Promise<ShopCategory[]> {
    const collections = await getTopCollections(locale);
    const childIds = new Set(collections.flatMap((collection) => collection.children?.map((child) => child.id) ?? []));
    const roots = collections.filter((collection) => !childIds.has(collection.id));
    const focused = roots.filter((collection) => isFocusCollection(collection.slug));
    return (!all && hasCatalogFocus() && focused.length > 0 ? focused : roots)
        .map(({productVariants, ...collection}) => {
            const productImages: ShopCategory['productImages'] = [];
            const seen = new Set<string>();
            for (const {product} of productVariants.items) {
                if (seen.has(product.id) || !product.featuredAsset) continue;
                seen.add(product.id);
                productImages.push({...product.featuredAsset, alt: product.name.trim()});
                if (productImages.length === MAX_CATEGORY_PRODUCT_IMAGES) break;
            }
            return {
                ...collection,
                // Vendure collections often have no image of their own; fall back
                // to a real product image from inside the collection.
                featuredAsset: collection.featuredAsset ?? productImages[0] ?? null,
                productImages,
            };
        });
}

/** Collection id → name for every collection, used to label product cards. */
export async function getCollectionNames(locale: string): Promise<Record<string, string>> {
    const collections = await getTopCollections(locale);
    const names: Record<string, string> = {};
    for (const collection of collections) {
        names[collection.id] = collection.name.trim();
        for (const child of collection.children ?? []) {
            names[child.id] = child.name.trim();
        }
    }
    return names;
}

import {getShopCategories} from '@/features/collections/data';
import {getCatalogListing, getProductSpecSheets, type ProductSpecSheet} from '@/features/products/data';

export interface ComparisonGroup {
    name: string;
    slug: string;
    products: ProductSpecSheet[];
}

const MAX_COMPARED = 8;

/**
 * One comparison group per Vendure collection, each with the real detail of
 * its products (build time). Collections with fewer than two products are
 * skipped — there is nothing to compare.
 */
export async function getComparisonGroups(locale: string): Promise<ComparisonGroup[]> {
    const categories = await getShopCategories(locale);
    const groups = await Promise.all(categories.map(async (category) => {
        const listing = await getCatalogListing(locale, {take: MAX_COMPARED, collectionSlug: category.slug});
        const products = await getProductSpecSheets(locale, listing.products.map((product) => product.slug).filter(Boolean));
        return {name: category.name.trim(), slug: category.slug, products};
    }));
    return groups.filter((group) => group.products.length >= 2);
}

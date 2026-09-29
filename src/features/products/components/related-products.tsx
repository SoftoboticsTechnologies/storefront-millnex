import {getRouteLocale} from "@/platform/i18n/server";
import {getTranslations} from 'next-intl/server';
import {getCatalogListing} from '@/features/products/data';
import {getCollectionNames} from '@/features/collections/data';
import {ProductRail} from '@/features/products/featured-products';

interface RelatedProductsProps {
    collectionSlug: string;
    currentProductId: string;
}

/**
 * Other products from the same (most specific) collection, fetched from
 * Vendure at build time. Renders nothing when the collection has no other
 * products — never a padded or hardcoded list.
 */
export async function RelatedProducts({collectionSlug, currentProductId}: RelatedProductsProps) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Product'});
    const [listing, collectionNames] = await Promise.all([
        getCatalogListing(locale, {take: 13, collectionSlug}),
        getCollectionNames(locale),
    ]);
    const products = listing.products
        .filter((product) => product.productId !== currentProductId)
        .slice(0, 12);

    return (
        <ProductRail
            title={t('youMayAlsoLike')}
            products={products}
            collectionNames={collectionNames}
            layout="carousel"
            viewAll={{href: `/collection/${collectionSlug}`, label: t('viewAllProducts')}}
            className="border-t border-border bg-surface py-16 sm:py-20 lg:py-24"
        />
    );
}

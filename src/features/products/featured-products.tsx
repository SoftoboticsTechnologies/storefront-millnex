import {ArrowRight} from 'lucide-react';
import {Link} from '@/platform/i18n/navigation';
import {ProductCard} from '@/features/products/components/product-card';
import {ProductCarousel} from '@/features/products/components/product-carousel';
import {PRODUCT_RAIL_GRID_CLASS} from '@/features/products/product-grid-layout';
import type {ProductCardData} from '@/features/products/product-card-data';

interface ProductRailProps {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    products: ProductCardData[];
    collectionNames?: Record<string, string>;
    viewAll?: {href: string; label: string};
    /** `grid` (default) for homepage merchandising; `carousel` for long, secondary lists. */
    layout?: 'grid' | 'carousel';
    preloadFirstProduct?: boolean;
    className?: string;
}

/**
 * A titled row of real Vendure products (homepage rails, related products).
 * Renders nothing when `products` is empty, so a section never shows empty
 * or placeholder cards — the caller decides whether to show an empty state.
 */
export function ProductRail({
    id,
    eyebrow,
    title,
    description,
    products,
    collectionNames,
    viewAll,
    layout = 'grid',
    preloadFirstProduct,
    className,
}: ProductRailProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section id={id} className={className ?? 'py-12 sm:py-16'}>
            <div className="site-container">
                <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
                    <div className="min-w-0">
                        {eyebrow && (
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
                        )}
                        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
                        {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>}
                    </div>
                    {viewAll && (
                        <Link
                            href={viewAll.href}
                            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand underline-offset-4 hover:underline"
                        >
                            {viewAll.label}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    )}
                </div>

                {layout === 'carousel' ? (
                    <ProductCarousel products={products} collectionNames={collectionNames} preloadFirstProduct={preloadFirstProduct} />
                ) : (
                    <ul className={PRODUCT_RAIL_GRID_CLASS}>
                        {products.map((product, index) => (
                            <li key={product.productId}>
                                <ProductCard
                                    product={product}
                                    category={product.collectionIds.map((collectionId) => collectionNames?.[collectionId]).find(Boolean)}
                                    preload={preloadFirstProduct && index === 0}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

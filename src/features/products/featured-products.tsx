import {ArrowRight} from 'lucide-react';
import {Link} from '@/platform/i18n/navigation';
import {ProductCard} from '@/features/products/components/product-card';
import {ProductCarousel} from '@/features/products/components/product-carousel';
import {PRODUCT_RAIL_GRID_CLASS} from '@/features/products/product-grid-layout';
import type {ProductCardData} from '@/features/products/product-card-data';

interface ProductRailProps {
    id?: string;
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
                {/* Same heading pattern as site/ui/section-heading.tsx
                    (features can't import site/): a wide display h2. */}
                <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between md:gap-8">
                    <div data-reveal className="flex min-w-0 max-w-3xl flex-col gap-5">
                        <h2 className="font-display-wide text-[2rem] font-bold leading-[1.02] text-foreground sm:text-[2.5rem] lg:text-[3.25rem]">{title}</h2>
                        {description && <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
                    </div>
                    {viewAll && (
                        <Link
                            href={viewAll.href}
                            className="group/btn inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-lg border border-foreground/15 bg-card px-5 text-sm font-semibold text-foreground transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground/35 hover:shadow-[0_10px_24px_-18px_rgb(0_0_0/0.4)] focus-visible:ring-3 focus-visible:ring-brand/40 outline-none md:self-auto"
                        >
                            {viewAll.label}
                            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </Link>
                    )}
                </div>

                {layout === 'carousel' ? (
                    <ProductCarousel products={products} collectionNames={collectionNames} preloadFirstProduct={preloadFirstProduct} />
                ) : (
                    <ul className={PRODUCT_RAIL_GRID_CLASS}>
                        {products.map((product, position) => (
                            <li key={product.productId}>
                                <ProductCard
                                    product={product}
                                    category={product.collectionIds.map((collectionId) => collectionNames?.[collectionId]).find(Boolean)}
                                    preload={preloadFirstProduct && position === 0}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

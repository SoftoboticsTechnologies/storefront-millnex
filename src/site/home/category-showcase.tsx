import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import type {ShopCategory} from '@/features/collections/data';
import {NavigationLink} from '@/site/navigation/navigation-link';

function stripTags(html: string | null | undefined) {
    return html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
}

function Monogram({name}: {name: string}) {
    // No Vendure image: a neutral monogram tile rather than stock imagery.
    return (
        <span aria-hidden="true" className="flex size-full items-center justify-center bg-gradient-to-br from-surface to-muted text-3xl font-extrabold text-foreground/25">
            {name.trim().charAt(0).toUpperCase()}
        </span>
    );
}

/** Collage columns by image count; Tailwind needs literal class names. */
const COLLAGE_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * Category artwork. A collection image set in Vendure wins; otherwise the
 * collection's own product images are shown whole (object-contain — they are
 * portrait promo tiles with the model name printed on them, so cropping
 * them to a landscape frame cuts the product off).
 */
function CategoryArtwork({category, maxImages}: {category: ShopCategory; maxImages: number}) {
    const productImages = category.productImages ?? [];
    const ownAsset = category.featuredAsset && !productImages.some((image) => image.id === category.featuredAsset?.id)
        ? category.featuredAsset
        : null;

    if (ownAsset) {
        return (
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <Image src={`${ownAsset.preview}?preset=large`} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]" />
            </div>
        );
    }

    const images = productImages.slice(0, maxImages);
    if (images.length === 0) {
        return <div className="relative aspect-[4/3] overflow-hidden"><Monogram name={category.name} /></div>;
    }

    return (
        <div className={`grid gap-2 bg-surface p-2 sm:gap-3 sm:p-3 ${COLLAGE_COLS[images.length]}`}>
            {images.map((image, index) => (
                // Phones get one row of two so the card stays a sensible height.
                <div key={image.id} className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-white ${index >= 2 ? 'hidden sm:block' : ''}`}>
                    <Image
                        src={`${image.preview}?preset=medium`}
                        alt={image.alt}
                        fill
                        sizes={images.length === 1 ? '(min-width: 1024px) 40vw, 90vw' : '(min-width: 1024px) 25vw, 45vw'}
                        className="object-contain transition-transform duration-500 group-hover/card:scale-[1.03]"
                    />
                </div>
            ))}
        </div>
    );
}

/**
 * Column classes by category count (1–4); Tailwind needs literal class names.
 * Cards share one row from sm up; each shows its two lead product images
 * large rather than four small tiles.
 */
const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1 sm:max-w-xl',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export async function CategoryGrid({categories}: {categories: ShopCategory[]}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    if (categories.length === 0) return null;

    return (
        <section id="categories" className="scroll-mt-20 py-12 sm:py-16">
            <div className="site-container">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">{t('categoriesEyebrow')}</p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('shopByCategory')}</h2>

                <ul className={`mt-8 grid gap-4 sm:gap-6 ${GRID_COLS[Math.min(categories.length, 4)]}`}>
                    {categories.map((category) => {
                        const description = stripTags(category.description);
                        const children = category.children ?? [];
                        return (
                            <li key={category.id} className="group/card relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-30px_rgb(0_0_0/0.45)]">
                                <CategoryArtwork category={category} maxImages={2} />
                                <div className="flex flex-1 flex-col p-5 sm:p-6">
                                    <h3 className="text-lg font-bold sm:text-xl">
                                        <NavigationLink href={`/collection/${category.slug}/`} className="after:absolute after:inset-0 after:content-[''] hover:text-brand">
                                            {category.name.trim()}
                                        </NavigationLink>
                                    </h3>
                                    {description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{description}</p>}
                                    {children.length > 0 && (
                                        <ul className="relative z-10 mt-3 flex flex-wrap gap-1.5">
                                            {children.slice(0, 4).map((child) => (
                                                <li key={child.id}>
                                                    <NavigationLink href={`/collection/${child.slug}/`} className="inline-flex rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold hover:bg-muted">
                                                        {child.name.trim()}
                                                    </NavigationLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-brand sm:text-base">
                                        {t('shopCategory')}
                                        <ArrowRight className="size-4 transition-transform group-hover/card:translate-x-0.5" />
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

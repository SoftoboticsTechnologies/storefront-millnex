import type {CSSProperties} from 'react';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowUpRight, ImageOff} from 'lucide-react';
import {cn} from '@/lib/utils';
import {getRouteLocale} from '@/platform/i18n/server';
import type {CatalogFacet} from '@/features/products/data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SHOWCASE_COPY} from '@/site/content/home';
import {resolveCatalogLink, type CatalogCategory} from '@/site/home/catalog-links';
import {SectionHeading} from '@/site/ui/section-heading';

export interface ShowcaseProduct {
    name: string;
    slug: string;
    imageUrl: string | null;
    inStock: boolean;
}

const RANGE_PREVIEW_SIZE = 4;

// Editorial grid positions (lg): one tall feature card, one wide card, two compact cards.
const LAYOUT = [
    {card: 'lg:col-span-5 lg:row-span-2', media: 'aspect-[4/3] lg:aspect-auto lg:flex-1', direction: 'flex-col'},
    {card: 'lg:col-span-7', media: 'aspect-[4/3] sm:aspect-auto sm:w-[46%]', direction: 'flex-col sm:flex-row-reverse'},
    {card: 'lg:col-span-4', media: 'aspect-[4/3]', direction: 'flex-col'},
    {card: 'lg:col-span-3', media: 'aspect-[4/3]', direction: 'flex-col'},
] as const;

/**
 * "Machines Built for Every Need": four editorial category cards. Imagery is
 * Millnex's own machine photography; each card's link is resolved against
 * the live Vendure catalog at build time (catalog-links.ts), so it always
 * lands on real products. The tall feature card also lists the real Vendure
 * products of the collection it resolves to ("In this range").
 */
export async function CategoryShowcase({
    categories,
    facets,
    productsByCategory = {},
}: {
    categories: CatalogCategory[];
    facets: CatalogFacet[];
    /** Collection slug → its products (build time), for the feature card's range list. */
    productsByCategory?: Record<string, ShowcaseProduct[]>;
}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <section id="categories" className="scroll-mt-28 bg-background py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading title={SHOWCASE_COPY.title} body={SHOWCASE_COPY.body} />
                    <NavigationLink href="/shop" className="group/btn inline-flex shrink-0 items-center gap-2 text-sm font-bold text-foreground hover:text-brand" data-reveal>
                        {t('viewAllMachines')}
                        <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                    </NavigationLink>
                </div>

                <ul className="mt-12 grid gap-4 sm:gap-5 lg:auto-rows-[minmax(17rem,auto)] lg:grid-cols-12">
                    {SHOWCASE_COPY.cards.map((card, index) => {
                        const layout = LAYOUT[index % LAYOUT.length];
                        const link = resolveCatalogLink(card.match, categories, facets);
                        const collectionSlug = link.href.startsWith('/collection/') ? link.href.slice('/collection/'.length) : null;
                        const range = index === 0 && collectionSlug ? (productsByCategory[collectionSlug] ?? []).slice(0, RANGE_PREVIEW_SIZE) : [];
                        return (
                            <li
                                key={card.title}
                                data-reveal
                                style={{'--reveal-delay': `${index * 90}ms`} as CSSProperties}
                                className={cn('flex', layout.card)}
                            >
                                <NavigationLink
                                    href={link.href}
                                    className={cn(
                                        'group/card flex w-full overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_34px_60px_-40px_rgb(15_20_30/0.55)]',
                                        layout.direction,
                                    )}
                                >
                                    <div className={cn('frame-ticks relative shrink-0 overflow-hidden bg-stage', layout.media)}>
                                        <Image
                                            src={card.image.src}
                                            alt={card.image.alt}
                                            fill
                                            sizes={index === 0 ? '(max-width: 1024px) 100vw, 40vw' : '(max-width: 1024px) 100vw, 30vw'}
                                            className="object-contain p-6 mix-blend-multiply transition-transform duration-700 ease-out group-hover/card:scale-[1.06]"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-7">
                                        <div>
                                            <h3 className={cn('font-display-wide font-bold leading-tight', index === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl')}>{card.title}</h3>
                                            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{card.body}</p>
                                            {range.length > 0 && (
                                                <div className="mt-6">
                                                    <p className="spec-label text-steel">{t('inThisRange')}</p>
                                                    {/* Plain rows, not links: the whole card is already one link. */}
                                                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                                        {range.map((product) => (
                                                            <li key={product.slug} className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-2">
                                                                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-stage">
                                                                    {product.imageUrl ? (
                                                                        <Image src={`${product.imageUrl}?preset=thumb`} alt="" fill sizes="48px" className="object-contain mix-blend-multiply" />
                                                                    ) : (
                                                                        <ImageOff aria-hidden="true" className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                                                                    )}
                                                                </span>
                                                                <span className="line-clamp-2 min-w-0 text-[13px] font-semibold leading-snug">{product.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <span className="inline-flex items-center justify-between gap-3 border-t border-border pt-4 text-sm font-bold">
                                            {t('exploreCategory')}
                                            <span className="flex size-9 items-center justify-center rounded-lg bg-logo-blue text-white transition-colors duration-300 group-hover/card:bg-brand">
                                                <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
                                            </span>
                                        </span>
                                    </div>
                                </NavigationLink>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

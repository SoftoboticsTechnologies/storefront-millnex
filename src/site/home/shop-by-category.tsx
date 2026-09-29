import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {cn} from '@/lib/utils';
import {getRouteLocale} from '@/platform/i18n/server';
import {findCategoryBanner} from '@/site/content/media';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SectionHeading} from '@/site/ui/section-heading';

export interface ShopByCategoryEntry {
    name: string;
    slug: string;
    productCount: number;
}

/** Card accents cycle through the logo ring's tints. */
const ACCENTS = [
    {band: 'bg-tint-blue'},
    {band: 'bg-tint-orange'},
    {band: 'bg-tint-green'},
] as const;

/**
 * "Shop by category": one card per real top-level Vendure collection (the
 * same categories as the header mega-menu), linking to the collection. Categories with a Millnex banner (`CATEGORY_BANNERS`, matched
 * by name) use it as the card header — shown whole, since the name is
 * printed on it — otherwise a tinted header with the name. Renders nothing when Vendure has no categories. Independent of
 * the editorial `CategoryShowcase`.
 */
export async function ShopByCategory({categories}: {categories: ShopByCategoryEntry[]}) {
    const shown = categories.filter((category) => category.productCount > 0);
    if (shown.length === 0) return null;

    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <section id="shop-by-category" className="scroll-mt-28 bg-background py-16 sm:py-20">
            <div className="site-container">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <SectionHeading title={t('shopByCategory')} body={t('shopByCategoryBody')} />
                    <NavigationLink href="/shop" className="group/btn inline-flex shrink-0 items-center gap-2 text-sm font-bold text-foreground hover:text-brand" data-reveal>
                        {t('viewAllMachines')}
                        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </NavigationLink>
                </div>

                <div className={cn('mt-10 grid gap-6', shown.length > 1 && 'lg:grid-cols-2')}>
                    {shown.map((category, index) => {
                        const accent = ACCENTS[index % ACCENTS.length];
                        const banner = findCategoryBanner(category.name);
                        return (
                            <article key={category.slug} data-reveal className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                                {banner ? (
                                    <NavigationLink href={`/collection/${category.slug}`} className="group/cat relative block aspect-square overflow-hidden">
                                        {/* The banner carries the category name as art; the heading stays for screen readers and SEO. */}
                                        <h3 className="sr-only">{category.name}</h3>
                                        <Image
                                            src={banner.src}
                                            alt={banner.alt}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 620px"
                                            className="object-cover transition-transform duration-700 ease-out group-hover/cat:scale-[1.03]"
                                        />
                                        <span aria-hidden="true" className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-md backdrop-blur transition-colors group-hover/cat:bg-brand group-hover/cat:text-brand-foreground">
                                            <ArrowRight className="size-4" />
                                        </span>
                                    </NavigationLink>
                                ) : (
                                <NavigationLink
                                    href={`/collection/${category.slug}`}
                                    className={cn('group/cat flex items-center justify-between gap-4 px-5 py-5 sm:px-6', accent.band)}
                                >
                                    <span className="min-w-0">
                                        <h3 className="font-display-wide text-xl font-bold leading-tight group-hover/cat:text-brand sm:text-2xl">{category.name}</h3>
                                    </span>
                                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-foreground shadow-sm transition-colors group-hover/cat:bg-brand group-hover/cat:text-brand-foreground">
                                        <ArrowRight className="size-4" />
                                    </span>
                                </NavigationLink>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

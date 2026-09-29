import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {CatalogFacet} from '@/features/products/data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SPLIT_COPY} from '@/site/content/home';
import {resolveCatalogLink, type CatalogCategory} from '@/site/home/catalog-links';
import {arrowNudge, siteButton} from '@/site/ui/button-styles';

/**
 * "For your home" / "For your business" split: the same composition on the
 * logo's orange and blue tints. CTAs resolve to real catalog listings
 * (catalog-links.ts).
 */
export function SplitSection({categories, facets}: {categories: CatalogCategory[]; facets: CatalogFacet[]}) {
    const panels = [
        {key: 'home', copy: SPLIT_COPY.home, business: false},
        {key: 'business', copy: SPLIT_COPY.business, business: true},
    ] as const;

    return (
        <section aria-label={`${SPLIT_COPY.home.title} / ${SPLIT_COPY.business.title}`} className="grid lg:grid-cols-2">
            {panels.map(({key, copy, business}) => {
                const link = resolveCatalogLink(copy.match, categories, facets);
                return (
                    <div
                        key={key}
                        className={cn(
                            'group/split relative isolate flex flex-col overflow-hidden px-4 pt-16 sm:px-10 lg:px-14 lg:pt-20 xl:px-20',
                            business ? 'bg-tint-blue text-foreground' : 'bg-tint-orange text-foreground',
                        )}
                    >
                        <div data-reveal className="max-w-lg">
                            <h2 className="font-display-wide text-3xl font-bold leading-[1.05] sm:text-4xl">{copy.title}</h2>
                            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{copy.body}</p>
                            <NavigationLink href={link.href} className={cn('mt-8', siteButton({variant: business ? 'secondary' : 'brand', size: 'lg'}))}>
                                {copy.cta}
                                <ArrowRight aria-hidden="true" className={arrowNudge} />
                            </NavigationLink>
                        </div>
                        <div className="relative mt-12 h-72 sm:h-80 lg:h-96">
                            <div className="absolute inset-x-6 bottom-0 top-0 overflow-hidden rounded-t-2xl bg-stage sm:inset-x-12">
                                <Image
                                    src={copy.image.src}
                                    alt={copy.image.alt}
                                    fill
                                    sizes="(max-width: 1024px) 90vw, 45vw"
                                    className="object-contain object-bottom px-6 pt-6 mix-blend-multiply transition-transform duration-700 ease-out group-hover/split:-translate-y-2 group-hover/split:scale-[1.03]"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

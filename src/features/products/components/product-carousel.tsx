'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ProductCard} from "@/features/products/components/product-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import type {ProductCardData} from '@/features/products/product-card-data';

interface ProductCarouselClientProps {
    products: ProductCardData[];
    collectionNames?: Record<string, string>;
    preloadFirstProduct?: boolean;
}

/**
 * Horizontal product rail. On phones the next card peeks in (swipe to
 * browse); from `md` a progress hairline, "02 / 04" counter and square
 * prev/next controls sit under the track. Controls hide when everything fits.
 */
export function ProductCarousel({products, collectionNames, preloadFirstProduct}: ProductCarouselClientProps) {
    const t = useTranslations('Product');
    const [api, setApi] = useState<CarouselApi>();
    const [snap, setSnap] = useState({index: 0, count: 0});

    useEffect(() => {
        if (!api) return;
        const update = () => setSnap({index: api.selectedScrollSnap(), count: api.scrollSnapList().length});
        update();
        api.on('select', update);
        api.on('reInit', update);
        return () => {
            api.off('select', update);
            api.off('reInit', update);
        };
    }, [api]);

    const pad = (value: number) => String(value).padStart(2, '0');

    return (
        <Carousel opts={{align: "start"}} setApi={setApi} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-5">
                {products.map((product, index) => (
                    <CarouselItem
                        key={product.productId}
                        className="basis-[72%] pl-3 min-[480px]:basis-1/2 sm:pl-5 md:basis-1/3 xl:basis-1/4"
                    >
                        <ProductCard
                            product={product}
                            category={product.collectionIds.map((id) => collectionNames?.[id]).find(Boolean)}
                            preload={preloadFirstProduct && index === 0}
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>

            {snap.count > 1 && (
                <div className="mt-6 flex items-center gap-4 sm:mt-8">
                    <span className="spec-label shrink-0 text-steel tabular-nums" aria-hidden="true">
                        <span className="text-foreground">{pad(snap.index + 1)}</span> / {pad(snap.count)}
                    </span>
                    <span aria-hidden="true" className="relative h-px flex-1 bg-border">
                        <span
                            className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-300 ease-out"
                            style={{width: `${((snap.index + 1) / snap.count) * 100}%`}}
                        />
                    </span>
                    <div className="flex shrink-0 gap-2">
                        <CarouselPrevious
                            aria-label={t('previousSlide')}
                            className="static size-10 translate-y-0 rounded-lg border-foreground/15 bg-card hover:border-foreground/35 disabled:opacity-40"
                        />
                        <CarouselNext
                            aria-label={t('nextSlide')}
                            className="static size-10 translate-y-0 rounded-lg border-foreground/15 bg-card hover:border-foreground/35 disabled:opacity-40"
                        />
                    </div>
                </div>
            )}
        </Carousel>
    );
}

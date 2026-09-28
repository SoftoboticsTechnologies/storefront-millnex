'use client';

import {ProductCard} from "@/features/products/components/product-card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import type {ProductCardData} from '@/features/products/product-card-data';

interface ProductCarouselClientProps {
    products: ProductCardData[];
    collectionNames?: Record<string, string>;
    preloadFirstProduct?: boolean;
}

export function ProductCarousel({products, collectionNames, preloadFirstProduct}: ProductCarouselClientProps) {
    return (
        <Carousel opts={{align: "start"}} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-5">
                {products.map((product, index) => (
                    <CarouselItem
                        key={product.productId}
                        className="basis-1/2 pl-3 sm:pl-5 md:basis-1/3 xl:basis-1/4"
                    >
                        <ProductCard
                            product={product}
                            category={product.collectionIds.map((id) => collectionNames?.[id]).find(Boolean)}
                            preload={preloadFirstProduct && index === 0}
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 hidden bg-card md:flex"/>
            <CarouselNext className="-right-4 hidden bg-card md:flex"/>
        </Carousel>
    );
}

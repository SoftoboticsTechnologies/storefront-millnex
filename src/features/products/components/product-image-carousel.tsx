'use client';

import {useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type TouchEvent} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ChevronLeft, ChevronRight, ImageOff, Maximize2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {ProductLightbox} from './product-lightbox';

export interface GalleryImage {
    id: string;
    preview: string;
    source: string;
}

interface ProductImageCarouselProps {
    images: GalleryImage[];
    /** Product name — used for every image's alt text ("<name> — image 2 of 4"). */
    name: string;
}

// Minimum horizontal travel (px) before a touch counts as a swipe rather
// than a tap or a vertical page scroll.
const SWIPE_THRESHOLD = 40;

/**
 * PDP gallery. Product photos have white backgrounds with baked-in captions,
 * so they sit on the light `bg-stage` plinth with mix-blend-multiply and are
 * never cropped (`object-contain`). Every image is rendered in the static
 * HTML (stacked, crossfaded) so crawlers see the full set, not just the first.
 *
 * Desktop: hover zoom that follows the pointer (transform-origin tracks the
 * cursor — no second, higher-resolution request), click to open the
 * fullscreen lightbox. Touch: swipe the stage, thumbnails scroll sideways.
 * Keyboard: ←/→ anywhere inside the gallery.
 */
export function ProductImageCarousel({images, name}: ProductImageCarouselProps) {
    const t = useTranslations('Product');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zooming, setZooming] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const zoomRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLDivElement>(null);
    const touchStart = useRef<{x: number; y: number} | null>(null);
    const count = images?.length ?? 0;

    const go = useCallback((delta: number) => {
        setCurrentIndex((index) => (index + delta + count) % count);
    }, [count]);

    // Keep the active thumbnail visible in the (horizontally scrolling)
    // strip. Scrolls the strip only — scrollIntoView could also jump the page.
    useEffect(() => {
        const strip = stripRef.current;
        const thumb = strip?.children[currentIndex] as HTMLElement | undefined;
        if (!strip || !thumb) return;
        const left = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
        strip.scrollTo({left: Math.max(0, left), behavior: 'smooth'});
    }, [currentIndex]);

    if (!images || count === 0) {
        return (
            <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-stage text-muted-foreground">
                <ImageOff aria-hidden="true" className="size-8 opacity-50" />
                <span className="text-sm">{t('noImage')}</span>
            </div>
        );
    }

    const alt = (index: number) => t('imageAlt', {name, index: index + 1, total: count});

    // Mouse only: on touch, "hover" zoom would fight with swiping/scrolling.
    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        // Written straight to the style (no re-render per mousemove).
        zoomRef.current?.style.setProperty('--zoom-origin', `${x}% ${y}%`);
        if (!zooming) setZooming(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (count < 2) return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(1);
        }
    };

    const handleTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        touchStart.current = {x: touch.clientX, y: touch.clientY};
    };

    const handleTouchEnd = (event: TouchEvent) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || count < 2) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            go(dx < 0 ? 1 : -1);
        }
    };

    return (
        <div
            role="group"
            aria-roledescription="carousel"
            aria-label={t('galleryLabel')}
            onKeyDown={handleKeyDown}
            className="space-y-3 sm:space-y-4"
        >
            {/* Main stage */}
            <div className="group/stage frame-ticks relative overflow-hidden rounded-2xl border border-border bg-stage">
                <div
                    className="relative aspect-square cursor-zoom-in touch-pan-y"
                    onPointerMove={handlePointerMove}
                    onPointerLeave={() => setZooming(false)}
                    onClick={() => setLightboxOpen(true)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        ref={zoomRef}
                        className={cn(
                            'absolute inset-0 origin-(--zoom-origin) transition-transform duration-300 ease-out motion-reduce:transition-none',
                            zooming && 'scale-[2.1]',
                        )}
                        style={{'--zoom-origin': '50% 50%'} as CSSProperties}
                    >
                        {images.map((image, index) => (
                            <Image
                                key={image.id}
                                src={image.preview}
                                alt={alt(index)}
                                aria-hidden={index !== currentIndex}
                                fill
                                preload={index === 0}
                                loading={index === 0 ? undefined : 'lazy'}
                                className={cn(
                                    'object-contain p-5 mix-blend-multiply transition-opacity duration-300 sm:p-8',
                                    index === currentIndex ? 'opacity-100' : 'opacity-0',
                                )}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        ))}
                    </div>
                </div>

                {count > 1 && (
                    <>
                        <GalleryArrow direction="prev" label={t('previousImage')} onClick={() => go(-1)} />
                        <GalleryArrow direction="next" label={t('nextImage')} onClick={() => go(1)} />
                        <p
                            className="spec-label pointer-events-none absolute bottom-3 left-3 rounded-md bg-card/90 px-2 py-1 text-foreground shadow-sm backdrop-blur"
                            aria-live="polite"
                        >
                            {t('imageCounter', {index: currentIndex + 1, total: count})}
                        </p>
                    </>
                )}

                <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label={t('openFullscreen')}
                    title={t('openFullscreen')}
                    className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-lg bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors outline-none hover:bg-card hover:text-brand focus-visible:ring-3 focus-visible:ring-brand/40"
                >
                    <Maximize2 aria-hidden="true" className="size-[18px]" />
                </button>

                <p className="spec-label pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-steel transition-opacity group-hover/stage:opacity-0 lg:block">
                    {t('zoomHint')}
                </p>
            </div>

            {/* Thumbnails: a sideways-scrolling strip (fits any width, 320px up) */}
            {count > 1 && (
                <div
                    ref={stripRef}
                    className="relative -mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden"
                >
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setCurrentIndex(index)}
                            aria-label={t('showImage', {index: index + 1})}
                            aria-current={index === currentIndex ? 'true' : undefined}
                            className={cn(
                                'relative size-16 shrink-0 snap-start overflow-hidden rounded-lg border bg-stage transition-[border-color,opacity,box-shadow] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-brand/40 sm:size-20',
                                index === currentIndex
                                    ? 'border-brand shadow-[0_0_0_1px_var(--brand)]'
                                    : 'border-border opacity-70 hover:border-foreground/30 hover:opacity-100',
                            )}
                        >
                            <Image
                                src={`${image.preview}?preset=thumb`}
                                alt=""
                                fill
                                loading="lazy"
                                className="object-contain p-1.5 mix-blend-multiply"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}

            <ProductLightbox
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
                images={images}
                name={name}
                index={currentIndex}
                onIndexChange={setCurrentIndex}
            />
        </div>
    );
}

function GalleryArrow({direction, label, onClick}: {direction: 'prev' | 'next'; label: string; onClick: () => void}) {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={cn(
                'absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground shadow-sm backdrop-blur transition-[opacity,color,background-color] duration-200 outline-none hover:bg-card hover:text-brand focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-brand/40 lg:opacity-0 lg:group-hover/stage:opacity-100',
                direction === 'prev' ? 'left-3' : 'right-3',
            )}
        >
            <Icon aria-hidden="true" className="size-5" />
        </button>
    );
}

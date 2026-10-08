'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ArrowRight, CalendarCheck, ChevronLeft, ChevronRight} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Link} from '@/platform/i18n/navigation';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import type {HeroSlide} from '@/site/content/media';
import {arrowNudge, siteButton} from '@/site/ui/button-styles';

/** Caption shown under a banner (resolved server-side in hero.tsx). */
export interface HeroCaption {
    title: string;
    body: string;
    actions: Array<{label: string; href: string}>;
    /** Adds the primary "Book a Free Demo" button (site-wide demo modal) before the actions. */
    quote: boolean;
}

const AUTOPLAY_MS = 3000;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Full-width banner ("wallpaper") carousel for the homepage hero.
 * - Auto-advances every 3s, always — hovering or clicking does not pause
 *   it (that read as "the banner never changes"); it only stops while the
 *   browser tab is hidden, and restarts its timer after any manual change.
 * - One arrow at each side, dots below, swipe on touch.
 * - Every slide fills the 8:3 frame edge to edge (`object-cover`, no
 *   letterboxing). Banners made at 8:3 (2048×768) fit exactly; a slightly
 *   taller one is trimmed at the bottom only (`objectPosition`, default
 *   top) so its logo and headline stay whole.
 * - Under reduced motion slides still change, but without the slide animation.
 * - A caption band under the banner (headline, copy, buttons) follows the
 *   active slide. All captions share one grid cell, so the band keeps the
 *   height of the tallest and never jumps; inactive ones are hidden + inert.
 * Every slide links to the shop.
 */
export function HeroCarousel({slides, captions = []}: {slides: HeroSlide[]; captions?: HeroCaption[]}) {
    const t = useTranslations('Home');
    const tEnquiry = useTranslations('Enquiry');
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    // Bumped on manual navigation so the autoplay timer restarts from zero.
    const [tick, setTick] = useState(0);
    const pointerStart = useRef<number | null>(null);
    const count = slides.length;

    const goTo = useCallback((index: number) => {
        setActive(((index % count) + count) % count);
        setTick((value) => value + 1);
    }, [count]);

    useEffect(() => {
        if (paused || count < 2) return;
        const timer = setTimeout(() => setActive((current) => (current + 1) % count), AUTOPLAY_MS);
        return () => clearTimeout(timer);
    }, [active, paused, count, tick]);

    useEffect(() => {
        const onVisibility = () => setPaused(document.hidden);
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    if (count === 0) return null;

    const arrow = 'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-[0_8px_24px_-10px_rgb(10_15_25/0.5)] ring-1 ring-black/5 backdrop-blur transition-[background-color,transform] outline-none hover:scale-105 hover:bg-white focus-visible:ring-3 focus-visible:ring-brand/50 sm:size-12';

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label={t('heroCarousel')}
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') goTo(active - 1);
                if (event.key === 'ArrowRight') goTo(active + 1);
            }}
        >
            <div
                className="group/hero relative touch-pan-y overflow-hidden"
                onPointerDown={(event) => {
                    if (event.pointerType !== 'mouse') pointerStart.current = event.clientX;
                }}
                onPointerUp={(event) => {
                    if (pointerStart.current === null) return;
                    const delta = event.clientX - pointerStart.current;
                    pointerStart.current = null;
                    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) goTo(active + (delta < 0 ? 1 : -1));
                }}
            >
                <div
                    className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                    style={{transform: `translate3d(-${active * 100}%, 0, 0)`}}
                >
                    {slides.map((slide, index) => {
                        const current = index === active;
                        return (
                            <div
                                key={slide.src}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={t('heroSlideOf', {index: index + 1, total: count})}
                                aria-hidden={!current}
                                inert={!current}
                                className="relative aspect-[8/3] w-full shrink-0 overflow-hidden bg-surface"
                            >
                                {/* Plain <img>: next/image is unoptimized under static export,
                                    so it can't serve the 1024px/2048px srcset itself. */}
                                <Link href="/shop" tabIndex={current ? 0 : -1} className="absolute inset-0 block outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand/50">
                                    <img
                                        src={slide.src}
                                        srcSet={`${slide.mobileSrc} 1024w, ${slide.src} ${slide.width}w`}
                                        sizes="100vw"
                                        alt={slide.alt}
                                        width={slide.width}
                                        height={slide.height}
                                        className="size-full object-cover"
                                        style={{objectPosition: slide.objectPosition ?? 'top'}}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        fetchPriority={index === 0 ? 'high' : 'auto'}
                                        decoding={index === 0 ? 'sync' : 'async'}
                                        onError={(event) => {
                                            // WebP missing (e.g. a PNG replaced while `next dev` is
                                            // running, before scripts/optimize-hero-images.mjs ran):
                                            // fall back to the source PNG once.
                                            const img = event.currentTarget;
                                            const png = slide.src.replace(/\.webp$/, '.png');
                                            if (img.dataset.fallback || png === slide.src) return;
                                            img.dataset.fallback = '1';
                                            img.srcset = '';
                                            img.src = png;
                                        }}
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {count > 1 && (
                    <>
                        <button type="button" onClick={() => goTo(active - 1)} aria-label={t('heroPrevious')} className={cn(arrow, 'left-3 sm:left-5')}>
                            <ChevronLeft aria-hidden="true" className="size-5 sm:size-6" />
                        </button>
                        <button type="button" onClick={() => goTo(active + 1)} aria-label={t('heroNext')} className={cn(arrow, 'right-3 sm:right-5')}>
                            <ChevronRight aria-hidden="true" className="size-5 sm:size-6" />
                        </button>

                        <div className="absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.5 sm:bottom-4 sm:gap-2">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.src}
                                    type="button"
                                    onClick={() => goTo(index)}
                                    aria-label={t('heroGoTo', {index: index + 1})}
                                    aria-current={index === active ? 'true' : undefined}
                                    className="flex h-6 items-center outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                                >
                                    <span
                                        className={cn(
                                            'block h-1.5 rounded-full shadow-sm ring-1 ring-black/10 transition-[width,background-color] duration-300',
                                            index === active ? 'w-6 bg-brand sm:w-8' : 'w-1.5 bg-white/90 hover:bg-white',
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {captions.length > 0 && (
                <div className="border-b border-border bg-card">
                    <div className="site-container grid py-6 sm:py-8">
                        {captions.map((caption, index) => {
                            const current = index === active;
                            return (
                                <div
                                    key={caption.title}
                                    aria-hidden={!current}
                                    inert={!current}
                                    className={cn(
                                        'col-start-1 row-start-1 flex flex-col gap-5 transition-opacity duration-500 motion-reduce:transition-none md:flex-row md:items-center md:justify-between md:gap-10',
                                        current ? 'opacity-100' : 'pointer-events-none opacity-0',
                                    )}
                                >
                                    <div className="max-w-2xl">
                                        <p className="font-display-wide text-2xl font-bold leading-tight sm:text-3xl">{caption.title}</p>
                                        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{caption.body}</p>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                        {/* 2026-10-08: "Book a Free Demo" is the primary CTA; catalog actions are secondary.
                                            Previously the actions were primary (brand) and "Request a Quote" secondary. */}
                                        {caption.quote && (
                                            <QuoteButton className={siteButton({variant: 'brand', size: 'lg'})}>
                                                <CalendarCheck aria-hidden="true" />
                                                {tEnquiry('bookDemo')}
                                            </QuoteButton>
                                        )}
                                        {caption.actions.map((action) => (
                                            <Link key={action.label} href={action.href} className={siteButton({variant: caption.quote ? 'secondary' : 'brand', size: 'lg'})}>
                                                {action.label}
                                                <ArrowRight aria-hidden="true" className={arrowNudge} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

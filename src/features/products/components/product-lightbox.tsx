'use client';

import {useRef, type KeyboardEvent, type TouchEvent} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {Dialog, DialogClose, DialogContent, DialogTitle} from '@/components/ui/dialog';
import {cn} from '@/lib/utils';
import type {GalleryImage} from './product-image-carousel';

interface ProductLightboxProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    images: GalleryImage[];
    name: string;
    /** Shared with the inline gallery, so closing lands on the image last viewed. */
    index: number;
    onIndexChange: (index: number) => void;
}

const SWIPE_THRESHOLD = 40;

/**
 * Fullscreen product image viewer: prev/next buttons, ←/→ keys, swipe,
 * thumbnails and a counter. Full-bleed on phones, a large framed panel from
 * `sm` up. Images stay uncropped on the light stage (white backgrounds).
 */
export function ProductLightbox({open, onOpenChange, images, name, index, onIndexChange}: ProductLightboxProps) {
    const t = useTranslations('Product');
    const touchStart = useRef<number | null>(null);
    const count = images.length;
    const go = (delta: number) => onIndexChange((index + delta + count) % count);
    const image = images[index];

    const handleKeyDown = (event: KeyboardEvent) => {
        // React events bubble through portals: without this the inline
        // gallery (this dialog's React parent) would advance a second time.
        event.stopPropagation();
        if (count < 2) return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(1);
        }
    };

    const handleTouchEnd = (event: TouchEvent) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (start === null || count < 2) return;
        const dx = event.changedTouches[0].clientX - start;
        if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                onKeyDown={handleKeyDown}
                className="flex h-dvh max-h-none w-full max-w-none flex-col gap-0 rounded-none bg-background p-0 ring-0 sm:h-[min(92dvh,56rem)] sm:max-w-[min(94vw,76rem)] sm:rounded-2xl sm:ring-1"
            >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
                    <DialogTitle className="min-w-0 flex-1 truncate font-display text-sm font-semibold sm:text-base">{name}</DialogTitle>
                    {count > 1 && (
                        <span className="spec-label shrink-0 text-steel" aria-live="polite">
                            {t('imageCounter', {index: index + 1, total: count})}
                        </span>
                    )}
                    <DialogClose
                        render={
                            <button
                                type="button"
                                aria-label={t('closeFullscreen')}
                                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors outline-none hover:border-foreground/30 hover:text-brand focus-visible:ring-3 focus-visible:ring-brand/40"
                            />
                        }
                    >
                        <X aria-hidden="true" className="size-5" />
                    </DialogClose>
                </div>

                <div
                    className="relative min-h-0 flex-1 touch-pan-y bg-stage"
                    onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
                    onTouchEnd={handleTouchEnd}
                >
                    {image && (
                        <Image
                            key={image.id}
                            src={image.preview}
                            alt={t('imageAlt', {name, index: index + 1, total: count})}
                            fill
                            className="object-contain p-4 mix-blend-multiply sm:p-10"
                            sizes="94vw"
                        />
                    )}
                    {count > 1 && (
                        <>
                            <LightboxArrow direction="prev" label={t('previousImage')} onClick={() => go(-1)} />
                            <LightboxArrow direction="next" label={t('nextImage')} onClick={() => go(1)} />
                        </>
                    )}
                </div>

                {count > 1 && (
                    <div className="flex justify-start gap-2.5 overflow-x-auto border-t border-border px-4 py-3 [scrollbar-width:none] sm:justify-center sm:px-5 [&::-webkit-scrollbar]:hidden">
                        {images.map((thumb, thumbIndex) => (
                            <button
                                key={thumb.id}
                                type="button"
                                onClick={() => onIndexChange(thumbIndex)}
                                aria-label={t('showImage', {index: thumbIndex + 1})}
                                aria-current={thumbIndex === index ? 'true' : undefined}
                                className={cn(
                                    'relative size-14 shrink-0 overflow-hidden rounded-lg border bg-stage transition-[border-color,opacity] outline-none focus-visible:ring-3 focus-visible:ring-brand/40 sm:size-16',
                                    thumbIndex === index ? 'border-brand shadow-[0_0_0_1px_var(--brand)]' : 'border-border opacity-60 hover:opacity-100',
                                )}
                            >
                                <Image src={`${thumb.preview}?preset=thumb`} alt="" fill loading="lazy" sizes="64px" className="object-contain p-1 mix-blend-multiply" />
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function LightboxArrow({direction, label, onClick}: {direction: 'prev' | 'next'; label: string; onClick: () => void}) {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={cn(
                'absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground shadow-sm backdrop-blur transition-colors outline-none hover:text-brand focus-visible:ring-3 focus-visible:ring-brand/40 sm:size-12',
                direction === 'prev' ? 'left-3 sm:left-5' : 'right-3 sm:right-5',
            )}
        >
            <Icon aria-hidden="true" className="size-6" />
        </button>
    );
}

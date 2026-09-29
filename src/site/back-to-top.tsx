'use client';

import {useEffect, useState} from 'react';
import {ArrowUp} from 'lucide-react';
import {cn} from '@/lib/utils';

/** Scroll distance (px) after which the button appears. */
const SHOW_AFTER = 600;

/**
 * Floating "back to top" button, stacked centred above the WhatsApp button
 * (whatsapp-float.tsx: 58px below sm, 62px from sm; 18px offsets + tab bar
 * below lg, 24px from lg) with a 12px gap. Keep the two in sync.
 */
export function BackToTop({label}: {label: string}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => setVisible(window.scrollY > SHOW_AFTER);
        update();
        window.addEventListener('scroll', update, {passive: true});
        return () => window.removeEventListener('scroll', update);
    }, []);

    const scrollToTop = () => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({top: 0, behavior: reduceMotion ? 'auto' : 'smooth'});
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label={label}
            title={label}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            className={cn(
                'fixed z-30 flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground shadow-[0_14px_32px_-14px_rgb(0_0_0/0.45)] transition-[opacity,transform,background-color,color] duration-300 hover:bg-logo-blue hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40',
                // Centred 12px above the 52px WhatsApp button (whatsapp-float.tsx) — keep in sync.
                'right-[22px] bottom-[calc(4rem+16px+52px+12px+env(safe-area-inset-bottom))] lg:right-[30px] lg:bottom-[88px]',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
            )}
        >
            <ArrowUp aria-hidden="true" className="size-5" />
        </button>
    );
}

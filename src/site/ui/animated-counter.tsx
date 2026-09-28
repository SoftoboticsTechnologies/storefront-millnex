'use client';

import {useEffect, useRef, useState} from 'react';

/**
 * Counts up to `value` the first time it scrolls into view. Only use it for
 * verified figures (see COMPANY_STATS in site/content/home.ts). The final
 * value is rendered on the server so it's present without JavaScript.
 */
export function AnimatedCounter({value, suffix = '', durationMs = 1400}: {value: number; suffix?: string; durationMs?: number}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [display, setDisplay] = useState(value);

    useEffect(() => {
        const element = ref.current;
        if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame = 0;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry?.isIntersecting) return;
            observer.disconnect();
            const start = performance.now();
            const tick = (now: number) => {
                const progress = Math.min(1, (now - start) / durationMs);
                setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
                if (progress < 1) frame = requestAnimationFrame(tick);
            };
            setDisplay(0);
            frame = requestAnimationFrame(tick);
        }, {threshold: 0.6});

        observer.observe(element);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [value, durationMs]);

    return (
        <span ref={ref} className="tabular-nums">
            {display.toLocaleString()}
            {suffix}
        </span>
    );
}

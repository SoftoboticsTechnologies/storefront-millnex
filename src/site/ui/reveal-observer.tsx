'use client';

import {useEffect} from 'react';

const SELECTOR = '[data-reveal]:not(.is-revealed)';

/**
 * Mounted once in the locale layout. Reveals every `[data-reveal]` element
 * as it scrolls into view (see the matching CSS in globals.css), so section
 * components can stay Server Components and just add the attribute.
 * A MutationObserver picks up elements added later — client-side
 * navigation, or a client component re-rendering (e.g. filter tabs) — so
 * nothing is ever left stuck in its hidden state.
 */
export function RevealObserver() {
    useEffect(() => {
        const reveal = (element: Element) => element.classList.add('is-revealed');

        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll(SELECTOR).forEach(reveal);
            return;
        }

        const intersection = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        reveal(entry.target);
                        intersection.unobserve(entry.target);
                    }
                }
            },
            {rootMargin: '0px 0px -8% 0px', threshold: 0.12},
        );

        const observeWithin = (root: ParentNode) => {
            root.querySelectorAll(SELECTOR).forEach((element) => intersection.observe(element));
        };
        observeWithin(document);

        const mutations = new MutationObserver((records) => {
            for (const record of records) {
                record.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) return;
                    if (node.matches(SELECTOR)) intersection.observe(node);
                    observeWithin(node);
                });
            }
        });
        mutations.observe(document.body, {childList: true, subtree: true});

        return () => {
            mutations.disconnect();
            intersection.disconnect();
        };
    }, []);

    return null;
}

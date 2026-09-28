'use client';

import type {ReactNode} from 'react';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {Link} from '@/platform/i18n/navigation';

/**
 * Auth routes render full-screen, without the site header, mobile tab bar or
 * footer. First path segment after the locale.
 */
const BARE_ROUTES = new Set(['sign-in', 'register', 'forgot-password', 'reset-password', 'verify', 'verify-pending']);

function useBareRoute() {
    const pathname = usePathname();
    // "/en/sign-in/" -> "sign-in"
    const first = pathname.replace(/^\/[^/]+/, '').replace(/^\/+/, '').split('/')[0];
    return BARE_ROUTES.has(first);
}

/** Renders its children (header / footer) everywhere except auth routes. */
export function SiteChrome({children}: {children: ReactNode}) {
    return useBareRoute() ? null : children;
}

/**
 * On auth routes only: a floating logo linking home (the page's only way back
 * once the header is gone). `data-bare-route` lets <body> drop the padding it
 * reserves for the mobile tab bar.
 */
export function BareRouteHome({logo}: {logo: {src: string; width: number; height: number; alt: string}}) {
    if (!useBareRoute()) return null;
    return (
        <Link
            href="/"
            data-bare-route
            className="absolute left-4 top-4 z-40 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-brand/40 sm:left-6 sm:top-5"
        >
            <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} priority className="h-12 w-auto sm:h-14" />
        </Link>
    );
}

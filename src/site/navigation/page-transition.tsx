'use client';

import {useEffect, useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

// Module-level: false until the first page has hydrated. The initial page
// load never animates (an opacity fade would delay LCP); every client-side
// navigation after it does, because `app/[locale]/template.tsx` remounts
// this component per route.
let hasHydrated = false;

export default function PageTransition({children}: {children: ReactNode}) {
    const [animate] = useState(() => hasHydrated);

    useEffect(() => {
        hasHydrated = true;
    }, []);

    return <div className={cn('flex flex-1 flex-col', animate && 'animate-page-enter')}>{children}</div>;
}

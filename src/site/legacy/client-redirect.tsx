'use client';

import {useEffect} from 'react';

export function ClientRedirect({href}: {href: string}) {
    useEffect(() => {
        window.location.replace(href);
    }, [href]);

    return (
        <p className="site-container py-32 text-center text-sm text-muted-foreground">
            <a href={href} className="font-semibold text-brand underline">{href}</a>
        </p>
    );
}

import {BadgeCheck} from 'lucide-react';
import {cn} from '@/lib/utils';
import {CERTIFICATION} from '@/site/content/home';

/**
 * "ISO 9001:2015 Certified" pill (copy: home.ts#CERTIFICATION). Used under
 * the footer logo and in the About hero; the homepage shows the same claim
 * as a trust-strip item.
 */
export function IsoBadge({className}: {className?: string}) {
    return (
        <p
            className={cn(
                'inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3.5 py-1.5 text-sm font-semibold text-foreground',
                className,
            )}
        >
            <BadgeCheck aria-hidden="true" className="size-[18px] shrink-0 text-success" />
            {CERTIFICATION.label}
        </p>
    );
}

import Image from 'next/image';
import {cn} from '@/lib/utils';
import {CERTIFICATION} from '@/site/content/home';
import {ISO_MARK} from '@/site/content/media';

/**
 * "ISO 9001:2015 Certified" pill (copy: home.ts#CERTIFICATION). Used under
 * the footer logo and in the About hero; the homepage shows the same claim
 * as a trust-strip item.
 */
export function IsoBadge({className}: {className?: string}) {
    return (
        <p
            className={cn(
                'inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 py-1 pl-1.5 pr-3.5 text-sm font-semibold text-foreground',
                className,
            )}
        >
            <Image src={ISO_MARK.src} alt="" width={ISO_MARK.width} height={ISO_MARK.height} className="size-6 shrink-0 rounded-full bg-white object-contain" />
            {CERTIFICATION.label}
        </p>
    );
}

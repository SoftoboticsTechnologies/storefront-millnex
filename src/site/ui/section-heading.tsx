import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

interface SectionHeadingProps {
    eyebrow?: string;
    title: ReactNode;
    body?: ReactNode;
    align?: 'left' | 'center';
    tone?: 'light' | 'dark';
    /** Heading level — sections use h2; page heroes pass "h1". */
    as?: 'h1' | 'h2';
    className?: string;
    children?: ReactNode;
}

export function Eyebrow({children, tone = 'light', className}: {children: ReactNode; tone?: 'light' | 'dark'; className?: string}) {
    return (
        <p
            className={cn(
                'inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em]',
                tone === 'dark' ? 'text-brand-bright' : 'text-brand',
                className,
            )}
        >
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {children}
        </p>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    body,
    align = 'left',
    tone = 'light',
    as: Heading = 'h2',
    className,
    children,
}: SectionHeadingProps) {
    return (
        <div
            data-reveal
            className={cn(
                'flex flex-col gap-4',
                align === 'center' && 'mx-auto items-center text-center',
                align === 'center' ? 'max-w-2xl' : 'max-w-3xl',
                className,
            )}
        >
            {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
            <Heading
                className={cn(
                    'font-extrabold leading-[1.08]',
                    Heading === 'h1' ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl lg:text-[2.75rem]',
                    tone === 'dark' ? 'text-ink-foreground' : 'text-foreground',
                )}
            >
                {title}
            </Heading>
            {body && (
                <p className={cn('text-base leading-relaxed sm:text-lg', tone === 'dark' ? 'text-ink-muted' : 'text-muted-foreground')}>
                    {body}
                </p>
            )}
            {children}
        </div>
    );
}

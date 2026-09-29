import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

interface SectionHeadingProps {
    title: ReactNode;
    body?: ReactNode;
    align?: 'left' | 'center';
    /** Heading level — sections use h2; page heroes pass "h1". */
    as?: 'h1' | 'h2';
    className?: string;
    children?: ReactNode;
}

/** Section title + lead. No kicker/eyebrow label above the title (removed 2026-09-29). */
export function SectionHeading({
    title,
    body,
    align = 'left',
    as: Heading = 'h2',
    className,
    children,
}: SectionHeadingProps) {
    return (
        <div
            data-reveal
            className={cn(
                'flex max-w-3xl flex-col gap-5',
                align === 'center' && 'mx-auto items-center text-center',
                className,
            )}
        >
            <Heading
                className={cn(
                    'font-display-wide font-bold leading-[1.02] text-foreground',
                    Heading === 'h1'
                        ? 'text-[2.25rem] sm:text-5xl lg:text-[4rem]'
                        : 'text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem]',
                )}
            >
                {title}
            </Heading>
            {body && <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>}
            {children}
        </div>
    );
}

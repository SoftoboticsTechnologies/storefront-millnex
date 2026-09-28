import {cva, type VariantProps} from 'class-variance-authority';

/**
 * Marketing-layer button styles, usable from Server Components (unlike
 * `components/ui/button`'s `buttonVariants`, which lives in a client module).
 * Apply to `<a>`/`<Link>` elements: most marketing CTAs are navigations.
 */
export const siteButton = cva(
    'group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-brand/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                brand: 'bg-brand text-brand-foreground shadow-[0_10px_30px_-14px_var(--brand)] hover:-translate-y-0.5 hover:bg-[oklch(0.52_0.17_37)] hover:shadow-[0_16px_36px_-14px_var(--brand)]',
                ink: 'bg-ink text-ink-foreground hover:-translate-y-0.5 hover:bg-[oklch(0.25_0.008_60)]',
                outline: 'border border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm',
                'outline-light': 'border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10',
                whatsapp: 'border border-[#1c9e52]/25 bg-[#effaf3] text-[#0f6b37] hover:-translate-y-0.5 hover:border-[#1c9e52]/45 hover:bg-[#e2f6e9]',
                link: 'rounded-md px-0 text-brand underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-9 px-3.5 text-sm [&_svg]:size-4',
                md: 'h-11 px-5 text-sm [&_svg]:size-4',
                lg: 'h-12 px-6 text-[15px] [&_svg]:size-[18px]',
                icon: 'size-11 [&_svg]:size-5',
            },
        },
        defaultVariants: {
            variant: 'brand',
            size: 'md',
        },
    },
);

export type SiteButtonProps = VariantProps<typeof siteButton>;

/** Arrow that nudges right when its parent `group/btn` or `group/card` is hovered. */
export const arrowNudge = 'transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/card:translate-x-1';

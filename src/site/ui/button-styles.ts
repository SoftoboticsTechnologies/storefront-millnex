import {cva, type VariantProps} from 'class-variance-authority';

/**
 * Marketing-layer button styles, usable from Server Components (unlike
 * `components/ui/button`'s `buttonVariants`, which lives in a client module).
 * Apply to `<a>`/`<Link>` elements (most marketing CTAs are navigations) or
 * to `QuoteButton`'s `className`.
 *
 * Shape language: 10px corners (engineered, not pill-shaped), a firm
 * 1px-deep press, and an arrow that nudges on hover (`arrowNudge`).
 */
export const siteButton = cva(
    'group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold tracking-[-0.005em] whitespace-nowrap transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-brand/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                brand: 'bg-brand text-brand-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.18)_inset,0_10px_26px_-14px_var(--brand)] hover:-translate-y-0.5 hover:bg-[oklch(0.52_0.17_37)] hover:shadow-[0_1px_0_0_oklch(1_0_0/0.18)_inset,0_16px_32px_-14px_var(--brand)]',
                /** Logo-blue secondary action. */
                secondary: 'bg-logo-blue text-white shadow-[0_1px_0_0_oklch(1_0_0/0.18)_inset,0_10px_26px_-14px_var(--logo-blue)] hover:-translate-y-0.5 hover:bg-logo-blue-deep',
                outline: 'border border-foreground/15 bg-card text-foreground hover:-translate-y-0.5 hover:border-foreground/35 hover:shadow-[0_10px_24px_-18px_rgb(0_0_0/0.4)]',
                whatsapp: 'border border-[#1c9e52]/25 bg-[#effaf3] text-[#0f6b37] hover:-translate-y-0.5 hover:border-[#1c9e52]/45 hover:bg-[#e2f6e9]',
                link: 'rounded-md px-0 text-brand underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-9 px-3.5 text-sm [&_svg]:size-4',
                md: 'h-11 px-5 text-sm [&_svg]:size-4',
                lg: 'h-[3.25rem] px-7 text-[15px] [&_svg]:size-[18px]',
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

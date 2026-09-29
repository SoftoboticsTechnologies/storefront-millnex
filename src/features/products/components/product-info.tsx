'use client';

import {useState, useMemo, useTransition} from 'react';
import {useRouter} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {ShoppingCart, CheckCircle2, Minus, Plus, Zap, Lock, MessageSquareText, Check, PackageX} from 'lucide-react';
import {cn} from '@/lib/utils';
import {QuoteButton} from '@/features/enquiry/quote-dialog';
import {WishlistButton} from './wishlist-button';
import {StockBadge} from './stock-badge';
import {Link} from '@/platform/i18n/navigation';
import {stripHtml} from '@/features/products/product-card-data';
import {addToCart} from '@/features/products/add-to-cart';
import {toast} from 'sonner';
import {DiscountedPrice} from '@/features/products/discounted-price';
import {useTranslations} from 'next-intl';
import {useLiveProductPricing, type LiveVariantPricing} from '@/features/products/product-price-client';

interface ProductInfoProps {
    product: {
        id: string;
        slug: string;
        name: string;
        description: string;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
    };
    /** Channel default currency the build-time variant prices are in. */
    buildCurrencyCode: string;
    /**
     * The variant to select initially, resolved server-side from the URL's
     * optional `/[sku]` segment (or `product.variants[0]` when absent) — see
     * routes/page.tsx. Options are seeded from this variant so the first
     * client render matches the statically-exported HTML exactly.
     */
    initialVariantId: string;
    /** Most specific Vendure collection the product belongs to, if any. */
    category?: {name: string; slug: string};
}

// Upper bound for the quantity stepper only; Vendure remains the authority
// on how many can actually be ordered (it answers with an
// InsufficientStockError / OrderLimitError, surfaced as a toast).
const MAX_QUANTITY = 99;

export function ProductInfo({product, buildCurrencyCode, initialVariantId, category}: ProductInfoProps) {
    const t = useTranslations('Product');
    // Build-time price/stock for every variant, in the channel default
    // currency — the first paint and static HTML. `refreshStock` always
    // re-fetches live from Vendure on mount, so stock added in admin after
    // the build switches the enquiry view to quantity + Add to cart.
    const buildPricing = useMemo<{currencyCode: string; variants: LiveVariantPricing[]}>(() => ({
        currencyCode: buildCurrencyCode,
        variants: product.variants.map((variant) => ({
            id: variant.id,
            priceWithTax: variant.priceWithTax,
            stockLevel: variant.stockLevel,
        })),
    }), [product.variants, buildCurrencyCode]);
    const {data: livePricing, loading: pricingLoading} = useLiveProductPricing(
        product.slug,
        buildPricing,
        buildCurrencyCode,
        {refreshStock: true}
    );
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    // Seeded from the variant the current URL resolved to (server-side, in
    // routes/page.tsx) rather than read here via next/navigation's
    // useSearchParams(), which requires a Suspense boundary or de-opts this
    // entire page to client-side-only rendering (no static HTML at all — see
    // docs/decisions.md).
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};
        const initialVariant = product.variants.find((v) => v.id === initialVariantId) ?? product.variants[0];
        initialVariant?.options.forEach((option) => {
            initialOptions[option.groupId] = option.id;
        });
        return initialOptions;
    });

    // Find the matching variant based on selected options
    const selectedVariant = useMemo(() => {
        if (product.variants.length === 1) {
            return product.variants[0];
        }

        // If not all option groups have a selection, return null
        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        // Find variant that matches all selected options
        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        const nextOptions = {...selectedOptions, [groupId]: optionId};
        setSelectedOptions(nextOptions);

        // Only navigate once every option group has a selection — until then
        // there's no single matching variant (and therefore no prerendered
        // page) to go to yet.
        if (Object.keys(nextOptions).length !== product.optionGroups.length) {
            return;
        }

        const targetVariant = product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            return Object.values(nextOptions).every((optId) => variantOptionIds.includes(optId));
        });

        if (!targetVariant) return;

        // Each variant has its own prerendered static page (routes/page.tsx's
        // generateStaticParams enumerates one per non-default variant), so
        // this is a real navigation to already-rendered content — its price
        // is genuinely present in that page's HTML, not just updated in the
        // live DOM. The default variant (product.variants[0]) lives at the
        // product's own bare URL rather than a `/[sku]` sub-path.
        const isDefaultVariant = targetVariant.id === product.variants[0]?.id;
        router.push(
            isDefaultVariant ? `/product/${product.slug}` : `/product/${product.slug}/${targetVariant.sku}`,
            {scroll: false}
        );
    };

    const handleAddToCart = (buyNow = false) => {
        if (!selectedVariant) return;
        setIsBuyingNow(buyNow);

        startTransition(async () => {
            const result = await addToCart(selectedVariant.id, quantity);

            if (result.success) {
                if (buyNow) {
                    router.push('/checkout');
                    return;
                }
                setIsAdded(true);
                toast.success(t('addedToCartMessage'), {
                    description: t('addedToCartDescription', {name: product.name}),
                });

                // Reset the added state after 2 seconds
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                toast.error(t('errorTitle'), {
                    description: result.error || t('errorAddToCart'),
                });
            }
        });
    };

    // Price/stock are currency-dependent, so the live-fetched value (correct
    // for the viewer's active currency) takes over once it resolves. Until
    // then, fall back to the real price/stock already fetched server-side at
    // build time (`selectedVariant`) so a genuine value is always shown —
    // both on first paint and in the statically-exported HTML for SEO —
    // instead of a skeleton.
    const liveVariant = selectedVariant
        ? livePricing?.variants.find((variant) => variant.id === selectedVariant.id)
        : undefined;
    const displayVariant = liveVariant
        ? {priceWithTax: liveVariant.priceWithTax, stockLevel: liveVariant.stockLevel}
        : selectedVariant
            ? {priceWithTax: selectedVariant.priceWithTax, stockLevel: selectedVariant.stockLevel}
            : undefined;
    const displayCurrencyCode = livePricing?.currencyCode ?? buildCurrencyCode;
    const isCheckingAvailability = pricingLoading && !liveVariant;
    const isInStock = !!displayVariant && displayVariant.stockLevel !== 'OUT_OF_STOCK';
    const isLowStock = displayVariant?.stockLevel === 'LOW_STOCK';
    const summary = stripHtml(product.description);
    const canAddToCart = !!selectedVariant && !isCheckingAvailability && isInStock;

    const addToCartLabel = isPending && !isBuyingNow
        ? t('adding')
        : !selectedVariant && product.optionGroups.length > 0
            ? t('selectOptions')
            : selectedVariant && isCheckingAvailability
                ? t('checkingAvailability')
                : !isInStock
                    ? t('outOfStock')
                    : t('addToCart');

    // Presentation only: an out-of-stock variant (Vendure's own answer —
    // build-time until the live fetch resolves) swaps the purchase buttons
    // for an availability enquiry as the primary action. The add-to-cart
    // logic above is untouched; its button stays visible but disabled.
    const showEnquiryInstead = !!displayVariant && !isInStock;
    const enquiryHref = `/contact?product=${encodeURIComponent(product.slug)}#enquiry`;

    return (
        <div className="space-y-7">
            {/* Category, Title, SKU, value proposition */}
            <div className="space-y-4">
                {category && (
                    <Link
                        href={`/collection/${category.slug}`}
                        className="spec-label inline-flex items-center gap-2 rounded-md border border-brand/20 bg-brand/[0.06] px-2.5 py-1.5 text-brand transition-colors hover:border-brand/40 hover:bg-brand/10"
                    >
                        {category.name}
                    </Link>
                )}
                <h1 className="font-display-wide text-[2rem] font-bold leading-[1.04] sm:text-[2.5rem] lg:text-[2.75rem]">{product.name}</h1>
                {selectedVariant && (
                    <p className="spec-label text-steel">
                        {t('skuLabel')} <span className="text-foreground">{selectedVariant.sku}</span>
                    </p>
                )}
                {/* Excerpt of the real Vendure description — omitted when empty, never invented. */}
                {summary && (
                    <p className="line-clamp-3 max-w-xl text-base leading-relaxed text-muted-foreground">{summary}</p>
                )}
            </div>

            {/* Price & availability */}
            {displayVariant && (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-y border-border py-5">
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-[1.75rem] font-bold leading-none tracking-tight tabular-nums sm:text-3xl">
                        <DiscountedPrice
                            value={displayVariant.priceWithTax}
                            currencyCode={displayCurrencyCode}
                            mrpFor={selectedVariant ? {slug: product.slug, variantId: selectedVariant.id} : undefined}
                            fallback={<span className="font-sans text-base font-medium text-muted-foreground">{t('priceUnavailable')}</span>}
                        />
                        <span className="font-sans text-xs font-medium tracking-normal text-muted-foreground">{t('inclusiveOfTaxes')}</span>
                    </p>
                    <StockBadge inStock={isInStock} lowStock={isLowStock} className="h-7 px-3" />
                </div>
            )}

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-5">
                    {product.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <p id={`option-group-${group.id}`} className="spec-label text-steel">
                                {group.name}
                            </p>
                            <RadioGroup
                                aria-labelledby={`option-group-${group.id}`}
                                value={selectedOptions[group.id] || ''}
                                onValueChange={(value) => handleOptionChange(group.id, value)}
                            >
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                    {group.options.map((option) => (
                                        <div key={option.id}>
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={option.id}
                                                className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-foreground/15 bg-card px-3 py-2.5 text-center text-sm font-semibold transition-[border-color,background-color,box-shadow] hover:border-foreground/35 peer-focus-visible:ring-3 peer-focus-visible:ring-brand/40 peer-data-[checked]:border-brand peer-data-[checked]:bg-brand/[0.06] peer-data-[checked]:text-brand peer-data-[checked]:shadow-[0_0_0_1px_var(--brand)]"
                                            >
                                                {option.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            )}

            {/* Purchase / enquiry actions */}
            <div className="space-y-3">
                {showEnquiryInstead ? (
                    <>
                        <p className="flex items-start gap-2.5 rounded-lg border border-stock-out/20 bg-stock-out/[0.06] px-4 py-3 text-sm leading-relaxed text-foreground">
                            <PackageX aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-stock-out" />
                            {t('outOfStockNotice')}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <QuoteButton product={product.slug} className={cn(primaryAction, 'sm:col-span-1')}>
                                <MessageSquareText aria-hidden="true" className="size-5" />
                                {t('askAvailability')}
                            </QuoteButton>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 rounded-lg border-foreground/15 text-base font-semibold text-muted-foreground"
                                disabled
                            >
                                <ShoppingCart className="mr-2 size-5"/>
                                {addToCartLabel}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="spec-label text-steel">{t('quantity')}</span>
                            <div className="flex items-center rounded-lg border border-foreground/15 bg-card">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-11 rounded-l-lg rounded-r-none"
                                    disabled={quantity <= 1}
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    aria-label={t('decreaseQuantity')}
                                >
                                    <Minus className="size-4"/>
                                </Button>
                                <span className="w-10 text-center font-bold tabular-nums" aria-live="polite">{quantity}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-11 rounded-l-none rounded-r-lg"
                                    disabled={quantity >= MAX_QUANTITY || !isInStock}
                                    onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                                    aria-label={t('increaseQuantity')}
                                >
                                    <Plus className="size-4"/>
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                size="lg"
                                className={cn(primaryAction, 'disabled:opacity-60')}
                                disabled={!canAddToCart || isPending}
                                onClick={() => handleAddToCart(false)}
                            >
                                {isAdded ? (
                                    <>
                                        <CheckCircle2 className="size-5"/>
                                        {t('addedToCart')}
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="size-5"/>
                                        {addToCartLabel}
                                    </>
                                )}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 rounded-lg border-logo-blue bg-logo-blue text-base font-semibold text-white hover:bg-logo-blue-deep hover:text-white"
                                disabled={!canAddToCart || isPending}
                                onClick={() => handleAddToCart(true)}
                            >
                                <Zap className="mr-2 size-5"/>
                                {isPending && isBuyingNow ? t('adding') : t('buyNow')}
                            </Button>
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="size-3.5 shrink-0" />
                            {t('secureCheckoutNote')}
                        </p>
                    </>
                )}

                {/* Secondary actions. The enquiry form pre-selects the product from `?product=<slug>`. */}
                <div className="grid gap-2.5 pt-1 min-[420px]:grid-cols-2 xl:grid-cols-3">
                    <WishlistButton productId={product.id} name={product.name} variant="full" className="w-full" />
                    <Link href={enquiryHref} className={secondaryAction}>
                        <MessageSquareText aria-hidden="true" className="size-[18px]" />
                        {t('productEnquiry')}
                    </Link>
                    <QuoteButton product={product.slug} className={cn(secondaryAction, '[&_svg]:size-[18px] min-[420px]:col-span-2 xl:col-span-1')} />
                </div>
            </div>

            {/* Trust list — only what the store actually does (see the
                Delivery & Support tab for the full statements). */}
            <ul className="grid gap-x-6 gap-y-3 border-t border-border pt-6 text-sm sm:grid-cols-2">
                {[
                    {label: t('trustSecure')},
                    {label: t('trustDelivery')},
                    {label: t('trustSupport'), href: enquiryHref},
                    {label: t('trustAfterSales'), href: enquiryHref},
                ].map(({label, href}) => (
                    <li key={label} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                            <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        {href ? (
                            <Link href={href} className="font-medium text-foreground underline-offset-4 hover:text-brand hover:underline">{label}</Link>
                        ) : (
                            <span className="font-medium text-foreground">{label}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Local copies of the site button shapes (features can't import `site/`).
const primaryAction = 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-base font-semibold text-brand-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.18)_inset,0_10px_26px_-14px_var(--brand)] transition-[transform,background-color,box-shadow] duration-200 outline-none hover:-translate-y-0.5 hover:bg-[oklch(0.52_0.17_37)] focus-visible:ring-3 focus-visible:ring-brand/40 active:translate-y-px [&_svg]:shrink-0';
const secondaryAction = 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-card px-4 text-sm font-semibold text-foreground transition-[border-color,box-shadow,color] duration-200 outline-none hover:border-foreground/35 hover:shadow-[0_10px_24px_-18px_rgb(0_0_0/0.4)] focus-visible:ring-3 focus-visible:ring-brand/40 [&_svg]:shrink-0';

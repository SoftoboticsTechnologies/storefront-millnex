'use client';

import {useState, useMemo, useTransition} from 'react';
import {useRouter} from '@/platform/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Separator} from '@/components/ui/separator';
import {ShoppingCart, CheckCircle2, Minus, Plus, Zap, Lock, MessageSquareText} from 'lucide-react';
import {WishlistButton} from './wishlist-button';
import {Link} from '@/platform/i18n/navigation';
import {stripHtml} from '@/features/products/product-card-data';
import {addToCart} from '@/features/products/add-to-cart';
import {toast} from 'sonner';
import {Price} from '@/features/pricing/price';
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
    // currency — passed as initialData so useLiveProductPricing can skip its
    // re-fetch entirely when the viewer's currency matches (the common
    // case), instead of always refetching on every PDP mount.
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
        buildCurrencyCode
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

    return (
        <div className="space-y-6">
            {/* Category, Title, Price & Availability */}
            <div className="space-y-3">
                {category && (
                    <Link href={`/collection/${category.slug}`} className="text-xs font-bold uppercase tracking-[0.16em] text-brand hover:underline">
                        {category.name}
                    </Link>
                )}
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{product.name}</h1>
                {displayVariant && (
                    <p className="text-2xl font-extrabold tracking-tight md:text-3xl">
                        <Price value={displayVariant.priceWithTax} currencyCode={displayCurrencyCode}/>
                        <span className="ml-2 align-middle text-xs font-medium text-muted-foreground">{t('inclusiveOfTaxes')}</span>
                    </p>
                )}
                {displayVariant && (
                    <p className="text-sm">
                        {!isInStock ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-destructive">
                                <span className="size-2 rounded-full bg-destructive" />
                                {t('outOfStock')}
                            </span>
                        ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                                <span className="size-2 rounded-full bg-amber-500" />
                                {t('lowStock')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                                <span className="size-2 rounded-full bg-emerald-600" />
                                {t('inStock')}
                            </span>
                        )}
                    </p>
                )}
            </div>

            {summary && (
                <p className="line-clamp-4 text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
            )}

            <Separator />

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-5">
                    {product.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <Label className="text-sm font-bold">
                                {group.name}
                            </Label>
                            <RadioGroup
                                value={selectedOptions[group.id] || ''}
                                onValueChange={(value) => handleOptionChange(group.id, value)}
                            >
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {group.options.map((option) => (
                                        <div key={option.id}>
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={option.id}
                                                className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-border bg-card px-4 py-3 text-sm font-semibold transition-all hover:border-foreground/30 peer-data-[checked]:border-brand peer-data-[checked]:bg-brand/5 peer-data-[checked]:ring-2 peer-data-[checked]:ring-brand/20"
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

            {/* Quantity + Add to Cart / Buy Now */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{t('quantity')}</span>
                    <div className="flex items-center rounded-xl border border-border bg-card">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-10 rounded-l-xl rounded-r-none"
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
                            className="size-10 rounded-l-none rounded-r-xl"
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
                        className="h-12 rounded-xl bg-brand text-base font-bold text-brand-foreground hover:bg-brand/90"
                        disabled={!canAddToCart || isPending}
                        onClick={() => handleAddToCart(false)}
                    >
                        {isAdded ? (
                            <>
                                <CheckCircle2 className="mr-2 size-5"/>
                                {t('addedToCart')}
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 size-5"/>
                                {addToCartLabel}
                            </>
                        )}
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-12 rounded-xl border-foreground/20 text-base font-bold"
                        disabled={!canAddToCart || isPending}
                        onClick={() => handleAddToCart(true)}
                    >
                        <Zap className="mr-2 size-5"/>
                        {isPending && isBuyingNow ? t('adding') : t('buyNow')}
                    </Button>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5" />
                    {t('secureCheckoutNote')}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                    <WishlistButton productId={product.id} name={product.name} variant="full" />
                    {/* The enquiry form pre-selects the product from `?product=<slug>`. */}
                    <Link
                        href={`/contact?product=${encodeURIComponent(product.slug)}#enquiry`}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition-colors hover:border-foreground/30 hover:bg-muted"
                    >
                        <MessageSquareText className="size-[18px]" />
                        {t('productEnquiry')}
                    </Link>
                </div>
            </div>

            {/* SKU */}
            {selectedVariant && (
                <p className="text-xs text-muted-foreground">
                    {t('sku', {sku: selectedVariant.sku})}
                </p>
            )}
        </div>
    );
}

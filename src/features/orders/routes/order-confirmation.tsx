'use client';

import {useEffect, useState} from 'react';
import type {ResultOf} from 'gql.tada';
import {useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Check, ShoppingBag, ClipboardList, Loader2} from 'lucide-react';
import {Link} from '@/platform/i18n/navigation';
import Image from 'next/image';
import {Separator} from '@/components/ui/separator';
import {Price} from '@/features/pricing/price';
import {useTranslations} from 'next-intl';
import {query} from '@/platform/vendure/client-api';
import {GetOrderByCodeQuery} from '@/features/orders/graphql';
import {PaymentProcessingBanner} from './payment-processing-banner';

type OrderByCode = ResultOf<typeof GetOrderByCodeQuery>['orderByCode'];

// Vendure only grants anonymous access to `orderByCode` once the order has
// been placed (`orderPlacedAt` set), which happens when the Stripe webhook
// settles payment — not immediately after the client-side redirect. Until
// then this query is denied with an auth error; treat that as "still
// processing" rather than a hard failure.
async function fetchOrderByCode(code: string): Promise<OrderByCode | null> {
    try {
        const {data} = await query(GetOrderByCodeQuery, {code}, {useAuthToken: true});
        return data.orderByCode;
    } catch {
        return null;
    }
}

export function OrderConfirmation() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || '';
    const t = useTranslations('OrderConfirmation');
    const [order, setOrder] = useState<OrderByCode | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!code) {
            setIsLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            const result = await fetchOrderByCode(code);
            if (!cancelled) {
                setOrder(result);
                setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [code]);

    if (isLoading) {
        return (
            <div className="site-container pb-20 pt-24 sm:pt-28 lg:pt-36 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="site-container pb-20 pt-24 sm:pt-28 lg:pt-36">
                <div className="max-w-3xl mx-auto">
                    <PaymentProcessingBanner code={code} onOrderUpdate={setOrder} />
                </div>
            </div>
        );
    }

    return (
        <div className="site-container pb-20 pt-24 sm:pt-28 lg:pt-36">
            <div className="max-w-3xl mx-auto">
                {order.state === 'ArrangingPayment' && (
                    <PaymentProcessingBanner code={code} onOrderUpdate={setOrder} />
                )}

                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="rounded-2xl bg-brand p-5 shadow-[0_28px_50px_-30px_rgb(15_20_30/0.6)]">
                            <Check className="h-10 w-10 text-brand-foreground" strokeWidth={3} />
                        </div>
                    </div>
                    <h1 className="mb-3 font-display-wide text-3xl font-extrabold tracking-tight sm:text-5xl">{t('orderConfirmed')}</h1>
                    <p className="text-muted-foreground">
                        {t('thankYou')}{' '}
                        <span className="font-mono font-semibold text-foreground">{order.code}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('emailConfirmation')}
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="font-display text-base font-bold">{t('orderSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.lines.map((line) => (
                            <div key={line.id} className="flex gap-4 items-center">
                                {line.productVariant.product.featuredAsset && (
                                    <div className="flex-shrink-0 rounded-lg border border-border bg-stage">
                                        <Image
                                            src={line.productVariant.product.featuredAsset.preview}
                                            alt={line.productVariant.name}
                                            width={80}
                                            height={80}
                                            className="h-20 w-20 rounded-lg object-contain p-1 mix-blend-multiply"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-display font-bold">{line.productVariant.product.name}</p>
                                    {line.productVariant.name !== line.productVariant.product.name && (
                                        <p className="text-sm text-muted-foreground">
                                            {line.productVariant.name}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('qty', {quantity: line.quantity})}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        <Price value={line.linePriceWithTax} currencyCode={order.currencyCode}/>
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Separator/>

                        <div className="flex justify-between items-baseline font-display font-extrabold text-lg">
                            <span>{t('total')}</span>
                            <span className="text-xl">
                                <Price value={order.totalWithTax} currencyCode={order.currencyCode}/>
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {order.shippingAddress && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="font-display text-base font-bold">{t('shippingAddress')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {order.shippingAddress.streetLine1}
                                {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                                {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button nativeButton={false} render={<Link href="/" />} className="h-12 flex-1 rounded-lg bg-brand font-semibold text-brand-foreground hover:bg-brand/90" size="lg">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {t('continueShopping')}
                    </Button>
                    <Button nativeButton={false} render={<Link href="/account/orders" />} variant="outline" className="h-12 flex-1 rounded-lg font-semibold" size="lg">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        {t('viewOrders')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

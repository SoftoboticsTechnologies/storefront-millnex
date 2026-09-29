'use client';

import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowRight, Package} from 'lucide-react';
import type {ResultOf} from '@/platform/vendure/graphql';
import {Link} from '@/platform/i18n/navigation';
import {formatDate} from '@/platform/i18n/format';
import {Price} from '@/features/pricing/price';
import {OrderStatusBadge} from '@/features/orders/order-status-badge';
import type {GetCustomerOrdersQuery} from '@/features/account/graphql';

type OrderListItem = NonNullable<ResultOf<typeof GetCustomerOrdersQuery>['activeCustomer']>['orders']['items'][number];

/** One order as a card — first line's product image + name, all from the orders query. */
export function RecentOrderCard({order, locale}: {order: OrderListItem; locale: string}) {
    const t = useTranslations('Account');
    const firstLine = order.lines[0];
    const product = firstLine?.productVariant.product;
    const moreLines = order.lines.length - 1;
    const href = `/account/orders?code=${order.code}`;

    return (
        <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-stage sm:size-20">
                    {product?.featuredAsset ? (
                        <Image
                            src={`${product.featuredAsset.preview}?preset=small`}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-contain p-1 mix-blend-multiply"
                        />
                    ) : (
                        <span className="flex size-full items-center justify-center text-steel">
                            <Package className="size-5 opacity-60" />
                        </span>
                    )}
                </div>
                <div className="min-w-0">
                    {product && (
                        <p className="line-clamp-1 font-display font-bold">
                            {product.name}
                            {moreLines > 0 && <span className="font-sans text-sm font-normal text-muted-foreground"> {t('andMore', {count: moreLines})}</span>}
                        </p>
                    )}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="spec-label text-foreground">#{order.code}</span>
                        <span>{formatDate(order.createdAt, 'short', locale)}</span>
                    </p>
                    <div className="mt-2"><OrderStatusBadge state={order.state} /></div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <span className="font-display text-lg font-extrabold tabular-nums">
                    <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                </span>
                <Link href={href} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold transition-colors hover:border-foreground/30 hover:bg-surface">
                    {t('viewOrder')}
                    <ArrowRight className="size-4" />
                </Link>
            </div>
        </li>
    );
}

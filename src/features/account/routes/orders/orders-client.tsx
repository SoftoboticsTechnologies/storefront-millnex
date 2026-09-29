'use client';

import {useEffect, useState} from 'react';
import type {ResultOf} from '@/platform/vendure/graphql';
import {useParams, useSearchParams} from 'next/navigation';
import {query} from '@/platform/vendure/client-api';
import {GetCustomerOrdersQuery} from '@/features/account/graphql';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {ArrowRight, Package} from 'lucide-react';
import {RecentOrderCard} from '@/features/account/components/order-card';
import {Link} from '@/platform/i18n/navigation';
import {useTranslations} from 'next-intl';
import {OrderDetail} from './order-detail';

type ActiveCustomerOrders = NonNullable<ResultOf<typeof GetCustomerOrdersQuery>['activeCustomer']>;
type OrderListItem = ActiveCustomerOrders['orders']['items'][number];

const ITEMS_PER_PAGE = 10;

function OrdersHeading({title, count}: {title: string; count?: string}) {
    return (
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
            <h1 className="font-display-wide text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
            {count && <span className="spec-label text-steel">{count}</span>}
        </header>
    );
}

function OrdersList() {
    const {locale} = useParams<{locale: string}>();
    const searchParams = useSearchParams();
    const t = useTranslations('Account');
    const [orders, setOrders] = useState<OrderListItem[] | null>(null);
    const [totalItems, setTotalItems] = useState(0);

    const pageParam = searchParams.get('page');
    const currentPage = parseInt(pageParam || '1', 10);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const {data} = await query(
                GetCustomerOrdersQuery,
                {
                    options: {
                        take: ITEMS_PER_PAGE,
                        skip,
                        filter: {
                            state: {
                                notEq: 'AddingItems',
                            },
                        },
                    },
                },
                {useAuthToken: true}
            );
            if (!cancelled) {
                setOrders(data.activeCustomer?.orders.items ?? []);
                setTotalItems(data.activeCustomer?.orders.totalItems ?? 0);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [skip]);

    if (!orders) {
        return (
            <div aria-busy="true">
                <OrdersHeading title={t('myOrders')} />
                <div className="space-y-3">
                    {Array.from({length: 3}).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div>
            <OrdersHeading title={t('myOrders')} count={totalItems > 0 ? t('ordersCount', {count: totalItems}) : undefined} />

            {orders.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-5 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-card text-steel">
                        <Package className="size-5" />
                    </span>
                    <p className="mt-4 text-sm text-muted-foreground">{t('noOrders')}</p>
                    <Link href="/shop" className="group mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-brand-foreground hover:bg-brand/90">
                        {t('startShopping')}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            ) : (
                <>
                    <ul className="space-y-3">
                        {orders.map((order) => <RecentOrderCard key={order.id} order={order} locale={locale} />)}
                    </ul>

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                currentPage > 1
                                                    ? `/account/orders?page=${currentPage - 1}`
                                                    : '#'
                                            }
                                            className={
                                                currentPage === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from({length: totalPages}, (_, i) => i + 1).map(
                                        (page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 &&
                                                    page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            href={`/account/orders?page=${page}`}
                                                            isActive={page === currentPage}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        }
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                currentPage < totalPages
                                                    ? `/account/orders?page=${currentPage + 1}`
                                                    : '#'
                                            }
                                            className={
                                                currentPage === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function OrdersClient() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    if (code) {
        return <OrderDetail code={code} />;
    }

    return <OrdersList />;
}

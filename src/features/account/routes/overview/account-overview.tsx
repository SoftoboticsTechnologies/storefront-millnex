'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {ArrowRight, MapPin, Package, User} from 'lucide-react';
import type {ResultOf} from '@/platform/vendure/graphql';
import {query} from '@/platform/vendure/client-api';
import {Link} from '@/platform/i18n/navigation';
import {formatDate} from '@/platform/i18n/format';
import {Price} from '@/features/pricing/price';
import {OrderStatusBadge} from '@/features/orders/order-status-badge';
import {useActiveCustomer} from '@/features/account/customer';
import {GetCustomerOrdersQuery} from '@/features/account/graphql';

type OrderListItem = NonNullable<ResultOf<typeof GetCustomerOrdersQuery>['activeCustomer']>['orders']['items'][number];

const RECENT_ORDERS = 3;

/**
 * Account dashboard: the signed-in customer (from AuthProvider) plus their
 * most recent placed orders, straight from Vendure. The surrounding account
 * layout already redirects signed-out visitors to /sign-in.
 */
export function AccountOverview() {
    const t = useTranslations('Account');
    const locale = useLocale();
    const {customer} = useActiveCustomer();
    const [orders, setOrders] = useState<OrderListItem[] | null>(null);
    const [totalOrders, setTotalOrders] = useState(0);
    const [ordersFailed, setOrdersFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        query(
            GetCustomerOrdersQuery,
            {options: {take: RECENT_ORDERS, sort: {createdAt: 'DESC'}, filter: {state: {notEq: 'AddingItems'}}}},
            {useAuthToken: true},
        )
            .then(({data}) => {
                if (cancelled) return;
                setOrders(data.activeCustomer?.orders.items ?? []);
                setTotalOrders(data.activeCustomer?.orders.totalItems ?? 0);
            })
            .catch(() => {
                if (!cancelled) setOrdersFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const shortcuts = [
        {href: '/account/orders', icon: Package, title: t('orders'), body: t('ordersShortcut')},
        {href: '/account/addresses', icon: MapPin, title: t('addresses'), body: t('addressesShortcut')},
        {href: '/account/profile', icon: User, title: t('profile'), body: t('profileShortcut')},
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold tracking-tight">
                    {customer?.firstName ? t('welcomeBack', {name: customer.firstName}) : t('pageTitle')}
                </h1>
                {customer?.emailAddress && <p className="mt-1 text-muted-foreground">{customer.emailAddress}</p>}
            </header>

            <ul className="grid gap-4 sm:grid-cols-3">
                {shortcuts.map(({href, icon: Icon, title, body}) => (
                    <li key={href}>
                        <Link href={href} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Icon className="size-5" />
                            </span>
                            <span className="mt-4 font-bold">{title}</span>
                            <span className="mt-1 text-sm text-muted-foreground">{body}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <section className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="font-bold">{t('recentOrders')}</h2>
                    {totalOrders > 0 && (
                        <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                            {t('viewAllOrders')}
                            <ArrowRight className="size-4" />
                        </Link>
                    )}
                </div>
                {ordersFailed ? (
                    <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t('ordersLoadError')}</p>
                ) : orders === null ? (
                    <div className="space-y-3 p-5" aria-busy="true">
                        {Array.from({length: 2}).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <p className="text-sm text-muted-foreground">{t('noOrders')}</p>
                        <Link href="/shop" className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground hover:bg-brand/90">
                            {t('startShopping')}
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {orders.map((order) => (
                            <li key={order.id}>
                                <Link href={`/account/orders?code=${order.code}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-muted/40">
                                    <span className="font-mono text-sm font-semibold">{order.code}</span>
                                    <span className="text-sm text-muted-foreground">{formatDate(order.createdAt, 'short', locale)}</span>
                                    <OrderStatusBadge state={order.state} />
                                    <span className="ml-auto text-sm font-bold">
                                        <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

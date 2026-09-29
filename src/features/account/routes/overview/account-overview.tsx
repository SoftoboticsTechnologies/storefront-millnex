'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {ArrowRight, ArrowUpRight, Heart, MapPin, Package, User} from 'lucide-react';
import type {ResultOf} from '@/platform/vendure/graphql';
import {query} from '@/platform/vendure/client-api';
import {Link} from '@/platform/i18n/navigation';
import {useActiveCustomer} from '@/features/account/customer';
import {RecentOrderCard} from '@/features/account/components/order-card';
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

    const fullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
    const shortcuts = [
        {
            href: '/account/orders',
            icon: Package,
            title: t('orders'),
            // Real count from the orders query this page already runs.
            summary: orders !== null && !ordersFailed ? t('ordersCount', {count: totalOrders}) : null,
            body: t('ordersShortcut'),
        },
        {
            href: '/wishlist',
            icon: Heart,
            title: t('wishlist'),
            summary: null,
            body: t('wishlistShortcut'),
        },
        {href: '/account/addresses', icon: MapPin, title: t('addresses'), summary: null, body: t('addressesShortcut')},
        {
            href: '/account/profile',
            icon: User,
            title: t('accountDetails'),
            summary: fullName || null,
            body: customer?.emailAddress ?? t('profileShortcut'),
        },
    ];

    return (
        <div className="space-y-10">
            <header className="border-b border-border pb-6">
                <p className="spec-label text-steel">{t('pageTitle')}</p>
                <h1 className="mt-2 font-display-wide text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {customer?.firstName ? t('welcomeBack', {name: customer.firstName}) : t('pageTitle')}
                </h1>
                <p className="mt-2 text-muted-foreground">{t('dashboardIntro')}</p>
            </header>

            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {shortcuts.map(({href, icon: Icon, title, summary, body}) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-[0_28px_50px_-34px_rgb(15_20_30/0.5)]"
                        >
                            <span className="flex items-start justify-between gap-3">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                    <Icon className="size-5" />
                                </span>
                                <ArrowUpRight className="size-4 text-steel transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                            </span>
                            <span className="mt-4 font-display font-bold">{title}</span>
                            {summary && <span className="spec-label mt-1 truncate text-foreground">{summary}</span>}
                            <span className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{body}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <section aria-labelledby="recent-orders-heading">
                <div className="mb-4 flex items-end justify-between gap-3">
                    <h2 id="recent-orders-heading" className="font-display-wide text-xl font-extrabold">{t('recentOrders')}</h2>
                    {totalOrders > 0 && (
                        <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                            {t('viewAllOrders')}
                            <ArrowRight className="size-4" />
                        </Link>
                    )}
                </div>
                {ordersFailed ? (
                    <p className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">{t('ordersLoadError')}</p>
                ) : orders === null ? (
                    <div className="space-y-3" aria-busy="true">
                        {Array.from({length: 2}).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-5 py-12 text-center">
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
                    <ul className="space-y-3">
                        {orders.map((order) => <RecentOrderCard key={order.id} order={order} locale={locale} />)}
                    </ul>
                )}
            </section>
        </div>
    );
}

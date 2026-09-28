'use client';

import {useCallback, useEffect, useState} from 'react';
import {useLocale} from 'next-intl';
import {query} from '@/platform/vendure/client-api';
import {AUTH_TOKEN_CHANGED_EVENT} from '@/platform/vendure/auth-token';
import type {ResultOf} from '@/platform/vendure/graphql';
import {getActiveCurrencyCode} from '@/features/currency/currency-client';
import {GetActiveOrderQuery} from './graphql';
import {CART_CHANGED_EVENT} from './cart-events';

export type ActiveOrder = NonNullable<ResultOf<typeof GetActiveOrderQuery>['activeOrder']>;

// Several components read the ActiveOrder at once (navbar badge, cart
// drawer, mobile tab bar). They all refetch on the same CART_CHANGED_EVENT,
// so share one in-flight request per locale instead of firing one each.
// This is request de-duplication only — Vendure's ActiveOrder stays the sole
// cart state; nothing is cached between requests.
const inflight = new Map<string, Promise<ActiveOrder | null>>();

function fetchActiveOrder(locale: string): Promise<ActiveOrder | null> {
    const pending = inflight.get(locale);
    if (pending) return pending;

    const request = getActiveCurrencyCode()
        .then((currencyCode) => query(GetActiveOrderQuery, {}, {useAuthToken: true, languageCode: locale, currencyCode}))
        .then(({data}) => data.activeOrder ?? null)
        .finally(() => inflight.delete(locale));
    inflight.set(locale, request);
    return request;
}

/**
 * The shopper's Vendure ActiveOrder, kept in sync with every cart mutation
 * (CART_CHANGED_EVENT) and sign-in/out (AUTH_TOKEN_CHANGED_EVENT).
 * `error` is set when Vendure couldn't be reached — callers show a retry
 * rather than an empty cart.
 */
export function useActiveOrder() {
    const locale = useLocale();
    const [order, setOrder] = useState<ActiveOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const refresh = useCallback(async () => {
        try {
            setOrder(await fetchActiveOrder(locale));
            setError(false);
        } catch {
            setError(true);
        } finally {
            setIsLoading(false);
        }
    }, [locale]);

    useEffect(() => {
        refresh();
        window.addEventListener(CART_CHANGED_EVENT, refresh);
        window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, refresh);
        return () => {
            window.removeEventListener(CART_CHANGED_EVENT, refresh);
            window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, refresh);
        };
    }, [refresh]);

    return {order, isLoading, error, refresh, itemCount: order?.totalQuantity ?? 0};
}

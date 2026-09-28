'use client';

import {useCallback, useSyncExternalStore} from 'react';

/**
 * Device-local wishlist: the Vendure Shop API has no wishlist, so saved
 * products are kept as a list of Vendure product IDs in localStorage. Only
 * the IDs are stored — names, images, prices and stock are always re-read
 * from Vendure when the wishlist is shown. This is not a cart and never
 * feeds the ActiveOrder.
 */
const STORAGE_KEY = 'millnex-wishlist';
const CHANGED_EVENT = 'wishlist-changed';
const EMPTY: readonly string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: readonly string[] = EMPTY;

function readIds(): readonly string[] {
    let raw: string | null = null;
    try {
        raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return EMPTY;
    }
    // useSyncExternalStore needs a stable snapshot between changes.
    if (raw === cachedRaw) return cachedIds;
    cachedRaw = raw;
    try {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        cachedIds = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : EMPTY;
    } catch {
        cachedIds = EMPTY;
    }
    return cachedIds;
}

function writeIds(ids: readonly string[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Storage blocked (private mode, site data disabled) — nothing to persist to.
    }
    window.dispatchEvent(new Event(CHANGED_EVENT));
}

function subscribe(onChange: () => void) {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) onChange();
    };
    window.addEventListener(CHANGED_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener(CHANGED_EVENT, onChange);
        window.removeEventListener('storage', onStorage);
    };
}

export function useWishlist() {
    const ids = useSyncExternalStore(subscribe, readIds, () => EMPTY);

    const toggle = useCallback((productId: string) => {
        const current = readIds();
        writeIds(current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
    }, []);

    /** Drop IDs Vendure no longer returns (product deleted or disabled). */
    const retain = useCallback((productIds: readonly string[]) => {
        const keep = new Set(productIds);
        const current = readIds();
        if (current.some((id) => !keep.has(id))) writeIds(current.filter((id) => keep.has(id)));
    }, []);

    return {ids, has: (productId: string) => ids.includes(productId), toggle, retain};
}

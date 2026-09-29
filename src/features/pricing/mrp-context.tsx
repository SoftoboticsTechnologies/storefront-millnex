'use client';

import {createContext, useContext, type ReactNode} from 'react';
import type {MrpCatalog} from './mrp';

const MrpContext = createContext<MrpCatalog>({currencyCode: null, variants: {}, products: {}});

/** Provides the build-time MRP catalog (`getMrpCatalog`) to client price components. */
export function MrpProvider({catalog, children}: {catalog: MrpCatalog; children: ReactNode}) {
    return <MrpContext.Provider value={catalog}>{children}</MrpContext.Provider>;
}

export interface MrpLookup {
    slug: string;
    /** When given, that variant's MRP; otherwise the product's cheapest-variant MRP. */
    variantId?: string;
}

/**
 * The Vendure MRP (minor units) for a product/variant, or null. Only returned
 * when the displayed currency is the one the MRPs were entered in — an INR
 * MRP is never compared against a price shown in another currency.
 */
export function useMrp(lookup: MrpLookup | undefined, currencyCode: string): number | null {
    const catalog = useContext(MrpContext);
    if (!lookup || catalog.currencyCode !== currencyCode) return null;
    return (lookup.variantId ? catalog.variants[lookup.variantId] : catalog.products[lookup.slug]) ?? null;
}

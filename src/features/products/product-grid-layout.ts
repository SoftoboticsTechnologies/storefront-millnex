/**
 * Shared responsive product-grid columns: 2 on phones (cards stay tappable at
 * ~160px), 3 on tablets, 4 on wide desktop. Listing pages with a filter
 * sidebar use `PRODUCT_GRID_CLASS`; full-width homepage rails use
 * `PRODUCT_RAIL_GRID_CLASS`, which reaches 4 columns one breakpoint earlier.
 */
export const PRODUCT_GRID_CLASS = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 2xl:grid-cols-4';

export const PRODUCT_RAIL_GRID_CLASS = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4';

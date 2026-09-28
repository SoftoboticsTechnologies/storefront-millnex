import {graphql} from '@/platform/vendure/graphql';

export const ProductCardFragment = graphql(`
    fragment ProductCard on SearchResult {
        productId
        productName
        slug
        description
        sku
        inStock
        collectionIds
        productAsset {
            id
            preview
        }
        priceWithTax {
            __typename
            ... on PriceRange {
                min
                max
            }
            ... on SinglePrice {
                value
            }
        }
        currencyCode
    }
`);

export const GetProductDetailQuery = graphql(`
    query GetProductDetail($slug: String!) {
        product(slug: $slug) {
            id
            name
            description
            slug
            assets {
                id
                preview
                source
            }
            variants {
                id
                name
                sku
                priceWithTax
                stockLevel
                options {
                    id
                    code
                    name
                    groupId
                    group {
                        id
                        code
                        name
                    }
                }
            }
            optionGroups {
                id
                code
                name
                options {
                    id
                    code
                    name
                }
            }
            collections {
                id
                name
                slug
                parent {
                    id
                }
            }
            facetValues {
                id
                name
                facet {
                    id
                    name
                }
            }
        }
    }
`);

/**
 * Most recently created products, for the homepage "New arrivals" rail.
 * Uses the Product list (not `search`) because Vendure's
 * SearchResultSortParameter has no date field — `createdAt` ordering is only
 * available here. Shop API already restricts this to enabled products in the
 * active channel.
 */
// Same selection as GetNewestProductsQuery so `cardFromProduct` maps both.
export const GetWishlistProductsQuery = graphql(`
    query GetWishlistProducts($ids: [String!]!, $take: Int!) {
        products(options: {take: $take, filter: {id: {in: $ids}}}) {
            totalItems
            items {
                id
                name
                slug
                description
                featuredAsset {
                    id
                    preview
                }
                collections {
                    id
                }
                variants {
                    id
                    sku
                    priceWithTax
                    currencyCode
                    stockLevel
                }
            }
        }
    }
`);

export const GetNewestProductsQuery = graphql(`
    query GetNewestProducts($take: Int!) {
        products(options: {take: $take, sort: {createdAt: DESC}}) {
            totalItems
            items {
                id
                name
                slug
                description
                featuredAsset {
                    id
                    preview
                }
                collections {
                    id
                }
                variants {
                    id
                    sku
                    priceWithTax
                    currencyCode
                    stockLevel
                }
            }
        }
    }
`);

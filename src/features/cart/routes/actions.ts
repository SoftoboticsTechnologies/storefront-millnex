import {mutate} from '@/platform/vendure/client-api';
import {RemoveFromCartMutation, AdjustCartItemMutation, ApplyPromotionCodeMutation, RemovePromotionCodeMutation} from '@/features/cart/graphql';
import {TransitionOrderToStateMutation} from '@/features/checkout/graphql';
import {getActiveCurrencyCode} from '@/features/currency/currency-client';
import {dispatchCartChanged} from '@/features/cart/cart-events';

// Starting checkout moves the order into "ArrangingPayment", which Vendure locks
// against further cart edits. If the customer navigates back to the cart (e.g. after
// abandoning checkout, or a payment attempt that never settled), any cart mutation
// fails with ORDER_MODIFICATION_ERROR. Transitioning back to "AddingItems" is an
// allowed reverse transition, so unlock the order and retry once instead of
// surfacing that error to the customer.
async function withCartModificationRetry<T extends {__typename: string}>(
    perform: () => Promise<T>
): Promise<T> {
    const result = await perform();
    if (result.__typename === 'Order' || !('errorCode' in result) || result.errorCode !== 'ORDER_MODIFICATION_ERROR') {
        return result;
    }

    await mutate(TransitionOrderToStateMutation, {state: 'AddingItems'}, {useAuthToken: true});
    return perform();
}

export async function removeFromCart(lineId: string) {
    const currencyCode = await getActiveCurrencyCode();
    const result = await withCartModificationRetry(async () => {
        const result = await mutate(RemoveFromCartMutation, {lineId}, {useAuthToken: true, currencyCode});
        return result.data.removeOrderLine;
    });
    dispatchCartChanged();
    return result;
}

export async function adjustQuantity(lineId: string, quantity: number) {
    const currencyCode = await getActiveCurrencyCode();
    // Returned so callers can surface Vendure's own error (e.g.
    // INSUFFICIENT_STOCK_ERROR, ORDER_LIMIT_ERROR) — stock limits are
    // enforced by Vendure, never guessed client-side.
    const result = await withCartModificationRetry(async () => {
        const result = await mutate(AdjustCartItemMutation, {lineId, quantity}, {useAuthToken: true, currencyCode});
        return result.data.adjustOrderLine;
    });
    dispatchCartChanged();
    return result;
}

export async function applyPromotionCode(code: string) {
    if (!code) return;

    const currencyCode = await getActiveCurrencyCode();
    await mutate(ApplyPromotionCodeMutation, {couponCode: code}, {useAuthToken: true, currencyCode});
    dispatchCartChanged();
}

export async function removePromotionCode(code: string) {
    if (!code) return;

    const currencyCode = await getActiveCurrencyCode();
    await mutate(RemovePromotionCodeMutation, {couponCode: code}, {useAuthToken: true, currencyCode});
    dispatchCartChanged();
}

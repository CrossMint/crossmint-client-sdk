import { CheckoutEvents, CrossmintEventErrorPayload, PaymentElementSDKEvents } from "./events";
import { Currency, Locale, PaymentMethod, UIConfig } from "./types";

export type Recipient = {
    email?: string;
    wallet?: string;
};

export interface CrossmintCheckoutEvent<K extends CheckoutEvents = CheckoutEvents> {
    type: K;
    payload: CheckoutEventMap[K];
}

// TODO: Remmeber to update this same interface in the Vue component aswell.
// packages/ui/vue-ui/src/components/CrossmintPaymentElement.vue
export interface PaymentElement {
    clientId: string;
    mintArgs?: Record<string, any>;
    recipient?: Recipient;
    paymentMethod?: PaymentMethod;
    currency?: Currency;
    locale?: Locale;
    uiConfig?: UIConfig;
    environment?: string;
    onEvent?(event: CrossmintCheckoutEvent): this;
}

export interface FiatPrice {
    amount: number;
    currency: Currency;
}

interface QuoteBreakdown {
    unitPrice: FiatPrice;
    totalGasFees?: FiatPrice;
    totalCrossmintFees: FiatPrice;
}

interface Quote {
    totalPrice: FiatPrice;
    priceBreakdown: QuoteBreakdown;
}

interface PaymentPricePayload {
    totalQuote: Quote;
}

interface PaymentRejectedPayload extends CrossmintEventErrorPayload {
    orderIdentifier: string;
}

type EmptyObject = Record<string, never>;

interface PaymentCompletedPayload {
    orderIdentifier: string;
}

export interface CheckoutEventMap {
    [CheckoutEvents.PAYMENT_PREPARATION_SUCCEEDED]: PaymentPricePayload;
    [CheckoutEvents.QUOTE_STATUS_CHANGED]: PaymentPricePayload;
    [CheckoutEvents.PAYMENT_PROCESS_STARTED]: EmptyObject;
    [CheckoutEvents.PAYMENT_PREPARATION_FAILED]: CrossmintEventErrorPayload;
    [CheckoutEvents.PAYMENT_PROCESS_SUCCEEDED]: PaymentCompletedPayload;
    [CheckoutEvents.PAYMENT_PROCESS_CANCELED]: EmptyObject;
    [CheckoutEvents.PAYMENT_PROCESS_REJECTED]: PaymentRejectedPayload;
    [CheckoutEvents.MINTING_PROCESS_STARTED]: EmptyObject;
    [CheckoutEvents.TRANSACTION_FULFILLMENT_SUCCEEDED]: EmptyObject;
    [CheckoutEvents.TRANSACTION_FULFILLMENT_FAILED]: EmptyObject;
    [CheckoutEvents.MINTING_PROCESS_FINISHED]: EmptyObject;
}

export type ParamsUpdatePayload = Partial<Record<keyof Omit<PaymentElement, "onEvent" | "environment">, any>>;

export interface SDKEventMap {
    [PaymentElementSDKEvents.PARAMS_UPDATE]: ParamsUpdatePayload;
}

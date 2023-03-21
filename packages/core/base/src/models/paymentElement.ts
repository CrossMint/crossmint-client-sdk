import { CheckoutEvents, CrossmintEventErrorPayload } from "./events";
import { Currency, Locale, PaymentMethod, UIConfig } from "./types";

export type Recipient = {
    email?: string;
    wallet?: string;
};

export interface CrossmintCheckoutEvent<K extends keyof CheckoutEventMap> {
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
    onEvent?<K extends keyof CheckoutEventMap>(event: CrossmintCheckoutEvent<K>): this;
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

interface OrderItem {
    quoute: Quote;
}

interface PaymentPricePayload {
    items: OrderItem[];
    totalQuote: Quote;
}

interface PaymentRejectedPayload extends CrossmintEventErrorPayload {
    orderIdentifier: string;
}

type PaymentStartedPayload = Record<string, never>;

interface PaymentCompletedPayload {
    orderIdentifier: string;
}

export type PaymentEventMap = {
    [CheckoutEvents.PAYMENT_READY]: PaymentPricePayload;
    [CheckoutEvents.PAYMENT_QUOTE_CHANGED]: PaymentPricePayload;
    [CheckoutEvents.PAYMENT_STARTED]: PaymentStartedPayload;
    [CheckoutEvents.PAYMENT_FAILED]: CrossmintEventErrorPayload;
    [CheckoutEvents.PAYMENT_COMPLETED]: PaymentCompletedPayload;
    [CheckoutEvents.PAYMENT_REJECTED]: PaymentRejectedPayload;
};

export type CheckoutEventMap = PaymentEventMap;

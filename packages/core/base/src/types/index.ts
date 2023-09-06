export * from "./blockchain";
export * from "./errors";
export * from "./events";
export * from "./payButton";
export * from "./EmbeddedCheckout";
export * from "./system";
export * from "./uiconfig";

export enum clientNames {
    reactUi = "client-sdk-react-ui",
    vanillaUi = "client-sdk-vanilla-ui",
}

export enum baseUrls {
    prod = "https://www.crossmint.com",
    staging = "https://staging.crossmint.com",
    dev = "http://localhost:3001",
}

export const CryptoPaymentMethod = {
    ETH: "ETH",
    SOL: "SOL",
} as const;
export type CryptoPaymentMethod = (typeof CryptoPaymentMethod)[keyof typeof CryptoPaymentMethod];

export const PaymentMethod = {
    FIAT: "fiat",
    ...CryptoPaymentMethod,
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const paymentMethodIsEth = (paymentMethod?: PaymentMethod) => paymentMethod === "ETH";
export const paymentMethodIsSol = (paymentMethod?: PaymentMethod) => paymentMethod === "SOL";

export type Locale =
    | "en-US"
    | "es-ES"
    | "fr-FR"
    | "it-IT"
    | "ko-KR"
    | "pt-PT"
    | "zh-CN"
    | "zh-TW"
    | "de-DE"
    | "ru-RU"
    | "tr-TR"
    | "uk-UA"
    | "th-TH"
    | "vi-VN"
    | "Klingon";

export type Currency = "usd" | "eur" | "gbp" | "aud" | "sgd" | "hkd" | "krw" | "inr" | "vnd";

export interface FiatPrice {
    amount: string;
    currency: Currency;
}

export type Recipient = {
    email?: string;
    wallet?: string;
};

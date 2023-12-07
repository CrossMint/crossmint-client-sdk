import {
    CrossmintEmbeddedCheckoutProps,
    isCryptoEmbeddedCheckoutProps,
    isFiatEmbeddedCheckoutProps,
} from "@crossmint/client-sdk-base";

import { CrossmintCryptoEmbeddedCheckout } from "./crypto/CryptoEmbeddedCheckout";
import { CrossmintFiatPaymentElement_OLD } from "./fiat/FiatPaymentElement_OLD";

// TODO: Rename to CrossmintEmbeddedCheckout
export function CrossmintPaymentElement(props: CrossmintEmbeddedCheckoutProps) {
    if (isFiatEmbeddedCheckoutProps(props)) {
        return <CrossmintFiatPaymentElement_OLD {...props} />;
    }
    if (isCryptoEmbeddedCheckoutProps(props)) {
        return <CrossmintCryptoEmbeddedCheckout {...props} />;
    }
    throw new Error("Unsupported: Fiat is the only supported payment method.");
}
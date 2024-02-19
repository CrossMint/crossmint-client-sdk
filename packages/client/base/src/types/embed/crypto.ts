import type { Transaction as _EthersTransaction } from "@ethersproject/transactions";
import type { Transaction as _SolanaTransaction } from "@solana/web3.js";

import { CommonEmbeddedCheckoutProps } from ".";
import { CryptoPaymentMethod } from "..";
import { Blockchain } from "@crossmint/common-sdk-base";

type CryptoEmbeddedCheckoutPropsBase<
    PM extends keyof CryptoPaymentMethodSignerMap = keyof CryptoPaymentMethodSignerMap,
> = CommonEmbeddedCheckoutProps<PM> & {
    paymentMethod: PM;
    signer?: CryptoPaymentMethodSignerMap[PM];
};

type CryptoEmbeddedCheckoutPropsWithSignerBase<
    PM extends keyof CryptoPaymentMethodSignerMap = keyof CryptoPaymentMethodSignerMap,
> = CryptoEmbeddedCheckoutPropsBase<PM> & {
    signer: CryptoPaymentMethodSignerMap[PM];
};

// Union discriminate with required signer
export type CryptoEmbeddedCheckoutPropsWithSigner = {
    [PM in keyof CryptoPaymentMethodSignerMap]: CryptoEmbeddedCheckoutPropsWithSignerBase<PM>;
}[keyof CryptoPaymentMethodSignerMap];

// Union discriminate type - both with or without signer
export type CryptoEmbeddedCheckoutProps =
    | {
          [PM in keyof CryptoPaymentMethodSignerMap]: CryptoEmbeddedCheckoutPropsBase<PM>;
      }[keyof CryptoPaymentMethodSignerMap]
    | CryptoEmbeddedCheckoutPropsWithSigner;

export type CryptoPaymentMethodSignerMap = {
    [CryptoPaymentMethod.ETH]: ETHEmbeddedCheckoutSigner;
    [CryptoPaymentMethod.SOL]: SOLEmbeddedCheckoutSigner;
};

export type CommonEmbeddedCheckoutSignerProps = {
    address: string;
};

// Aliases to preserve names
type EthersTransaction = _EthersTransaction;
type SolanaTransaction = _SolanaTransaction;

// Signers
export type ETHEmbeddedCheckoutSigner = CommonEmbeddedCheckoutSignerProps & {
    signAndSendTransaction: (transaction: EthersTransaction) => Promise<string>;
    chain?: Blockchain;
    supportedChains?: Blockchain[];
    handleChainSwitch?: (network: Blockchain) => Promise<void>;
};

export type SOLEmbeddedCheckoutSigner = CommonEmbeddedCheckoutSignerProps & {
    signAndSendTransaction: (transaction: SolanaTransaction) => Promise<string>;
};

import { AuthSig } from "@lit-protocol/types";
import { TORUS_NETWORK_TYPE } from "@web3auth/single-factor-auth";
import { KernelAccountClient, KernelSmartAccount } from "@zerodev/sdk";
import { Chain, EIP1193Provider, PublicClient, Transport } from "viem";

import { BlockchainIncludingTestnet } from "@crossmint/common-sdk-base";

export type CrossmintAASDKInitParams = {
    apiKey: string;
};

export type PasskeysSDKInitParams = {
    apiKey: string;
};

export type UserIdentifierParams = {
    email?: string;
    userId?: string;
    phoneNumber?: string;
};

export type UserIdentifier =
    | { type: "whiteLabel"; userId: string }
    | { type: "email"; email: string }
    | { type: "phoneNumber"; phoneNumber: string };

export type SignerMap = {
    viem: Client;
};

export type SignerType = keyof SignerMap;

export type Web3AuthSigner = {
    type: "WEB3_AUTH";
    clientId: string;
    verifierId: string;
    web3AuthNetwork: TORUS_NETWORK_TYPE;
    jwt: string;
};
type FireblocksNCWSignerBase = {
    type: "FIREBLOCKS_NCW";
    passphrase: string;
};
export type FireblocksNCWSigner =
    | FireblocksNCWSignerBase
    | (FireblocksNCWSignerBase & {
          walletId: string;
          deviceId: string;
      });

type Signer = EIP1193Provider | Web3AuthSigner;

export interface WalletConfig {
    signer: Signer;
}

export interface PasskeyCipher {
    chain: BlockchainIncludingTestnet;
    walletAddress: string;
    cipher: Cipher;
}

export interface LitProtocolCipherData {
    pkpPublicKey?: string;
    pkpEthAddress?: string;
    cipherText?: string;
    dataToEncryptHash?: string;
}

export type EncryptInput = {
    messageToEncrypt: string;
    pkpPublicKey: string;
    pkpEthAddress: string;
    capacityDelegationAuthSig: AuthSig;
};

export type DecryptInput = {
    pkpPublicKey: string;
    pkpEthAddress: string;
    cipherText: string;
    dataToEncryptHash: string;
    capacityDelegationAuthSig: AuthSig;
};

type Cipher = { method: "lit_protocol"; data: LitProtocolCipherData };

export type BackwardsCompatibleChains = "goerli";

export type Client = {
    publicClient: PublicClient;
    walletClient: KernelAccountClient<Transport, Chain, KernelSmartAccount>;
};

import { TORUS_NETWORK_TYPE } from "@web3auth/single-factor-auth";
import { EIP1193Provider, LocalAccount } from "viem";

export type SmartWalletSDKInitParams = {
    clientApiKey: string;
};

type WhitelabelUserParams = {
    /**
     * Must match the identifier within the JWT specified within project settings (typically `sub`).
     */
    id: string;
    jwt: string;
};

export type UserParams = WhitelabelUserParams;

export type Web3AuthSigner = {
    type: "WEB3_AUTH";
    clientId: string;
    verifierId: string;
    web3AuthNetwork: TORUS_NETWORK_TYPE;
    jwt: string;
};

export type ViemAccount = {
    type: "VIEM_ACCOUNT";
    account: LocalAccount & { source: "custom" };
};

export type PasskeySigner = {
    type: "PASSKEY";

    /**
     * Displayed to the user during passkey registration or signing prompts.
     */
    passkeyName: string;
};

export function isPasskeySigner(signer: Signer): signer is PasskeySigner {
    return (signer as PasskeySigner).type === "PASSKEY";
}

type Signer = EIP1193Provider | Web3AuthSigner | ViemAccount | PasskeySigner;

export interface WalletConfig {
    signer: Signer;
}

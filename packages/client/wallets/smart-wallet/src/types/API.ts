import { PasskeyValidatorSerializedData, SupportedEntryPointVersion, SupportedKernelVersion } from "./internal";

export type StoreSmartWalletParams = {
    type: string;
    smartContractWalletAddress: string;
    signerData: SignerData;
    sessionKeySignerAddress?: string;
    version: number;
    baseLayer: string;
    chainId: number;
    entryPointVersion: SupportedEntryPointVersion;
    kernelVersion: SupportedKernelVersion;
};

export type SignerData = EOASignerData | PasskeySignerData;

export interface EOASignerData {
    eoaAddress: string;
    type: "eoa";
}

export type PasskeySignerData = PasskeyValidatorSerializedData & {
    passkeyName: string;
    domain: string;
    type: "passkeys";
};
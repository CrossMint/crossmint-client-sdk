import { PasskeyValidatorSerializedData } from "@/utils/passkey";
import { EntryPointVersion } from "permissionless/_types/types";

export type StoreAbstractWalletInput = {
    type: string;
    smartContractWalletAddress: string;
    signerData: SignerData;
    sessionKeySignerAddress?: string;
    version: number;
    baseLayer: string;
    chainId: number;
    entryPointVersion: EntryPointVersion;
};

export type SignerData = EOASignerData | PasskeySignerData;

export interface EOASignerData {
    eoaAddress: string;
    type: "eoa";
}

export type PasskeySignerData = PasskeyValidatorSerializedData & {
    domain: string;
    type: "passkeys";
};

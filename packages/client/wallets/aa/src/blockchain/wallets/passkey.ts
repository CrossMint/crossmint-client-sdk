import {
    CURRENT_VERSION,
    CrossmintWalletService,
    EVMSmartWallet,
    EntryPointDetails,
    PasskeySigner,
    UserIdentifier,
    WalletConfig,
    WalletCreationParams,
    ZERO_DEV_TYPE,
} from "@/index";
import { createPasskeyValidator, deserializePasskeyValidator } from "@zerodev/passkey-validator";
import { deserializePasskeyValidatorData, serializePasskeyValidatorData } from "@zerodev/passkey-validator/utils";
import { createKernelAccount } from "@zerodev/sdk";
import { PublicClient } from "viem";

import { blockchainToChainId } from "@crossmint/common-sdk-base";

export interface PasskeyWalletParams extends WalletCreationParams {
    walletConfig: WalletConfig & { signer: PasskeySigner };
}

export function isPasskeyParams(params: WalletCreationParams): params is PasskeyWalletParams {
    return (params.walletConfig.signer as PasskeySigner).type === "PASSKEY";
}

export class PasskeyWalletService {
    constructor(private readonly crossmintService: CrossmintWalletService, private readonly apiKey: string) {}

    public async getOrCreate({ user, chain, publicClient, walletConfig, entrypoint }: PasskeyWalletParams) {
        const validator = await this.getOrCreateSigner({
            user,
            entrypoint,
            publicClient,
            signer: walletConfig.signer,
        });
        const kernelAccount = await createKernelAccount(publicClient, {
            plugins: { sudo: validator },
            entryPoint: entrypoint.address,
        });

        const validatorFields = deserializePasskeyValidatorData(validator.getSerializedData());
        await this.crossmintService.storeAbstractWallet({
            user,
            type: ZERO_DEV_TYPE,
            smartContractWalletAddress: kernelAccount.address,
            signerData: {
                ...validatorFields,
                passkeyName: walletConfig.signer.passkeyName,
                domain: this.getCurrentDomain(),
                type: "passkeys",
            },
            version: CURRENT_VERSION,
            baseLayer: "evm",
            chainId: blockchainToChainId(chain),
            entryPointVersion: entrypoint.version,
        });

        return new EVMSmartWallet(this.crossmintService, kernelAccount, publicClient, chain);
    }

    private async getOrCreateSigner({
        user,
        entrypoint,
        publicClient,
        signer,
    }: {
        user: UserIdentifier;
        entrypoint: EntryPointDetails;
        publicClient: PublicClient;
        signer: PasskeySigner;
    }) {
        const serializedData = await this.get(user);
        if (serializedData != null) {
            return deserializePasskeyValidator(publicClient, {
                serializedData,
                entryPoint: entrypoint.address,
            });
        }

        return createPasskeyValidator(publicClient, {
            passkeyServerUrl: this.passkeyServerUrl(user),
            entryPoint: entrypoint.address,
            passkeyName: signer.passkeyName,
            credentials: "omit",
        });
    }

    private async get(user: UserIdentifier): Promise<string | null> {
        const signer = await this.crossmintService.getPasskeyValidatorSigner(user);
        if (signer == null) {
            return null;
        }

        if (signer.type !== "passkeys") {
            throw new Error("Admin Mismatch"); // TODO custom error as defined within SDK spec
        }

        return serializePasskeyValidatorData(signer);
    }

    private passkeyServerUrl(user: UserIdentifier): string {
        return this.crossmintService.crossmintBaseUrl + `/unstable/passkeys/${this.apiKey}/${user}`;
    }

    private getCurrentDomain(): string {
        return window.location.hostname;
    }
}

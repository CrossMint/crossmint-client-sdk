import {
    CURRENT_VERSION,
    CrossmintWalletService,
    EVMSmartWallet,
    EntryPointDetails,
    PasskeySigner,
    UserParams,
    WalletConfig,
    WalletParams,
    ZERO_DEV_TYPE,
} from "@/index";
import { createPasskeyValidator, deserializePasskeyValidator } from "@zerodev/passkey-validator";
import { deserializePasskeyValidatorData, serializePasskeyValidatorData } from "@zerodev/passkey-validator/utils";
import { createKernelAccount } from "@zerodev/sdk";
import { PublicClient } from "viem";

import { blockchainToChainId } from "@crossmint/common-sdk-base";

export interface PasskeyWalletParams extends WalletParams {
    config: WalletConfig & { signer: PasskeySigner };
}

export function isPasskeyParams(params: WalletParams): params is PasskeyWalletParams {
    return (params.config.signer as PasskeySigner).type === "PASSKEY";
}

export class PasskeyWalletService {
    constructor(private readonly crossmintService: CrossmintWalletService, private readonly apiKey: string) {}

    public async getOrCreate({ user, chain, publicClient, config, entrypoint }: PasskeyWalletParams) {
        const validator = await this.getOrCreateSigner({ user, entrypoint, publicClient, signer: config.signer });
        const kernelAccount = await createKernelAccount(publicClient, {
            plugins: { sudo: validator },
            entryPoint: entrypoint.address,
        });

        const validatorFields = deserializePasskeyValidatorData(validator.getSerializedData());
        await this.crossmintService.storeAbstractWallet({
            userIdentifier: { type: "whiteLabel", userId: user.id },
            type: ZERO_DEV_TYPE,
            smartContractWalletAddress: kernelAccount.address,
            signerData: {
                ...validatorFields,
                passkeyName: config.signer.passkeyName,
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
        user: UserParams;
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

    private async get(user: UserParams): Promise<string | null> {
        const signer = await this.crossmintService.getPasskeyValidatorSigner({ type: "whiteLabel", userId: user.id });
        if (signer == null) {
            return null;
        }

        if (signer.type !== "passkeys") {
            throw new Error("Admin Mismatch"); // TODO custom error as defined within SDK spec
        }

        return serializePasskeyValidatorData(signer);
    }

    private passkeyServerUrl(user: UserParams): string {
        return this.crossmintService.crossmintBaseUrl + `/unstable/passkeys/${this.apiKey}/userId=${user.id}`;
    }

    private getCurrentDomain(): string {
        return window.location.hostname;
    }
}
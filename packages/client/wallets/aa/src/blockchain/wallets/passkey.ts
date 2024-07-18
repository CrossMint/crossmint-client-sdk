import { CrossmintWalletService } from "@/api/CrossmintWalletService";
import { PasskeySignerData } from "@/types/API";
import { PasskeySigner, UserParams, WalletConfig } from "@/types/Config";
import { AccountAndSigner, WalletCreationParams } from "@/types/internal";
import { WebAuthnMode, deserializePasskeyValidator, toPasskeyValidator } from "@zerodev/passkey-validator";
import { KernelValidator, createKernelAccount } from "@zerodev/sdk";
import { toWebAuthnKey } from "@zerodev/webauthn-key";
import { EntryPoint } from "permissionless/types/entrypoint";

import { deserializePasskeyValidatorData, serializePasskeyValidatorData } from "../../utils/passkey";

export interface PasskeyWalletParams extends WalletCreationParams {
    walletConfig: WalletConfig & { signer: PasskeySigner };
}

export function isPasskeyParams(params: WalletCreationParams): params is PasskeyWalletParams {
    return (params.walletConfig.signer as PasskeySigner).type === "PASSKEY";
}

type PasskeyValidator = KernelValidator<EntryPoint, "WebAuthnValidator"> & {
    getSerializedData: () => string;
};

export class PasskeyWalletService {
    constructor(private readonly crossmintService: CrossmintWalletService) {}

    public async getAccountAndSigner({
        user,
        publicClient,
        walletConfig,
        entryPoint,
        kernelVersion,
    }: PasskeyWalletParams): Promise<AccountAndSigner> {
        const validator = await this.getValidator({
            user,
            entryPoint,
            publicClient,
            walletConfig,
            kernelVersion,
        });

        const kernelAccount = await createKernelAccount(publicClient, {
            plugins: { sudo: validator },
            entryPoint: entryPoint.address,
            kernelVersion,
        });

        return { signerData: this.getSignerData(validator, walletConfig.signer.passkeyName), account: kernelAccount };
    }

    private async getValidator({
        user,
        entryPoint,
        publicClient,
        walletConfig,
        kernelVersion,
    }: Omit<PasskeyWalletParams, "chain">): Promise<PasskeyValidator> {
        const serializedData = await this.fetchSerializedSigner(user);

        if (serializedData != null) {
            return deserializePasskeyValidator(publicClient, {
                serializedData,
                entryPoint: entryPoint.address,
                kernelVersion,
            });
        }

        return toPasskeyValidator(publicClient, {
            webAuthnKey: await toWebAuthnKey({
                passkeyName: walletConfig.signer.passkeyName,
                passkeyServerUrl: this.crossmintService.getPasskeyServerUrl(user),
                mode: WebAuthnMode.Register,
                passkeyServerHeaders: {},
            }),
            entryPoint: entryPoint.address,
            kernelVersion,
        });
    }

    private async fetchSerializedSigner(user: UserParams): Promise<string | null> {
        const signer = await this.crossmintService.getPasskeySigner(user);
        if (signer == null) {
            return null;
        }

        return serializePasskeyValidatorData(signer);
    }

    private getSignerData(validator: PasskeyValidator, passkeyName: string): PasskeySignerData {
        const fields = deserializePasskeyValidatorData(validator.getSerializedData());
        return {
            ...fields,
            passkeyName,
            domain: window.location.hostname,
            type: "passkeys",
        };
    }
}

import { CrossmintWalletService } from "@/api";
import { EVMSmartWallet } from "@/blockchain";
import type { EOASigner, WalletConfig, WalletParams } from "@/types";
import { CURRENT_VERSION, ZERO_DEV_TYPE, createOwnerSigner } from "@/utils";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount } from "@zerodev/sdk";

import { blockchainToChainId } from "@crossmint/common-sdk-base";

export interface EOAWalletParams extends WalletParams {
    config: WalletConfig & { signer: EOASigner };
}
export class EOAWalletService {
    constructor(private readonly crossmintService: CrossmintWalletService) {}

    public async getOrCreate({ user, chain, publicClient, entrypoint, config }: EOAWalletParams) {
        const eoa = await createOwnerSigner({
            chain,
            walletConfig: config,
        });
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
            signer: eoa,
            entryPoint: entrypoint.address,
        });
        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            index: BigInt(0),
            entryPoint: entrypoint.address,
        });

        await this.crossmintService.storeAbstractWallet({
            userIdentifier: { type: "whiteLabel", userId: user.id },
            type: ZERO_DEV_TYPE,
            smartContractWalletAddress: account.address,
            signerData: { eoaAddress: eoa.address, type: "eoa" },
            version: CURRENT_VERSION,
            baseLayer: "evm",
            chainId: blockchainToChainId(chain),
            entryPointVersion: entrypoint.version,
        });

        return new EVMSmartWallet(this.crossmintService, account, publicClient, chain);
    }
}

import { CrossmintWalletService } from "@/api";
import { EVMSmartWallet, getBundlerRPC } from "@/blockchain";
import type { EntryPointDetails, SmartWalletSDKInitParams, UserParams, WalletConfig, WalletParams } from "@/types";
import { WalletSdkError } from "@/utils";
import { ENTRYPOINT_ADDRESS_V06, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, http } from "viem";

import { EVMBlockchainIncludingTestnet, validateAPIKey } from "@crossmint/common-sdk-base";

import { EOAWalletParams, EOAWalletService } from "./blockchain/wallets/eoa";
import { PasskeyWalletService, isPasskeyParams } from "./blockchain/wallets/passkey";
import { LoggerWrapper, logPerformance } from "./utils/log";

export class SmartWalletSDK extends LoggerWrapper {
    private readonly crossmintService: CrossmintWalletService;
    private readonly eaoWalletService: EOAWalletService;
    private readonly passkeyWalletService: PasskeyWalletService;

    private constructor(config: SmartWalletSDKInitParams) {
        super("SmartWalletSDK");
        this.crossmintService = new CrossmintWalletService(config.clientApiKey);
        this.eaoWalletService = new EOAWalletService(this.crossmintService);
        this.passkeyWalletService = new PasskeyWalletService(this.crossmintService, config.clientApiKey);
    }

    /**
     * Initializes the SDK with the **client side** API key obtained from the Crossmint console.
     * @throws error if the api key is not formatted correctly.
     */
    static init(config: SmartWalletSDKInitParams): SmartWalletSDK {
        const validationResult = validateAPIKey(config.clientApiKey);
        if (!validationResult.isValid) {
            throw new Error("API key invalid");
        }
        return new SmartWalletSDK(config);
    }

    async getOrCreateWallet(
        user: UserParams,
        chain: EVMBlockchainIncludingTestnet,
        config: WalletConfig = { signer: { type: "PASSKEY", passkeyName: user.id } }
    ): Promise<EVMSmartWallet> {
        return logPerformance(
            "GET_OR_CREATE_WALLET",
            async () => {
                try {
                    const params: WalletParams = {
                        user,
                        chain,
                        publicClient: createPublicClient({ transport: http(getBundlerRPC(chain)) }),
                        entrypoint: await this.getEntryPoint(user, chain),
                        config,
                    };

                    if (isPasskeyParams(params)) {
                        return this.passkeyWalletService.getOrCreate(params);
                    } else {
                        return this.eaoWalletService.getOrCreate(params as EOAWalletParams);
                    }
                } catch (error: any) {
                    throw new WalletSdkError(`Error creating the Wallet ${error?.message ? `: ${error.message}` : ""}`);
                }
            },
            { user, chain }
        );
    }

    private async getEntryPoint(user: UserParams, chain: EVMBlockchainIncludingTestnet): Promise<EntryPointDetails> {
        const { entryPointVersion } = await this.crossmintService.getAbstractWalletEntryPointVersion(
            { type: "whiteLabel", userId: user.id },
            chain
        );

        return {
            version: entryPointVersion,
            address: entryPointVersion === "v0.6" ? ENTRYPOINT_ADDRESS_V06 : ENTRYPOINT_ADDRESS_V07,
        };
    }
}
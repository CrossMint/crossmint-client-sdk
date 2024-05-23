import { CrossmintWalletService } from "@/api";
import { EVMAAWallet, getBundlerRPC } from "@/blockchain";
import {
    type CrossmintAASDKInitParams,
    type EOAWalletConfig,
    type UserIdentifier,
    WalletConfig,
    isEOAWalletConfig,
} from "@/types";
import { CURRENT_VERSION, SCW_SERVICE, WalletSdkError, ZERO_DEV_TYPE, createOwnerSigner, errorToJSON } from "@/utils";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createPasskeyValidator, getPasskeyValidator } from "@zerodev/passkey-validator";
import { createKernelAccount } from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V06, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { EntryPointVersion } from "permissionless/types/entrypoint";
import { HttpTransport, PublicClient, createPublicClient, http } from "viem";

import {
    EVMBlockchainIncludingTestnet,
    UserIdentifierParams,
    blockchainToChainId,
    isEVMBlockchain,
    validateAPIKey,
} from "@crossmint/common-sdk-base";

import { logError, logInfo } from "./services/logging";
import { getIdString, parseUserIdentifier } from "./utils/user";

export class CrossmintAASDK {
    private readonly crossmintService: CrossmintWalletService;

    private constructor({ apiKey }: CrossmintAASDKInitParams) {
        if (!validateAPIKey(apiKey).isValid) {
            throw new Error("API key invalid");
        }

        this.crossmintService = new CrossmintWalletService(apiKey);
    }

    static init(params: CrossmintAASDKInitParams): CrossmintAASDK {
        return new CrossmintAASDK(params);
    }

    // Scenarios
    // The user already has a wallet (from "user" & "chain") but the wallet config doesn't match
    public async getOrCreate(
        user: UserIdentifierParams,
        chain: EVMBlockchainIncludingTestnet,
        walletConfig?: WalletConfig
    ) {
        try {
            logInfo("[GET_OR_CREATE_WALLET] - INIT", {
                service: SCW_SERVICE,
                user,
                chain,
            });

            if (!isEVMBlockchain(chain)) {
                throw new WalletSdkError(`The blockchain ${chain} is not supported`);
            }

            const publicClient = createPublicClient({
                transport: http(getBundlerRPC(chain)),
            });

            const userIdentifier = parseUserIdentifier(user);
            // Fetch wallet config

            let wallet: EVMAAWallet;
            if (walletConfig != null && isEOAWalletConfig(walletConfig)) {
                wallet = await this.getOrCreateEOAWallet(userIdentifier, chain, publicClient, walletConfig);
            } else {
                wallet = await this.getOrCreatePasskeyWallet(userIdentifier, chain, publicClient);
            }

            logInfo("[GET_OR_CREATE_WALLET] - FINISH", {
                service: SCW_SERVICE,
                userEmail: user.email!,
                chain,
                address: wallet.address,
            });
            return wallet;
        } catch (error: any) {
            logError("[GET_OR_CREATE_WALLET] - ERROR_CREATING_WALLET", {
                service: SCW_SERVICE,
                error: errorToJSON(error),
                user,
                chain,
            });

            throw new WalletSdkError(`Error creating the Wallet [${error?.name ?? ""}]`);
        }
    }

    private async registerPasskeyWallet(
        userIdentifier: UserIdentifier,
        chain: EVMBlockchainIncludingTestnet,
        publicClient: PublicClient<HttpTransport>
    ) {
        const entryPoint = ENTRYPOINT_ADDRESS_V07;
        const validator = await createPasskeyValidator(publicClient, {
            passkeyServerUrl: "X",
            entryPoint,
            passkeyName: getIdString(userIdentifier),
        });
        const kernelAccount = await createKernelAccount(publicClient, {
            plugins: {
                sudo: validator,
            },
            entryPoint,
        });
        // TODO save to CM

        // TODO fix the init code type issue w/ kernel account & validator
        return new EVMAAWallet(kernelAccount as any, this.crossmintService, chain, publicClient, entryPoint);
    }

    private async getOrCreatePasskeyWallet(
        userIdentifier: UserIdentifier,
        chain: EVMBlockchainIncludingTestnet,
        publicClient: PublicClient<HttpTransport>
    ) {
        const userHasSetupPasskey = true; // TODO figure this out by fetching from crossmint server.
        const entryPoint = ENTRYPOINT_ADDRESS_V07;

        // Can we deserialize our passkey validator
        const passkeyValidatorParams = {
            passkeyServerUrl: "X",
            entryPoint,
            passkeyName: getIdString(userIdentifier),
        };

        const validator = userHasSetupPasskey
            ? await getPasskeyValidator(publicClient, passkeyValidatorParams)
            : await createPasskeyValidator(publicClient, passkeyValidatorParams);

        // Scenario:
        // If the validator doesn't match here, throw a good error. The dev is responsible for surfacing this to their user.

        const kernelAccount = await createKernelAccount(publicClient, {
            plugins: {
                sudo: validator,
            },
            entryPoint,
        });

        // TODO save to CM

        // TODO fix the init code type issue w/ kernel account & validator
        return new EVMAAWallet(kernelAccount as any, this.crossmintService, chain, publicClient, entryPoint);
    }

    private async get(user: UserIdentifierParams, chain: EVMBlockchainIncludingTestnet): Promise<EVMAAWallet | null> {
        return null;
    }

    private async getOrCreateEOAWallet(
        userIdentifier: UserIdentifier,
        chain: EVMBlockchainIncludingTestnet,
        publicClient: PublicClient<HttpTransport>,
        walletConfig: EOAWalletConfig
    ) {
        const entryPointVersion = await this.getEntryPointVersion(userIdentifier, chain);
        const entryPoint = entryPointVersion === "v0.6" ? ENTRYPOINT_ADDRESS_V06 : ENTRYPOINT_ADDRESS_V07;

        const owner = await createOwnerSigner({
            chain,
            walletConfig,
        });
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
            signer: owner,
            entryPoint,
        });

        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: ecdsaValidator,
            },
            index: BigInt(0),
            entryPoint,
        });

        const wallet = new EVMAAWallet(account, this.crossmintService, chain, publicClient, entryPoint);
        await this.crossmintService.storeAbstractWallet({
            userIdentifier: userIdentifier,
            type: ZERO_DEV_TYPE,
            smartContractWalletAddress: wallet.address,
            eoaAddress: owner.address,
            sessionKeySignerAddress: "n/a", // TODO
            version: CURRENT_VERSION,
            baseLayer: "evm",
            chainId: blockchainToChainId(chain),
            entryPointVersion,
        });

        return wallet;
    }

    private async getEntryPointVersion(
        userIdentifier: UserIdentifierParams,
        chain: EVMBlockchainIncludingTestnet
    ): Promise<EntryPointVersion> {
        if (userIdentifier.email == null && userIdentifier.userId == null) {
            throw new WalletSdkError(`Email or userId is required to get the entry point version`);
        }

        const { entryPointVersion } = await this.crossmintService.getAbstractWalletEntryPointVersion(
            userIdentifier,
            chain
        );
        return entryPointVersion;
    }
}

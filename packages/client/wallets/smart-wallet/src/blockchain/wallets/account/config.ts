import type { Address } from "viem";

import type { CrossmintWalletService } from "../../../api/CrossmintWalletService";
import type { SmartWalletChain } from "../../../blockchain/chains";
import { SmartWalletError } from "../../../error";
import type { SupportedEntryPointVersion, SupportedKernelVersion } from "../../../types/internal";
import type { UserParams } from "../../../types/params";
import type { SignerData, SmartWalletConfig } from "../../../types/service";
import { AccountConfigCache } from "./cache";
import { EOASignerConfig, PasskeySignerConfig, type SignerConfig } from "./signer";

export class AccountConfigFacade {
    constructor(
        private readonly crossmintService: CrossmintWalletService,
        private readonly cache: AccountConfigCache
    ) {}

    public async get(
        user: UserParams,
        chain: SmartWalletChain
    ): Promise<{
        entryPointVersion: SupportedEntryPointVersion;
        kernelVersion: SupportedKernelVersion;
        userId: string;
        existingSignerConfig?: SignerConfig;
        smartContractWalletAddress?: Address;
    }> {
        const { entryPointVersion, kernelVersion, signers, smartContractWalletAddress, userId } = await this.config(
            user,
            chain
        );

        if (
            (entryPointVersion === "v0.7" && kernelVersion.startsWith("0.2")) ||
            (entryPointVersion === "v0.6" && kernelVersion.startsWith("0.3"))
        ) {
            throw new SmartWalletError(
                `Unsupported combination: entryPoint ${entryPointVersion} and kernel version ${kernelVersion}. Please contact support`
            );
        }

        return {
            entryPointVersion,
            kernelVersion,
            userId,
            existingSignerConfig: this.getSigner(signers.map((x) => x.signerData)),
            smartContractWalletAddress,
        };
    }

    private async config(user: UserParams, chain: SmartWalletChain): Promise<SmartWalletConfig> {
        console.log(`Fetching smart wallet config for user: ${user.jwt.substring(0, 10)}... on chain: ${chain}`);

        const cached = this.cache.get();
        if (cached != null) {
            console.log("Using cached smart wallet config");
            return cached;
        }

        console.log("Cache miss. Fetching config from CrossmintWalletService...");
        const config = await this.crossmintService.getSmartWalletConfig(user, chain);

        console.log("Caching newly fetched config");
        this.cache.set(config);

        console.log("Smart wallet config retrieved successfully");
        return config;
    }

    private getSigner(signers: SignerData[]): SignerConfig | undefined {
        if (signers.length === 0) {
            return undefined;
        }

        const data = signers[0];

        if (data.type === "eoa") {
            return new EOASignerConfig(data);
        }

        if (data.type === "passkeys") {
            return new PasskeySignerConfig(data);
        }
    }
}

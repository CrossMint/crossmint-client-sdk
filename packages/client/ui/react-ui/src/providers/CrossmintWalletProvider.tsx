import { useCrossmint } from "@/hooks";
import { ReactNode, createContext, useEffect, useMemo, useState } from "react";

import { EVMSmartWallet, SmartWalletError, SmartWalletSDK } from "@crossmint/client-sdk-smart-wallet";
import { Crossmint } from "@crossmint/common-sdk-base";

export type CrossmintWalletConfig = {
    type: "evm-smart-wallet";
    defaultChain: "polygon-amoy" | "base-sepolia" | "optimism-sepolia" | "arbitrum-sepolia";
    createOnLogin: "all-users" | "off";
};

type WalletStatus = "not-loaded" | "in-progress" | "loaded" | "loading-error";

type ValidWalletState =
    | { status: "not-loaded" | "in-progress" }
    | { status: "loaded"; wallet: EVMSmartWallet }
    | { status: "loading-error"; error: SmartWalletError };

function deriveInitialState(config: CrossmintWalletConfig, crossmint: Crossmint): ValidWalletState {
    if (config.createOnLogin === "all-users" && crossmint.jwt !== null) {
        return { status: "in-progress" };
    }

    return { status: "not-loaded" };
}

function deriveErrorState(error: unknown): { status: "loading-error"; error: SmartWalletError } {
    if (error instanceof SmartWalletError) {
        return { status: "loading-error", error };
    }

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return { status: "loading-error", error: new SmartWalletError(`Unknown Wallet Error: ${message}`, stack) };
}

type WalletContext = {
    status: WalletStatus;
    wallet?: EVMSmartWallet;
    error?: SmartWalletError;
    getOrCreateWallet: () => Promise<void>;
};

export const WalletContext = createContext<WalletContext>({
    status: "not-loaded",
    getOrCreateWallet: async () => {},
});

export function CrossmintWalletProvider({ children, config }: { config: CrossmintWalletConfig; children: ReactNode }) {
    const { crossmint } = useCrossmint("CrossmintWalletProvider must be used within CrossmintProvider");
    const [state, setState] = useState<ValidWalletState>(deriveInitialState(config, crossmint));
    const smartWalletSDK = useMemo(() => SmartWalletSDK.init({ clientApiKey: crossmint.apiKey }), [crossmint.apiKey]);

    const getOrCreateWallet = async () => {
        if (!crossmint.jwt) {
            console.error("JWT is not available");
            return;
        }

        if (state.status === "in-progress" || state.status === "loaded") {
            console.error("Wallet already exists or is already being created");
            return;
        }

        try {
            setState({ status: "in-progress" });
            const wallet = await smartWalletSDK.getOrCreateWallet({ jwt: crossmint.jwt }, config.defaultChain);
            setState({ status: "loaded", wallet });
        } catch (error: unknown) {
            console.error("There was an error creating a wallet ", error);
            setState(deriveErrorState(error));
        }
    };

    useEffect(() => {
        if (config.createOnLogin === "all-users" && crossmint.jwt) {
            console.log("Getting or Creating wallet");
            getOrCreateWallet();
            return;
        }

        if (state.status === "loaded" && !crossmint.jwt) {
            console.log("Clearing wallet");
            setState({ status: "not-loaded" });
            return;
        }
    }, [crossmint.jwt, config.createOnLogin, state.status, getOrCreateWallet]);

    return <WalletContext.Provider value={{ ...state, getOrCreateWallet }}>{children}</WalletContext.Provider>;
}

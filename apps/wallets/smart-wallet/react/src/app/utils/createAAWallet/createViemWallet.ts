import { privateKeyToAccount } from "viem/accounts";

import { Chain, SmartWalletSDK, ViemAccount } from "@crossmint/client-sdk-smart-wallet";

import { AuthStrategy } from "../../auth";
import { AuthProviders } from "../../providers/Providers";

export const createViemAAWallet = async (
    isProd: boolean,
    privateKey: `0x${string}`,
    authProvider: string,
    providers: AuthProviders
) => {
    const authAdapter = AuthStrategy.forProvider(authProvider, providers);

    let jwt = await authAdapter.check();

    if (!jwt) {
        jwt = await authAdapter.login();
    }

    if (!jwt) {
        throw new Error("No JWT token found");
    }

    const xm = isProd
        ? SmartWalletSDK.init({
              clientApiKey: process.env.REACT_APP_CROSSMINT_API_KEY_PROD || "",
          })
        : SmartWalletSDK.init({
              clientApiKey: process.env.REACT_APP_CROSSMINT_API_KEY_STG || "",
          });

    // NOTE: Do NOT do this in production. This is just for demo purposes.
    // Proper storage of private key material is critical.
    // Crossmint supports several secure signer options, documented later in the guide.
    const signer: ViemAccount = {
        type: "VIEM_ACCOUNT",
        account: privateKeyToAccount(privateKey) as unknown as ViemAccount["account"],
    };
    const chain = isProd ? Chain.POLYGON : Chain.POLYGON_AMOY;
    return await xm.getOrCreateWallet({ jwt }, chain, { signer });
};

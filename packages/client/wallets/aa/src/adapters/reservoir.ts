import { ReservoirWallet } from "@reservoir0x/reservoir-sdk";
import { hexToBigInt, http } from "viem";

import { getBundlerRPC } from "../blockchain/BlockchainNetworks";
import { EVMAAWallet } from "../blockchain/wallets/EVMAAWallet";

// TODO does this still all work?
export function reservoirAdapter(aaWallet: EVMAAWallet): ReservoirWallet {
    return {
        address: async () => aaWallet.address,
        handleSignMessageStep: async (stepItem, _) => {
            const signData = stepItem.data?.sign;
            let signature: string | undefined;
            if (signData) {
                if (signData.signatureKind === "eip191") {
                    console.log("Execute Steps: Signing with eip191");
                    signature = await aaWallet.signer.signMessage({ message: signData.message });
                } else if (signData.signatureKind === "eip712") {
                    console.log("Execute Steps: Signing with eip712");
                    signature = await aaWallet.signer.signTypedData({
                        domain: signData.domain as any,
                        types: signData.types as any,
                        primaryType: signData.primaryType,
                        message: signData.value,
                    });
                }
            }
            return signature;
        },
        handleSendTransactionStep: async (chainId, stepItem, _) => {
            const stepData = stepItem.data;
            return await aaWallet.signer.sendTransaction({
                data: stepData.data,
                to: stepData.to,
                value: hexToBigInt((stepData.value as any) || 0),
                ...(stepData.maxFeePerGas && {
                    maxFeePerGas: hexToBigInt(stepData.maxFeePerGas as any),
                }),
                ...(stepData.maxPriorityFeePerGas && {
                    maxPriorityFeePerGas: hexToBigInt(stepData.maxPriorityFeePerGas as any),
                }),
                ...(stepData.gas && {
                    gas: hexToBigInt(stepData.gas as any),
                }),
                chain: null, // TODO wtf why?
            });
        },
        transport: http(getBundlerRPC(aaWallet.chain)),
    };
}

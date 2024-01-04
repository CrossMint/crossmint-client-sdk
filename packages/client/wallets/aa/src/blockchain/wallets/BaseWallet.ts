import { logError } from "@/services/logging";
import type { SignTypedDataParams } from "@alchemy/aa-core";
import { ZeroDevAccountSigner, ZeroDevEthersProvider } from "@zerodev/sdk";
import { BigNumber, ethers } from "ethers";

import erc20 from "../../ABI/ERC20.json";
import erc721 from "../../ABI/ERC721.json";
import erc1155 from "../../ABI/ERC1155.json";
import { CrossmintService } from "../../api/CrossmintService";
import { TransferError, errorToJSON } from "../../utils/error";
import { EVMToken, Token } from "../token/Tokens";

class BaseWallet extends ZeroDevAccountSigner<"ECDSA"> {
    private signer: ZeroDevAccountSigner<"ECDSA">;
    crossmintService: CrossmintService;

    constructor(provider: ZeroDevEthersProvider<"ECDSA">, crossmintService: CrossmintService) {
        super(provider);
        this.crossmintService = crossmintService;
        this.signer = provider.getAccountSigner();
    }

    async getAddress() {
        try {
            return await this.signer.getAddress();
        } catch (error) {
            logError("[GET_ADDRESS] - ERROR", {
                error: errorToJSON(error),
                signer: this.signer,
            });
            throw new Error(`Error getting address. If this error persists, please contact support.`);
        }
    }

    async signMessage(message: Uint8Array | string) {
        try {
            return await this.signer.signMessageWith6492(message);
        } catch (error) {
            logError("[SIGN_MESSAGE] - ERROR", {
                error: errorToJSON(error),
                signer: this.signer,
            });
            throw new Error(`Error signing message. If this error persists, please contact support.`);
        }
    }

    async signTypedData(params: SignTypedDataParams) {
        try {
            return await this.signer.signTypedData(params);
        } catch (error) {
            logError("[SIGN_TYPED_DATA] - ERROR", {
                error: errorToJSON(error),
                signer: this.signer,
            });
            throw new Error(`Error signing typed data. If this error persists, please contact support.`);
        }
    }

    async transfer(toAddress: string, token: Token, quantity?: number, amount?: BigNumber): Promise<string> {
        const evmToken = token as EVMToken;
        const contractAddress = evmToken.contractAddress;

        try {
            let transaction;

            const contract = new ethers.Contract(
                contractAddress,
                amount !== undefined ? erc20 : quantity !== undefined ? erc1155 : erc721,
                this.provider
            );
            const contractWithSigner = contract.connect(this);

            if (amount !== undefined) {
                // Transfer ERC20
                transaction = await contractWithSigner.functions.transfer(toAddress, amount);
            } else if (quantity !== undefined) {
                // Transfer ERC1155
                transaction = await contractWithSigner.functions.safeTransferFrom(
                    await this.getAddress(),
                    toAddress,
                    evmToken.tokenId,
                    quantity,
                    "0x00"
                );
            } else {
                // Transfer ERC721
                transaction = await contractWithSigner.functions.transferFrom(
                    await this.getAddress(),
                    toAddress,
                    evmToken.tokenId
                );
            }

            const receipt = await transaction!.wait();
            console.log("Transaction receipt:", receipt);

            return transaction!.hash;
        } catch (error) {
            throw new TransferError(`Error transferring token ${evmToken.tokenId}`);
        }
    }
}

export default BaseWallet;

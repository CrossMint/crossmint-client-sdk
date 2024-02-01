import { LocalStorageRepository } from "@/storage";
import { UserIdentifier } from "@/types";
import type { SignTypedDataParams, SmartAccountSigner } from "@alchemy/aa-core";
import {
    FireblocksNCW,
    IEventsHandler,
    IMessagesHandler,
    ITransactionSignature,
    TEvent,
    TMPCAlgorithm,
} from "@fireblocks/ncw-js-sdk";
import { createHash } from "crypto";
import { fromBytes } from "viem";

import { BlockchainIncludingTestnet } from "@crossmint/common-sdk-base";

import { CrossmintService } from "../../api/CrossmintService";
import { PasswordEncryptedLocalStorage } from "../../storage/PasswordEncryptedLocalStorage";
import { KeysGenerationError, NonCustodialWalletError, SignTransactionError } from "../../utils/error";
import { getFireblocksAssetId } from "../BlockchainNetworks";

export const FireblocksNCWallet = async (
    userIdentifier: UserIdentifier,
    crossmintService: CrossmintService,
    chain: BlockchainIncludingTestnet,
    passphrase: string,
    ncwData?: {
        walletId: string;
        deviceId: string;
    }
) => {
    const localStorageRepository = new LocalStorageRepository(generateUniqueHash(userIdentifier));

    let _walletId: string;
    let _deviceId: string;
    let isNew: boolean;

    if (ncwData) {
        _walletId = ncwData.walletId;
        _deviceId = ncwData.deviceId;
        isNew = false;
    } else {
        const ncwData = localStorageRepository.ncwData ?? (await crossmintService.getOrAssignWallet(userIdentifier));
        _walletId = ncwData.walletId;
        _deviceId = ncwData.deviceId;
        isNew = ncwData.isNew !== undefined ? ncwData.isNew : false;
    }

    // Register a message handler to process outgoing message to your API
    const messagesHandler: IMessagesHandler = {
        handleOutgoingMessage: async (message: string) => {
            const rpcResponse = await crossmintService.rpc(_walletId, _deviceId, message);
            if (rpcResponse.error !== undefined) {
                if (rpcResponse.error.code === -1) {
                    //Unexpected physicalDeviceId
                    throw new NonCustodialWalletError(`Unexpected physicalDeviceId`);
                }
                throw new NonCustodialWalletError(`NCW Error: ${rpcResponse.error.message}`);
            }
            return rpcResponse;
        },
    };

    // Register an events handler to handle on various events that the SDK emitts
    const eventsHandler: IEventsHandler = {
        handleEvent: (event: TEvent) => {
            if (
                event.type === "key_descriptor_changed" ||
                event.type === "key_takeover_changed" ||
                event.type === "transaction_signature_changed"
            ) {
                // Do something when the event is fired.
                console.log(event);
            }
        },
    };

    const secureStorageProvider = new PasswordEncryptedLocalStorage(_deviceId, () => {
        return passphrase;
    });

    const fireblocksNCW = await FireblocksNCW.initialize({
        env: "production",
        deviceId: _deviceId,
        messagesHandler,
        eventsHandler,
        secureStorageProvider,
    });

    if (isNew) {
        try {
            await fireblocksNCW.generateMPCKeys(getDefaultAlgorithems());
            await fireblocksNCW.backupKeys(passphrase, _deviceId); //using the deviceId as a passphraseId to match implementation.
        } catch (error: any) {
            await crossmintService.unassignWallet(userIdentifier);
            throw new KeysGenerationError(`Error generating keys. ${error?.message ?? ""}}`);
        }
    } else {
        try {
            await fireblocksNCW.recoverKeys(async (passphraseId) => {
                // Implement logic to fetch the passphrase using the passphraseId
                // For example, fetch from a database or an API

                /*if (!passphrase) {
                    throw new Error("Passphrase not found for given id");
                }*/
                // Now the passphraseId is the deviceId, it will pass the validation
                if (passphraseId !== _deviceId) {
                    throw new Error("Invalid passphraseId. Can not recover the keys.");
                }
                return passphrase;
            });
        } catch (error: any) {
            throw new KeysGenerationError(`Error recovering keys. ${error?.message ?? ""}`);
        }
    }

    localStorageRepository.ncwData = { walletId: _walletId, deviceId: _deviceId };

    return {
        owner: getSmartAccountSignerFromFireblocks(
            crossmintService,
            fireblocksNCW,
            _walletId,
            chain,
            localStorageRepository
        ),
    };
};

export function getSmartAccountSignerFromFireblocks(
    crossmintService: CrossmintService,
    fireblocksNCW: FireblocksNCW,
    walletId: string,
    chain: BlockchainIncludingTestnet,
    localStorageRepository: LocalStorageRepository
): SmartAccountSigner {
    return {
        getAddress: async () => {
            let address = localStorageRepository.ncwAddress;
            if (!address) {
                address = await crossmintService.getAddress(walletId, 0, getFireblocksAssetId(chain));
                localStorageRepository.ncwAddress = address;
            }
            return address as `0x${string}`;
        },
        signMessage: async (msg: Uint8Array | string) => {
            return signMessage(crossmintService, fireblocksNCW, walletId, chain, msg);
        },
        signTypedData: async (params: SignTypedDataParams) => {
            return signTypedData(crossmintService, fireblocksNCW, walletId, chain, params);
        },
    };
}

const signMessage = async (
    crossmintService: CrossmintService,
    fireblocksNCW: FireblocksNCW,
    walletId: string,
    chain: BlockchainIncludingTestnet,
    msg: Uint8Array | string
) => {
    console.log({ physicalDeviceId: fireblocksNCW.getPhysicalDeviceId() });
    const msg_ = msg instanceof Uint8Array ? fromBytes(msg, "hex") : msg;
    const tx = await crossmintService.createTransaction(msg_ as string, walletId, getFireblocksAssetId(chain), false);
    try {
        const result: ITransactionSignature = await fireblocksNCW.signTransaction(tx);
        console.log(`txId: ${result.txId}`, `status: ${result.transactionSignatureStatus}`);
        handleSignTransactionStatus(result);
    } catch (error: any) {
        throw new SignTransactionError(`Error signing transaction. ${error?.message ?? ""}`);
    }
    return (await crossmintService.getSignature(tx)) as `0x${string}`;
};

const signTypedData = async (
    crossmintService: CrossmintService,
    fireblocksNCW: FireblocksNCW,
    walletId: string,
    chain: BlockchainIncludingTestnet,
    params: SignTypedDataParams
) => {
    const tx = await crossmintService.createTransaction(params as any, walletId, getFireblocksAssetId(chain), true);
    try {
        const result: ITransactionSignature = await fireblocksNCW.signTransaction(tx);
        console.log(`txId: ${result.txId}`, `status: ${result.transactionSignatureStatus}`);
        handleSignTransactionStatus(result);
    } catch (error: any) {
        throw new SignTransactionError(`Error signing transaction. ${error?.message ?? ""}`);
    }
    return (await crossmintService.getSignature(tx)) as `0x${string}`;
};

const handleSignTransactionStatus = (result: ITransactionSignature) => {
    if (result.transactionSignatureStatus === "TIMEOUT") {
        throw new SignTransactionError(`Timeout signing transaction ${result.txId}`);
    }
    if (result.transactionSignatureStatus === "ERROR") {
        throw new SignTransactionError(`There has been an error signing transaction ${result.txId}`);
    }
};

const getDefaultAlgorithems = (): Set<TMPCAlgorithm> => {
    const algorithms = new Set<TMPCAlgorithm>();
    algorithms.add("MPC_CMP_ECDSA_SECP256K1");
    return algorithms;
};

const generateUniqueHash = (userIdentifier: UserIdentifier): string => {
    let inputString: string;

    switch (userIdentifier.type) {
        case "whiteLabel":
            inputString = userIdentifier.userId;
            break;
        case "email":
            inputString = userIdentifier.email;
            break;
        case "phoneNumber":
            inputString = userIdentifier.phoneNumber;
            break;
    }

    return createHash("sha256").update(inputString).digest("hex").substring(0, 4);
};

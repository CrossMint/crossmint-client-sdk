export { blockchainToChainId } from "@crossmint/common-sdk-base";

export { EVMSmartWallet } from "./blockchain/wallets/EVMSmartWallet";

export type {
    SmartWalletSDKInitParams,
    UserParams,
    ViemAccount,
    PasskeySigner,
    EOASigner,
    WalletParams,
} from "./types/Config";

export type { TransferType, ERC20TransferType, NFTTransferType, SFTTransferType } from "./types/Tokens";
export { SmartWalletChain } from "./blockchain/chains";

export {
    TransferError,
    CrossmintServiceError,
    SmartWalletSDKError,
    JWTDecryptionError,
    JWTExpiredError,
    JWTIdentifierError,
    JWTInvalidError,
    NotAuthorizedError,
    UserWalletAlreadyCreatedError,
    OutOfCreditsError,
    AdminAlreadyUsedError,
    AdminMismatchError,
    PasskeyMismatchError,
    ConfigError,
    NonCustodialWalletsNotEnabledError,
} from "./error";

export { SmartWalletSDK } from "./SmartWalletSDK";

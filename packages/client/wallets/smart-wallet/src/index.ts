export { blockchainToChainId, EVMBlockchainIncludingTestnet as Chain } from "@crossmint/common-sdk-base";

export { EVMSmartWallet } from "./blockchain/wallets/EVMSmartWallet";

export type {
    SmartWalletSDKInitParams,
    UserParams,
    ViemAccount,
    PasskeySigner,
    EOASigner,
    WalletParams,
} from "./types/params";

export type { TransferType, ERC20TransferType, NFTTransferType, SFTTransferType } from "./types/token";

export {
    TransferError,
    CrossmintServiceError,
    SmartWalletError,
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
    PasskeyPromptError,
    PasskeyRegistrationError,
    PasskeyIncompatibleAuthenticatorError,
    ConfigError,
    SmartWalletsNotEnabledError,
    SmartWalletErrorCode,
} from "./error";

export { SmartWalletSDK } from "./SmartWalletSDK";

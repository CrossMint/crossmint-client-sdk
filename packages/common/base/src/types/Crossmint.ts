import { type ValidateAPIKeyPrefixExpectations, validateAPIKey } from "@/apiKey";

export type FarcasterMetadata = {
    fid: string;
    username: string;
    bio: string;
    displayName: string;
    pfpUrl: string;
    custody: string;
    verifications: string[];
};

export type SDKExternalUser = {
    id: string;
    email?: string;
    phoneNumber?: string;
    farcaster?: FarcasterMetadata;
};

export type Crossmint = {
    apiKey: string;
    jwt?: string;
    refreshToken?: string;
    overrideBaseUrl?: string;
};

export function createCrossmint(config: Crossmint, apiKeyExpectations?: ValidateAPIKeyPrefixExpectations): Crossmint {
    const { apiKey, jwt, refreshToken, overrideBaseUrl } = config;
    const apiKeyValidationResult = validateAPIKey(apiKey, apiKeyExpectations);
    if (!apiKeyValidationResult.isValid) {
        throw new Error(apiKeyValidationResult.message);
    }
    return {
        apiKey,
        jwt,
        refreshToken,
        overrideBaseUrl,
    };
}

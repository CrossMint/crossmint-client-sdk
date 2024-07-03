import { Nft } from "./nft";

export interface VerifiableCredential {
    id: string;
    credentialSubject: any;
    validUntil?: string;
    name?: string;
    description?: string;
    nft: Nft;
    issuer: { id: string };
    type: string[];
    validFrom: string;
    "@context": string[];
    proof?: { proofValue: string; [key: string]: any };
}

export interface EncryptedVerifiableCredential {
    id: string;
    payload: string;
}

export type VerifiableCredentialType = VerifiableCredential | EncryptedVerifiableCredential;

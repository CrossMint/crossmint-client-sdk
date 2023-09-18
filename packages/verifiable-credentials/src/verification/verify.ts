import { Wallet, verifyMessage } from "@ethersproject/wallet";
import { EIP712VC } from "@krebitdao/eip712-vc";
import { parseISO } from "date-fns";

import { VerifiableCredential } from "../types/verifiableCredential";
import { NFTstatusService } from "./nftStatus";
import { VerifiableCredentialSignatureService } from "./signatureService";

export async function verifyCredential(
    credential: VerifiableCredential,
    environment: string = "test"
): Promise<{ validVC: boolean; error: string | undefined }> {
    // TODO check for missing fields

    let error;
    if (credential.expirationDate != null) {
        const parsedExpirationDate = parseISO(credential.expirationDate);
        const todayDate = new Date();

        if (parsedExpirationDate < todayDate) {
            error = "Credential expired at " + credential.expirationDate;
            return { validVC: false, error };
        }
    }

    const validProof = await new VerifiableCredentialSignatureService().verify(credential);
    if (!validProof) {
        error = "Invalid proof";
        return { validVC: false, error };
    }

    const nftRevoked = await new NFTstatusService(environment).isBurned(credential.nft);
    if (nftRevoked) {
        error = "Credential has been revoked";
        return { validVC: false, error };
    }

    const validVC = error == null;
    return { validVC, error };
}

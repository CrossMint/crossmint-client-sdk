import { CredentialsCollection, VCNFT } from "../types";
import { ContractMetadataService } from "./contractMetadata";
import { bundleNfts, getUsersCredentialNfts } from "./getCollections";

jest.mock("./contractMetadata");

describe("bundleNfts", () => {
    it("should group NFTs by contract address", () => {
        const nfts: VCNFT[] = [
            { contractAddress: "address1" } as any,
            { contractAddress: "address1" } as any,
            { contractAddress: "address2" } as any,
        ];

        const result = bundleNfts(nfts);

        expect(result).toEqual([
            { contractAddress: "address1", nfts: [nfts[0], nfts[1]], metadata: {} },
            { contractAddress: "address2", nfts: [nfts[2]], metadata: {} },
        ]);
    });
});

describe("getCredentialCollections", () => {
    const getNftsFunction = jest.fn().mockResolvedValue([] as any);
    beforeEach(() => {});

    it("should throw error if chain is not polygon", async () => {
        await expect(getUsersCredentialNfts("someChain" as any, "wallet", getNftsFunction, {})).rejects.toThrow(
            "Verifiable credentials are not supported on someChain chain"
        );
    });

    it("should filter collections by types if filter is provided", async () => {
        const collections: CredentialsCollection[] = [
            { metadata: { credentialMetadata: { type: ["type1"] } } } as any,
            { metadata: { credentialMetadata: { type: ["type2"] } } } as any,
        ];
        jest.spyOn(ContractMetadataService.prototype, "retrieveContractCredentialMetadata").mockResolvedValue(
            collections as any
        );

        const result = await getUsersCredentialNfts("polygon", "wallet", getNftsFunction, { types: ["type1"] });

        expect(result).toEqual([collections[0]]);
    });
});

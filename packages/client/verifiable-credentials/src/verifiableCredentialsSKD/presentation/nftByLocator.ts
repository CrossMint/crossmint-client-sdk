import { NFTService } from "../onchainServices/nft";
import { IPFSService } from "../services/ipfs";
import { CredentialsCollection } from "../types/collection";
import { VCNFTComplete } from "../types/nft";
import { isVcChain, isVerifiableCredentialContractMetadata, parseLocator } from "../types/utils";
import { ContractMetadataService } from "./contractMetadata";

export async function getNFTFromLocator(locator: string, environment: string, ipfsGateways?: string[]) {
    const nft = parseLocator(locator);
    if (!isVcChain(nft.chain)) {
        throw new Error(`Verifiable Credentials are not available on the provided chain: ${nft.chain}`);
    }
    const nftUri = await new NFTService(environment).getNftUri(nft);
    const nftMetadata = await new IPFSService(ipfsGateways).getFile(nftUri);

    console.debug(`Nft ${locator} metadata:`, nftMetadata);
    const vcNft: VCNFTComplete = {
        metadata: nftMetadata,
        ...nft,
    };

    const metadata = await new ContractMetadataService(ipfsGateways).getContractMetadata(
        nft.contractAddress,
        environment
    );

    if (!isVerifiableCredentialContractMetadata(metadata)) {
        throw new Error(`The nft provided is not associated to a VC collection: contract ${nft.contractAddress}`);
    }
    const collection: CredentialsCollection = {
        nfts: [vcNft],
        contractAddress: nft.contractAddress,
        metadata: metadata,
    };

    return {
        nft: vcNft,
        collection: collection,
    };
}

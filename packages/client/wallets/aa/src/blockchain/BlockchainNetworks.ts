import {
    ARBITRUM_CHAIN_ID,
    BSC_CHAIN_ID,
    CROSSMINT_PROD_URL,
    CROSSMINT_STG_URL,
    ETHEREUM_CHAIN_ID,
    GOERLI_CHAIN_ID,
    MUMBAI_CHAIN_ID,
    OPTIMISM_CHAIN_ID,
    POLYGON_CHAIN_ID,
    SEPOLIA_CHAIN_ID,
    WEB3_AUTH_MAINNET,
    WEB3_AUTH_TESTNET,
    ZD_ARBITRUM_PROJECT_ID,
    ZD_BSC_PROJECT_ID,
    ZD_ETHEREUM_PROJECT_ID,
    ZD_GOERLI_PROJECT_ID,
    ZD_MUMBAI_PROJECT_ID,
    ZD_OPTIMISM_PROJECT_ID,
    ZD_POLYGON_PROJECT_ID,
    ZD_SEPOLIA_PROJECT_ID,
    ZD_ZKATANA_PROJECT_ID,
    ZKATANA_CHAIN_ID,
} from "@/utils";
import { TORUS_LEGACY_NETWORK_TYPE } from "@web3auth/single-factor-auth";

import {
    BLOCKCHAIN_TEST_NET,
    Blockchain,
    BlockchainIncludingTestnet,
    EVMBlockchain,
    EVM_BLOCKCHAIN_INCLUDING_TESTNET,
} from "@crossmint/client-sdk-base";

/*
TODO:
Chains not supported yet due fireblocks or zerodev doesn't supported
    ARBITRUM_NOVA
    ZORA
    SOLANA
    CARDANO
*/

export function getAssetIdByBlockchain(chain: Blockchain) {
    return new Map([
        ["ethereum", "ETH"],
        ["polygon", "MATIC_POLYGON"],
        ["bsc", "BNB_BSC"],
        ["optimism", "ETH-OPT"],
        ["arbitrum", "ETH-AETH"],
        ["goerli", "ETH_TEST3"],
        ["ethereum-sepolia", "ETH_TEST5"],
        ["mumbai", "MATIC_POLYGON_MUMBAI"],
        ["zkatana", "ETH_ZKEVM_TEST"],
    ]).get(chain)!;
}
export function getBlockchainByChainId(chain: number) {
    const chainIdMap = new Map<number, BlockchainIncludingTestnet>([
        [ETHEREUM_CHAIN_ID, "ethereum"],
        [POLYGON_CHAIN_ID, "polygon"],
        [BSC_CHAIN_ID, "bsc"],
        [OPTIMISM_CHAIN_ID, "optimism"],
        [ARBITRUM_CHAIN_ID, "arbitrum"],
        [SEPOLIA_CHAIN_ID, "ethereum-sepolia"],
        [MUMBAI_CHAIN_ID, "mumbai"],
        [ZKATANA_CHAIN_ID, "zkatana"],
    ]);

    return chainIdMap.get(chain);
}

export function getChainIdByBlockchain(chain: Blockchain) {
    return new Map([
        ["ethereum", ETHEREUM_CHAIN_ID],
        ["polygon", POLYGON_CHAIN_ID],
        ["bsc", BSC_CHAIN_ID],
        ["optimism", OPTIMISM_CHAIN_ID],
        ["arbitrum", ARBITRUM_CHAIN_ID],
        ["goerli", GOERLI_CHAIN_ID],
        ["ethereum-sepolia", SEPOLIA_CHAIN_ID],
        ["mumbai", MUMBAI_CHAIN_ID],
        ["zkatana", ZKATANA_CHAIN_ID],
    ]).get(chain)!;
}

export function getUrlProviderByBlockchain(chain: BlockchainIncludingTestnet) {
    return new Map<BlockchainIncludingTestnet, string>([
        ["ethereum", "https://eth.llamarpc.com"],
        ["polygon", "https://polygon.llamarpc.com"],
        ["bsc", "BNB_BSC"],
        ["optimism", "https://optimism.llamarpc.com"],
        ["arbitrum", "https://arbitrum.llamarpc.com"],
        ["goerli", "https://ethereum-goerli.publicnode.com"],
        ["ethereum-sepolia", "https://ethereum-sepolia.publicnode.com"],
        ["mumbai", "https://rpc-mumbai.maticvigil.com"],
        ["zkatana", "https://rpc.startale.com/zkatana"],
    ]).get(chain)!;
}

export function getBlockExplorerByBlockchain(chain: Blockchain) {
    return new Map([
        ["ethereum", "https://etherscan.io"],
        ["polygon", "https://polygonscan.com"],
        ["bsc", "BNB_BSC"],
        ["optimism", "https://optimistic.etherscan.io"],
        ["arbitrum", "https://arbiscan.io"],
        ["goerli", "https://goerli.etherscan.io"],
        ["ethereum-sepolia", "https://sepolia.etherscan.io"],
        ["mumbai", "https://mumbai.polygonscan.com"],
        ["zkatana", "https://zkatana.explorer.startale.com"],
    ]).get(chain)!;
}

export function getDisplayNameByBlockchain(chain: Blockchain) {
    return new Map([
        ["ethereum", "Ethereum Mainnet"],
        ["polygon", "Polygon Mainnet"],
        ["bsc", "BNB_BSC"],
        ["optimism", "Optimism"],
        ["arbitrum", "Arbitrum"],
        ["goerli", "Goerli Tesnet"],
        ["ethereum-sepolia", "Sepolia Tesnet"],
        ["mumbai", "Mumbai Tesnet"],
        ["zkatana", "zKatana Tesnet"],
    ]).get(chain)!;
}

export function getTickerByBlockchain(chain: Blockchain) {
    return new Map([
        ["ethereum", "ETH"],
        ["polygon", "MATIC"],
        ["bsc", "BNB_BSC"],
        ["optimism", "OP"],
        ["arbitrum", "ARB"],
        ["goerli", "ETH"],
        ["ethereum-sepolia", "ETH"],
        ["mumbai", "MATIC"],
        ["zkatana", "ETH"],
    ]).get(chain)!;
}

export function getTickerNameByBlockchain(chain: Blockchain) {
    return new Map([
        ["ethereum", "ETHEREUM"],
        ["polygon", "MATIC"],
        ["bsc", "BNB_BSC"],
        ["optimism", "OPTIMISM"],
        ["arbitrum", "ARBITRUM"],
        ["goerli", "ETHEREUM"],
        ["ethereum-sepolia", "ETHEREUM"],
        ["mumbai", "MATIC"],
        ["zkatana", "ETHEREUM"],
    ]).get(chain)!;
}

export function getZeroDevProjectIdByBlockchain(chain: Blockchain) {
    const zeroDevProjectId = new Map([
        ["ethereum", ZD_ETHEREUM_PROJECT_ID],
        ["polygon", ZD_POLYGON_PROJECT_ID],
        ["bsc", ZD_BSC_PROJECT_ID],
        ["optimism", ZD_OPTIMISM_PROJECT_ID],
        ["arbitrum", ZD_ARBITRUM_PROJECT_ID],
        ["goerli", ZD_GOERLI_PROJECT_ID],
        ["ethereum-sepolia", ZD_SEPOLIA_PROJECT_ID],
        ["mumbai", ZD_MUMBAI_PROJECT_ID],
        ["zkatana", ZD_ZKATANA_PROJECT_ID],
    ]).get(chain)!;

    if (zeroDevProjectId == null) {
        throw new Error(`ZeroDev project id not found for chain ${chain}`);
    }
    return zeroDevProjectId;
}

export function getApiUrlByBlockchainType(chain: Blockchain): string {
    const result = isTestnet(chain) ? CROSSMINT_STG_URL : CROSSMINT_PROD_URL;
    return result;
}

export function getWeb3AuthBlockchain(chain: Blockchain): TORUS_LEGACY_NETWORK_TYPE {
    return isTestnet(chain) ? WEB3_AUTH_TESTNET : WEB3_AUTH_MAINNET;
}

export function isTestnet(chain: Blockchain): boolean {
    return (BLOCKCHAIN_TEST_NET as readonly string[]).includes(chain);
}

export function isEVMBlockchain(chain: Blockchain): chain is EVMBlockchain {
    return (EVM_BLOCKCHAIN_INCLUDING_TESTNET as readonly string[]).includes(chain);
}

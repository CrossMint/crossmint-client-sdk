import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";

import { CrossmintNFTCollectionView } from "../src/CrossmintNFTCollectionView";

const wallets = [{ chain: "solana", publicKey: "12345" }];

describe("when only passing mandatory fields", () => {
    test("should add them to the iframe query params", () => {
        render(<CrossmintNFTCollectionView wallets={wallets} projectId="12345" />);
        const iframe = screen.getByRole("nft-collection-view");
        const src = iframe.getAttribute("src");
        expect(src).toContain("wallets=%5B%7B%22chain%22%3A%22solana%22%2C%22address%22%3A%2212345%22%7D%5D");
        expect(src).toContain("projectId=12345");
        expect(src).toContain("clientVersion=");
    });
});

describe("when not setting any environment", () => {
    test("should default to production", () => {
        render(<CrossmintNFTCollectionView wallets={wallets} projectId="12345" />);
        const iframe = screen.getByRole("nft-collection-view");
        const src = iframe.getAttribute("src");
        expect(src).toContain("https://www.crossmint.com/");
    });
});

describe("when setting the environment to staging", () => {
    test("should use the staging url", () => {
        render(<CrossmintNFTCollectionView wallets={wallets} projectId="12345" environment="staging" />);
        const iframe = screen.getByRole("nft-collection-view");
        const src = iframe.getAttribute("src");
        expect(src).toContain("https://staging.crossmint.com/");
    });
});

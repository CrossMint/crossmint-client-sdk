import { EthereumWalletConnectors } from "@dynamic-labs/ethereum-all";
import {
    DynamicConnectButton,
    DynamicContextProvider,
    DynamicWidget,
    useDynamicContext,
} from "@dynamic-labs/sdk-react";
import { useEffect, useState } from "react";

import { CrossmintPaymentElement } from "@crossmint/client-sdk-react-ui";
import { CrossmintEvents } from "@crossmint/client-sdk-base";
import QuoteSummary from "../../components/quote-summary";

export default function PaymentElementPage() {
    const [count, setCount] = useState(1);

    return (
        <DynamicContextProvider
            settings={{
                initialAuthenticationMode: "connect-only",
                environmentId: "377e1f17-8ef9-4a9a-b35c-6a13ffb1de5e",
                walletConnectors: [EthereumWalletConnectors],
            }}
        >
            <div style={{
                display: "flex",
                alignSelf: "center",
                flexDirection: "column",

            }}>
                <div
                    style={{
                        marginTop: "100px",
                        display: "flex",
                        alignSelf: "center",
                        flexDirection: "column",
                        width: "480px",
                        gap: "20px",
                    }}
                >

                    <DynamicConnectButton>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "460px",
                                alignSelf: "center",

                            }}
                        ><p>Connect your wallet</p>
                        </div>
                    </DynamicConnectButton>

                    <button onClick={() => setCount(count + 1)}>Increment count: {count}</button>


                    <Content count={count} />

                </div>
            </div>

        </DynamicContextProvider>
    );
}

function Content({ count }: { count: number }) {
    const [address, setAddress] = useState<string>("");
    const [signer, setSigner] = useState<any>(null);

    const [quoteMessage, setQuoteMessage] = useState();
    const { walletConnector } = useDynamicContext();

    async function getSigner() {
        const _signer = await walletConnector?.getSigner();
        const _address = await walletConnector?.fetchPublicAddress();
        console.log("_signer", _signer);
        console.log("_address", _address);
        setSigner(_signer);
        setAddress(_address!);
    }

    useEffect(() => {
        console.log("walletConnector", walletConnector);
        getSigner();
    }, [walletConnector]);


    useEffect(() => {
        const handleWindowMessage = (e: MessageEvent) => {
            const { data } = e;
            if (data == null || typeof data !== "object") {
                return;
            }
            const eventType = data.type;
            const eventPayload = data.payload;
            if (eventType === CrossmintEvents.QUOTE_STATUS_CHANGED) {
                setQuoteMessage(eventPayload);
            }

        };

        window.addEventListener("message", handleWindowMessage);
        return () => window.removeEventListener("message", handleWindowMessage);
    }, []);


    if (signer == null || !address || !["EVM", "ETH"].includes(walletConnector?.connectedChain || "")) {
        return <p>Connect wallet</p>;
    }

    return (
        <>
            {quoteMessage != null ? <QuoteSummary initialQuotePayload={quoteMessage} />
                : "Loading..."}

            <CrossmintPaymentElement
                environment="https://crossmint-main-git-checkout-embedded-p5-crossmint.vercel.app"
                clientId="6845c702-8396-4339-b17e-a2bf12d2cf6d"
                recipient={{ wallet: address }}
                mintConfig={{ "totalPrice": `${0.001 * count}`, "quantity": count }}
                paymentMethod="ETH"
                signer={{
                    address,
                    signAndSendTransaction: async (transaction) => {
                        const signRes = await signer.sendTransaction(transaction);
                        console.log("signRes", signRes);
                        return signRes.hash;
                    },
                }}
                onEvent={(event) => {
                    console.log(event);

                    if (event.type === "payment:process.succeeded") {
                        console.log("PAYMENT SUCCESS. SHOW MINTING", event);
                    }
                }}
            />
        </>

    );
}

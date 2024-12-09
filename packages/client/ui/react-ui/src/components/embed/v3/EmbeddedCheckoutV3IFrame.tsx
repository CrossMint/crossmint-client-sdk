import { useCrossmint } from "@/hooks";
import { lazy, useEffect, useRef, useState } from "react";

import {
    type CrossmintEmbeddedCheckoutV3Props,
    type EmbeddedCheckoutV3IFrameEmitter,
    crossmintEmbeddedCheckoutV3Service,
} from "@crossmint/client-sdk-base";

import { createCrossmintApiClient } from "@/utils/createCrossmintApiClient";
import { PayerConnectionHandler } from "./crypto/PayerConnectionHandler";
import { havePropsChanged, shouldPreserveInitialChain } from "./crypto/utils/helpers";

const CryptoWalletConnectionHandler = lazy(() =>
    // @ts-expect-error - Error because we dont use 'module' field in tsconfig, which is expected because we use tsup to compile
    import("./crypto/CryptoWalletConnectionHandler").then((mod) => ({
        default: mod.CryptoWalletConnectionHandler,
    }))
);

export function EmbeddedCheckoutV3IFrame(props: CrossmintEmbeddedCheckoutV3Props) {
    const [iframeClient, setIframeClient] = useState<EmbeddedCheckoutV3IFrameEmitter | null>(null);
    const [height, setHeight] = useState(0);

    const initialChainRef = useRef(props.payment.crypto.payer?.initialChain);

    const memoizedProps = useRef(props);
    if (havePropsChanged(props, memoizedProps.current)) {
        const newProps = { ...props };
        const { shouldPreserve, updatedPayer } = shouldPreserveInitialChain(props, initialChainRef.current);
        if (shouldPreserve) {
            newProps.payment.crypto.payer = updatedPayer;
        }
        memoizedProps.current = newProps;
    }

    const { crossmint } = useCrossmint();
    const apiClient = createCrossmintApiClient(crossmint, {
        usageOrigin: "client",
    });
    const embeddedCheckoutService = crossmintEmbeddedCheckoutV3Service({ apiClient });

    const ref = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = ref.current;
        if (!iframe || iframeClient) {
            return;
        }
        setIframeClient(embeddedCheckoutService.iframe.createClient(iframe));
    }, [ref.current, iframeClient]);

    useEffect(() => {
        if (iframeClient == null) {
            return;
        }
        iframeClient.on("ui:height.changed", (data) => setHeight(data.height));

        return () => {
            iframeClient.off("ui:height.changed");
        };
    }, [iframeClient]);

    return (
        <>
            <iframe
                ref={ref}
                src={embeddedCheckoutService.iframe.getUrl(memoizedProps.current)}
                id="crossmint-embedded-checkout.iframe"
                role="crossmint-embedded-checkout.iframe"
                allow="payment *"
                style={{
                    boxShadow: "none",
                    border: "none",
                    padding: "0px",
                    width: "100%",
                    minWidth: "100%",
                    overflow: "hidden",
                    display: "block",
                    userSelect: "none",
                    transform: "translate(0px)",
                    opacity: "1",
                    transition: "ease 0s, opacity 0.4s ease 0.1s",
                    height: `${height}px`,
                    backgroundColor: "transparent",
                }}
            />
            {memoizedProps.current.payment.crypto.enabled ? (
                memoizedProps.current.payment.crypto.payer != null ? (
                    <PayerConnectionHandler
                        payer={memoizedProps.current.payment.crypto.payer}
                        iframeClient={iframeClient}
                    />
                ) : (
                    <CryptoWalletConnectionHandler
                        iframeClient={iframeClient}
                        apiKeyEnvironment={apiClient["parsedAPIKey"].environment}
                    />
                )
            ) : null}
            <span id="crossmint-focus-target" tabIndex={-1} />
        </>
    );
}

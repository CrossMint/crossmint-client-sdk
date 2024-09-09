import { Dialog, Transition } from "@headlessui/react";
import { CSSProperties, Fragment, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { IFrameWindow } from "@crossmint/client-sdk-window";
import { UIConfig } from "@crossmint/common-sdk-base";

import X from "../../icons/x";

const incomingModalIframeEvents = {
    jwtToken: z.object({
        jwtToken: z.string(),
    }),
};

const outgoingModalIframeEvents = {
    closeWindow: z.object({
        closeWindow: z.string(),
    }),
};

type IncomingModalIframeEventsType = {
    jwtToken: typeof incomingModalIframeEvents.jwtToken;
};

type OutgoingModalIframeEventsType = {
    closeWindow: typeof outgoingModalIframeEvents.closeWindow;
};

type AuthModalProps = {
    setModalOpen: (open: boolean) => void;
    setJwtToken: (jwtToken: string) => void;
    apiKey: string;
    baseUrl: string;
    appearance?: UIConfig;
};

export default function AuthModal({ setModalOpen, setJwtToken, apiKey, baseUrl, appearance }: AuthModalProps) {
    let iframeSrc = `${baseUrl}/sdk/auth/frame?apiKey=${apiKey}`;
    if (appearance != null) {
        // The appearance object is serialized into a query parameter
        iframeSrc += `&uiConfig=${encodeURIComponent(JSON.stringify(appearance))}`;
    }

    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframe, setIframe] = useState<IFrameWindow<
        IncomingModalIframeEventsType,
        OutgoingModalIframeEventsType
    > | null>(null);

    useEffect(() => {
        if (iframe == null) {
            return;
        }

        iframe.on("jwtToken", (data) => {
            setJwtToken(data.jwtToken);
            iframe.off("jwtToken");

            iframe.send("closeWindow", {
                closeWindow: "closeWindow",
            });

            if (iframe?.iframe.contentWindow != null) {
                iframe.iframe.contentWindow.close();
            }
            setModalOpen(false);
        });

        return () => {
            if (iframe) {
                iframe.off("jwtToken");

                if (iframe.iframe.contentWindow != null) {
                    iframe.iframe.contentWindow.close();
                }
            }
        };
    }, [iframe, setJwtToken, setModalOpen]);

    const handleIframeLoaded = async () => {
        if (iframeRef.current == null) {
            // The iframe should be load, here we should log on DD if possible
            console.error("Something wrong happened, please try again");
            return;
        }

        const initIframe = await IFrameWindow.init(iframeRef.current, {
            incomingEvents: incomingModalIframeEvents,
            outgoingEvents: outgoingModalIframeEvents,
        });
        setIframe(initIframe);
    };

    return (
        <Transition.Root show as={Fragment}>
            <Dialog as="div" style={styles.dialog} onClose={() => setModalOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-400"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-400"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div style={styles.transitionBegin} />
                </Transition.Child>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-400"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-400"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div style={styles.transitionEnd} onClick={(e) => e.stopPropagation()}>
                        <div style={{ position: "relative", width: "100%" }}>
                            <button
                                type="button"
                                aria-label="Close"
                                style={{
                                    width: "1.5rem",
                                    position: "absolute",
                                    right: "1.5rem",
                                    top: "1.5rem",
                                    cursor: "pointer",
                                    color: appearance?.colors?.border,
                                    outlineOffset: "4px",
                                    borderRadius: "100%",
                                }}
                                onClick={() => setModalOpen(false)}
                            >
                                <X />
                            </button>
                        </div>
                        <iframe
                            ref={iframeRef}
                            src={iframeSrc}
                            onLoad={handleIframeLoaded}
                            title="Authentication Modal"
                            style={{
                                width: "448px",
                                height: "500px",
                                border: `1px solid ${appearance?.colors?.border ?? "#D0D5DD"}`,
                                borderRadius: appearance?.borderRadius ?? "16px",
                                padding: "48px 40px 32px",
                                backgroundColor: appearance?.colors?.background ?? "#FFFFFF",
                                animation: "fadeIn 3s ease-in-out",
                            }}
                        />
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition.Root>
    );
}

const styles: { [key: string]: CSSProperties } = {
    dialog: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "auto",
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
    },
    transitionBegin: {
        background: "rgba(139, 151, 151, 0.2)",
        backdropFilter: "blur(2px)",
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        transitionProperty: "opacity",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "300ms",
        zIndex: -10,
    },
    transitionEnd: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.25rem",
        margin: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        zIndex: 30,
    },
};
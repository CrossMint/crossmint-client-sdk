import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { Crossmint, createCrossmint } from "@crossmint/common-sdk-base";

import { SESSION_PREFIX } from "../utils";

export interface CrossmintContext {
    crossmint: Crossmint;
    setJwt: (jwt: string | undefined) => void;
}
const CrossmintContext = createContext<CrossmintContext | null>(null);

function parseCookieFromBrowser(document?: Document) {
    return document?.cookie
        .split("; ")
        .find((row) => row.startsWith(SESSION_PREFIX))
        ?.split("=")[1];
}

export function CrossmintProvider({
    children,
    ...createCrossmintParams
}: { children: ReactNode } & Parameters<typeof createCrossmint>[0]) {
    const [jwt, setJwt] = useState<string | undefined>(parseCookieFromBrowser(document));
    const crossmint = createCrossmint({ ...createCrossmintParams, jwt });

    return <CrossmintContext.Provider value={{ setJwt, crossmint }}>{children}</CrossmintContext.Provider>;
}

export function useCrossmint(missingContextMessage?: string) {
    const context = useContext(CrossmintContext);
    if (context == null) {
        throw new Error(missingContextMessage ?? "useCrossmint must be used within a CrossmintProvider");
    }
    return context;
}

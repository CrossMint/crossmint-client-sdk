"use client";

import AuthModal from "@/components/AuthModal";
import { CrossmintService } from "@/services/CrossmintService";
import { CrossmintEnvironment } from "@/utils";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    login: () => void;
    logout: () => void;
    jwt: string | null;
};

const AuthContext = createContext<AuthContextType>({
    login: () => {},
    logout: () => {},
    jwt: null,
});

export type AuthProviderParams = {
    apiKey: string;
    environment: CrossmintEnvironment;
    children: ReactNode;
    embeddedWallets: {
        type: "evm-smart-wallet";
        defaultChain: "polygon-amoy" | "base-sepolia";
        createOnLogin: "all-users" | "off";
    };
};

const getJwtFromCookie = (): string | null => {
    if (typeof document === "undefined") return null; // Check if we're on the client-side
    const crossmintSession = document.cookie.split("; ").find((row) => row.startsWith("crossmint-session"));
    return crossmintSession ? crossmintSession.split("=")[1] : null;
};

export function AuthProvider({ children, apiKey, environment, embeddedWallets }: AuthProviderParams) {
    const [jwtToken, setJwtToken] = useState<string | null>(() => getJwtFromCookie());

    const [modalOpen, setModalOpen] = useState(false);

    const crossmintService = useMemo(() => new CrossmintService(apiKey, jwtToken, environment), undefined);

    const login = () => {
        if (jwtToken) {
            console.log("User already logged in");
            return;
        }

        setModalOpen(true);
    };

    useEffect(() => {
        if (jwtToken == null) {
            return;
        }

        setModalOpen(false);
    }, [jwtToken, embeddedWallets.createOnLogin]);

    const logout = () => {
        document.cookie = "crossmint-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setJwtToken(null);
    };

    useEffect(() => {
        if (jwtToken) {
            // TODO: WAL-2562: get user data from crossmint
            // setUser({
            //     id: "1",
            //     email: "test@test.com",
            //     name: "Test",
            // });

            document.cookie = `crossmint-session=${jwtToken}; path=/;`;
        }
    }, [jwtToken]);

    return (
        <AuthContext.Provider value={{ login, logout, jwt: jwtToken }}>
            {children}
            {modalOpen && (
                <AuthModal
                    baseUrl={crossmintService.crossmintBaseUrl}
                    setModalOpen={setModalOpen}
                    setJwtToken={setJwtToken}
                    apiKey={apiKey}
                />
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

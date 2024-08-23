"use client";

import AuthModal from "@/components/AuthModal";
import { CrossmintServiceFactory } from "@/services/CrossmintService";
import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

import { Crossmint } from "@crossmint/common-sdk-base";

type AuthContextType = {
    login: () => void;
    logout: () => void;
    jwt: string | undefined;
};

const AuthContext = createContext<AuthContextType>({
    login: () => {},
    logout: () => {},
    jwt: undefined,
});

export type AuthProviderParams = {
    setJwtToken: (jwtToken: string | undefined) => void;
    crossmint: Crossmint;
    children: ReactNode;
};

export function AuthProvider({ children, crossmint, setJwtToken }: AuthProviderParams) {
    const [modalOpen, setModalOpen] = useState(false);

    const crossmintService = useMemo(
        () => CrossmintServiceFactory.create(crossmint.apiKey, crossmint.jwt),
        [crossmint.apiKey, crossmint.jwt]
    );

    const login = () => {
        if (crossmint.jwt) {
            console.log("User already logged in");
            return;
        }

        setModalOpen(true);
    };

    useEffect(() => {
        if (crossmint.jwt == null) {
            return;
        }

        setModalOpen(false);
    }, [crossmint.jwt]);

    const logout = () => {
        document.cookie = "crossmint-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setJwtToken(undefined);
    };

    useEffect(() => {
        if (crossmint.jwt) {
            // TODO: WAL-2562: get user data from crossmint
            // setUser({
            //     id: "1",
            //     email: "test@test.com",
            //     name: "Test",
            // });

            document.cookie = `crossmint-session=${crossmint.jwt}; path=/;SameSite=Lax;`;
        }
    }, [crossmint.jwt]);

    return (
        <AuthContext.Provider value={{ login, logout, jwt: crossmint.jwt }}>
            {children}
            {modalOpen && (
                <AuthModal
                    baseUrl={crossmintService.crossmintBaseUrl}
                    setModalOpen={setModalOpen}
                    setJwtToken={setJwtToken}
                    apiKey={crossmint.apiKey}
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

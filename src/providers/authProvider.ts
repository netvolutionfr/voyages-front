import type { AuthProvider } from "@refinedev/core";
import Keycloak from "keycloak-js";
import {sha256} from "js-sha256";

const PUBLIC_PATHS = ["/premier-acces"];

const isPublicPath = (path: string) =>
    PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

export const keycloak = new Keycloak(keycloakConfig);

export const authProvider: AuthProvider = {
    login: async () => {
        // manuellement, si besoin
        keycloak.login({ redirectUri: window.location.href });
        return { success: true };
    },

    logout: async () => {
        // Effectue une déconnexion et redirige vers la page de Keycloak
        await keycloak.logout({
            redirectUri: window.location.origin, // Redirige vers la racine de votre application
        });
        return {
            success: true,
            redirectTo: "/", // Redirection Refine après la déconnexion
        };
    },

    check: async () => {
        const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

        if (isPublicPath(pathname)) {
            return { authenticated: true };
        }

        const isAuthenticated = !!keycloak.token;
        if (!isAuthenticated) {
            keycloak.login({ redirectUri: window.location.href });
            return { authenticated: false };
        }

        return { authenticated: true };
    },

    getIdentity: async () => {
        if (keycloak.tokenParsed) {
            return {
                ...keycloak.tokenParsed,
                avatar: `https://www.gravatar.com/avatar/${sha256(keycloak.tokenParsed.email || "").toString()}`
                ,
            };
        }
        return Promise.reject({});
    },

    onError: async (error) => {
        console.error(error);
        return { error };
    },
};

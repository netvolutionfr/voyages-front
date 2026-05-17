import type { AuthProvider } from "@refinedev/core";
import {clearAuth, isAccessExpired, readAuth} from "@/auth/token.ts";
import {api} from "@/auth/api.ts";
import {refreshIfNeeded} from "@/auth/http.ts";

const API_URL = import.meta.env.VITE_API_URL;

export const authProvider: AuthProvider = {
    login: async () => ({ success: true, redirectTo: "/" }),
    logout: async () => {
        clearAuth();
        // Demander au backend d'invalider le cookie httpOnly du refresh token
        fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
        return { success: true, redirectTo: "/login" };
    },
    check: async () => {
        const auth = readAuth();
        if (auth && !isAccessExpired(auth, 0)) return { authenticated: true };

        // Token absent (rechargement de page) ou expiré → tenter restore via cookie httpOnly
        const ok = await refreshIfNeeded();
        if (!ok) {
            clearAuth();
            return { authenticated: false, redirectTo: "/login" };
        }
        return { authenticated: true };
    },
    getIdentity: async () => {
        try {
            return await api.get("/me");
        } catch {
            return null;
        }
    },
    onError: async () => ({}),
    forgotPassword: async () => ({ success: false }),
    updatePassword: async () => ({ success: false }),
};


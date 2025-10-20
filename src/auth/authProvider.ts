import type { AuthProvider } from "@refinedev/core";
import {clearAuth, readAuth} from "@/auth/token.ts";
import {api} from "@/auth/api.ts";

export const authProvider: AuthProvider = {
    login: async () => ({ success: true, redirectTo: "/" }),
    logout: async () => {
        clearAuth();
        return { success: true, redirectTo: "/login" };
    },
    check: async () => {
        const auth = readAuth();

        if (!auth) return { authenticated: false, redirectTo: "/login" };

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


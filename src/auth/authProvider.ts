import type { AuthProvider } from "@refinedev/core";
import { api } from "@/lib/axios";

type Identity = { id: string; email: string; firstName?: string; lastName?: string; roles: string[] };

export const authProvider: AuthProvider = {
    login: async () => ({ success: true, redirectTo: "/" }),
    logout: async () => {
        await api.post("/api/auth/logout");
        return { success: true, redirectTo: "/login" };
    },
    check: async () => {
        try {
            const res = await api.get("/api/me");
            return res.status === 200 ? { authenticated: true } : { authenticated: false, redirectTo: "/login" };
        } catch {
            return { authenticated: false, redirectTo: "/login" };
        }
    },
    getIdentity: async () => {
        try {
            const { data } = await api.get<Identity>("/api/me");
            return data;
        } catch {
            return null;
        }
    },
    onError: async () => ({}),
    forgotPassword: async () => ({ success: false }),
    updatePassword: async () => ({ success: false }),
};

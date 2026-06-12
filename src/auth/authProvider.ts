import type { AuthProvider } from "@refinedev/core";
import {clearAuth, isAccessExpired, readAuth} from "@/auth/token.ts";
import {api, ApiError} from "@/auth/api.ts";
import {refreshIfNeeded} from "@/auth/http.ts";
import {xsrfHeader} from "@/auth/csrf.ts";

const API_URL = import.meta.env.VITE_API_URL;

export const authProvider: AuthProvider = {
    login: async () => ({ success: true, redirectTo: "/" }),
    logout: async () => {
        // Purge locale immédiate (token mémoire + cache identité via clearAuth)
        clearAuth();
        // Invalidation du cookie httpOnly côté serveur : on ATTEND la réponse,
        // sinon un échec silencieux laisse une session restaurable au prochain check().
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: xsrfHeader(),
            });
        } catch {
            // Best-effort : l'état local est déjà purgé ; le refresh token
            // expirera côté serveur même si cet appel n'a pas abouti.
        }
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
    onError: async (error) => {
        // Un 401 ici signifie que apiFetch a déjà tenté refresh + retry sans succès :
        // la session est révoquée, on force le logout au lieu de laisser l'écran monté.
        const status = error instanceof ApiError ? error.status : (error as { statusCode?: number })?.statusCode;
        if (status === 401) {
            clearAuth();
            return { logout: true, redirectTo: "/login", error };
        }
        return { error };
    },
    forgotPassword: async () => ({ success: false }),
    updatePassword: async () => ({ success: false }),
};

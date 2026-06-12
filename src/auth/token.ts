import { clearIdentityCache } from "@/auth/session";

export type StoredAuth = {
    tokenType: string;          // "Bearer"
    accessToken: string;        // JWT
    accessTokenExpiresAt?: string | null;
    // Le refresh token est stocké exclusivement dans un cookie httpOnly côté serveur
};

let _auth: StoredAuth | null = null;

export function saveAuth(p: {
    tokenType: string;
    accessToken: string;
    expiresIn?: number;         // en secondes, ex: 900
}) {
    const accessTokenExpiresAt = p.expiresIn
        ? new Date(Date.now() + p.expiresIn * 1000).toISOString()
        : readJwtExp(p.accessToken);

    _auth = {
        tokenType: p.tokenType,
        accessToken: p.accessToken,
        accessTokenExpiresAt,
    };
}

export function readAuth(): StoredAuth | null {
    return _auth;
}

export function clearAuth() {
    _auth = null;
    // L'identité (rôle RBAC) est dérivée du JWT : elle doit tomber avec lui,
    // sinon le cache 60s peut servir un rôle obsolète après révocation/logout.
    clearIdentityCache();
}

// --- helpers JWT ---
export function decodeJwt<T = unknown>(jwt: string): T | null {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;
    try {
        const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodeURIComponent(escape(json))) as T;
    } catch { return null; }
}

/** Retourne une date ISO si le JWT contient `exp`, sinon null */
export function readJwtExp(jwt: string): string | null {
    const payload = decodeJwt<{ exp?: number }>(jwt);
    if (!payload?.exp) return null;
    return new Date(payload.exp * 1000).toISOString();
}

/** vrai si l’accessToken a expiré (ou va expirer dans `skewSec` secondes) */
export function isAccessExpired(auth: StoredAuth | null, skewSec = 5): boolean {
    if (!auth?.accessTokenExpiresAt) return false; // si on ne sait pas, on laisse passer
    return new Date(auth.accessTokenExpiresAt).getTime() - Date.now() <= skewSec * 1000;
}
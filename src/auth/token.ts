export type StoredAuth = {
    tokenType: string;          // "Bearer"
    accessToken: string;        // JWT
    refreshToken?: string | null;
    // date absolue ISO de l’expiration de l’accessToken
    accessTokenExpiresAt?: string | null;
    refreshTokenExpiresAt?: string | null;
};

const KEY = "auth.jwt";

export function saveAuth(p: {
    tokenType: string;
    accessToken: string;
    expiresIn?: number;         // en secondes, ex: 900
    refreshToken?: string | null;
    refreshTokenExpiresIn?: number | null;
}) {
    const now = Date.now();
    const accessTokenExpiresAt = p.expiresIn
        ? new Date(now + p.expiresIn * 1000).toISOString()
        : readJwtExp(p.accessToken);
    const refreshTokenExpiresAt = p.refreshToken && p.refreshTokenExpiresIn
        ? new Date(now + p.refreshTokenExpiresIn * 1000).toISOString()
        : null;

    const payload: StoredAuth = {
        tokenType: p.tokenType,
        accessToken: p.accessToken,
        refreshToken: p.refreshToken ?? null,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
}

export function readAuth(): StoredAuth | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as StoredAuth; } catch { return null; }
}

export function clearAuth() {
    localStorage.removeItem(KEY);
}

// --- helpers JWT ---
export function decodeJwt<T = any>(jwt: string): T | null {
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
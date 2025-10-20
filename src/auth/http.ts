// src/auth/http.ts
import { readAuth, saveAuth, clearAuth, isAccessExpired } from "@/auth/token";
import {getIdentityFromJwt, setIdentityCache} from "@/auth/session.ts";

const API_URL = import.meta.env.VITE_API_URL;

let refreshing: Promise<Response | null> | null = null;

async function refreshIfNeeded(): Promise<boolean> {
    const auth = readAuth();
    if (!auth) return false;
    if (!isAccessExpired(auth)) return true; // encore bon

    // pas de refresh token => impossible (PENDING typiquement)
    if (!auth.refreshToken) return false;

    // éviter courses : une seule requête /auth/refresh à la fois
    if (!refreshing) {
        refreshing = fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ refreshToken: auth.refreshToken }),
        }).then(async (r) => {
            if (!r.ok) return null;
            const data = await r.json();
            // attendu: { tokenType, accessToken, expiresIn, refreshToken? }
            saveAuth({
                tokenType: data.tokenType,
                accessToken: data.accessToken,
                expiresIn: data.expiresIn,
                refreshToken: data.refreshToken ?? auth.refreshToken, // rotation éventuelle
            });
            setIdentityCache(getIdentityFromJwt());
            return r;
        }).finally(() => { refreshing = null; });
    }
    const res = await refreshing;
    return !!res;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const url = path.startsWith("http") ? path : `${API_URL}${path}`;
    const auth = readAuth();

    // tenter refresh proactif si expiré
    if (auth && isAccessExpired(auth)) {
        const ok = await refreshIfNeeded();
        if (!ok) clearAuth();
    }

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        ...(auth ? { Authorization: `${auth.tokenType} ${auth.accessToken}` } : {}),
    };

    let res = await fetch(url, { ...init, headers, credentials: "include" });

    // si 401 → tenter refresh et rejouer
    if (res.status === 401) {
        const refreshed = await refreshIfNeeded();
        if (refreshed) {
            const auth2 = readAuth();
            const headers2: HeadersInit = {
                ...headers,
                ...(auth2 ? { Authorization: `${auth2.tokenType} ${auth2.accessToken}` } : {}),
            };
            res = await fetch(url, { ...init, headers: headers2, credentials: "include" });
        }
        if (res.status === 401) {
            clearAuth(); // refresh impossible ou invalide
        }
    }
    return res;
}
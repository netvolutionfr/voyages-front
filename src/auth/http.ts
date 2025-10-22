// src/auth/http.ts
import { readAuth, saveAuth, clearAuth, isAccessExpired } from "@/auth/token";
import {getIdentityFromJwt, setIdentityCache} from "@/auth/session.ts";
import {isBodyLike} from "@/auth/api.ts";

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
            body: JSON.stringify({ refresh_token: auth.refreshToken }),
        }).then(async (r) => {
            if (!r.ok) return null;
            const data = await r.json();
            saveAuth({
                tokenType: data.token_type,
                accessToken: data.access_token,
                expiresIn: data.expires_in,
                refreshToken: data.refresh_token // rotation donc nouveau refresh token
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

    // 1) Lire l'état courant
    let auth = readAuth();

    // 2) Refresh proactif si expiré
    if (auth && isAccessExpired(auth)) {
        const ok = await refreshIfNeeded();
        if (!ok) {
            clearAuth();
        }
        // 🔑 Re-lire l’auth après refresh pour récupérer le NOUVEL access token
        auth = readAuth();
    }

    const headersObj: Record<string, string> = {
        ...toRecord(init.headers),
        ...(auth ? { Authorization: `${auth.tokenType} ${auth.accessToken}` } : {}),
    };

    if (init.body !== undefined) {
        if (!isBodyLike(init.body)) {
            headersObj["Content-Type"] = "application/json";
        } else {
            delete headersObj["Content-Type"];
            delete headersObj["content-type" as keyof typeof headersObj];
        }
    }

    let res = await fetch(url, { ...init, headers: headersObj, credentials: "include" });

    // si 401 → tenter refresh et rejouer
    if (res.status === 401) {
        const refreshed = await refreshIfNeeded();
        if (refreshed) {
            const auth2 = readAuth();
            const headers2: HeadersInit = {
                ...headersObj,
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

function toRecord(h?: HeadersInit): Record<string, string> {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Array.isArray(h))     return Object.fromEntries(h);
    return { ...h };
}
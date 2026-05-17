// src/auth/http.ts
import { readAuth, saveAuth, clearAuth, isAccessExpired } from "@/auth/token";
import {getIdentityFromJwt, setIdentityCache} from "@/auth/session.ts";
import {isBodyLike} from "@/auth/api.ts";

const API_URL = import.meta.env.VITE_API_URL;

let refreshing: Promise<Response | null> | null = null;

export async function refreshIfNeeded(): Promise<boolean> {
    const auth = readAuth();
    if (auth && !isAccessExpired(auth)) return true; // token valide en mémoire

    // Token absent (premier chargement) ou expiré → refresh via cookie httpOnly
    if (!refreshing) {
        refreshing = fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        }).then(async (r) => {
            if (!r.ok) return null;
            const data = await r.json();
            saveAuth({
                tokenType: data.token_type,
                accessToken: data.access_token,
                expiresIn: data.expires_in,
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

    // 1) S’assurer qu’on a un token valide (refresh si absent ou expiré)
    let auth = readAuth();
    if (!auth || isAccessExpired(auth)) {
        const ok = await refreshIfNeeded();
        if (!ok) clearAuth();
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

    // si 401 → tenter refresh et rejouer une fois
    if (res.status === 401) {
        clearAuth(); // invalider le token mémoire avant de refresh
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
            clearAuth();
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
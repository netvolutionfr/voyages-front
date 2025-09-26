import type {Identity} from "@/auth/types.ts";

const API_URL = import.meta.env.VITE_API_URL;

type MeCache = { me: Identity; expiresAt: number } | null;
let _cache: MeCache = null;

export async function fetchMe(force: boolean = false): Promise<Identity | null> {
    const now = Date.now();
    if (!force && _cache && _cache.expiresAt > now) return _cache.me;

    const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        _cache = null;
        return null;
    }
    const me = (await res.json()) as Identity;
    _cache = { me, expiresAt: now + 60_000 }; // TTL 60s
    return me;
}

export function clearMeCache(): void {
    _cache = null;
}

import {readAuth} from "@/auth/token.ts";

export type Identity = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "USER";
    status?: "ACTIVE" | "PENDING";
};

let memIdentity: { value: Identity | null; expiresAt: number } | null = null;

export function decodeJwtPayload<T = any>(jwt?: string): T | null {
    if (!jwt) return null;
    try {
        const [, b64] = jwt.split(".");
        const json = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodeURIComponent(escape(json))) as T;
    } catch {
        return null;
    }
}

export function setIdentityCache(id: Identity | null, ttlMs = 60_000) {
    memIdentity = { value: id, expiresAt: Date.now() + ttlMs };
}

export function clearIdentityCache() {
    memIdentity = null;
}

/** Renvoie l'identité en lecture rapide (JWT), ou null si insuffisant */
export function getIdentityFromJwt(): Identity | null {
    const auth = readAuth();
    const p = decodeJwtPayload<any>(auth?.accessToken);
    if (!p) return null;
    // adapter les champs selon ton contrat de JWT
    return {
        id: p.sub,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        role: p.role,           // ou dériver depuis p.roles[0]
        status: p.status,
    };
}

/** Renvoie l'identité (cache mémoire 60s) ou null si indisponible */
export async function getIdentityCached(fetcher: () => Promise<Identity | null>): Promise<Identity | null> {
    if (memIdentity && memIdentity.expiresAt > Date.now()) return memIdentity.value;
    // 1) Fast-path via JWT
    const fromJwt = getIdentityFromJwt();
    if (fromJwt && fromJwt.role) {
        setIdentityCache(fromJwt);
        return fromJwt;
    }
    // 2) Fallback réseau
    const id = await fetcher().catch(() => null);
    setIdentityCache(id);
    return id;
}
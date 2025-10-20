// src/auth/api.ts
import { apiFetch } from "./http";

export class ApiError<T = unknown> extends Error {
    status: number;
    data?: T;
    constructor(message: string, status: number, data?: T) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

type ApiOptions = {
    headers?: HeadersInit;
    signal?: AbortSignal;
    withAuth?: boolean; // si un jour tu veux bypass l'Authorization (par défaut: true via apiFetch)
    params?: Record<string, unknown>;
};

function buildUrl(path: string, params?: Record<string, unknown>) {
    if (!params || Object.keys(params).length === 0) return path;
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) {
            v.forEach(x => usp.append(k, String(x)))
        } else {
            usp.set(k, String(v));
        }
    }
    return `${path}${path.includes("?") ? "&" : "?"}${usp.toString()}`;
}

// Détecter FormData/Blob pour ne PAS forcer Content-Type
function isBodyLike(b: unknown): b is BodyInit {
    return b instanceof FormData || b instanceof Blob || b instanceof URLSearchParams;
}

async function handle<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as unknown as T; // no content
    const text = await res.text();
    if (!text) {
        if (!res.ok) throw new ApiError("HTTP error", res.status);
        return undefined as unknown as T;
    }
    try {
        const json = JSON.parse(text);
        if (!res.ok) throw new ApiError(json?.message || "HTTP error", res.status, json);
        return json as T;
    } catch {
        // pas du JSON
        if (!res.ok) throw new ApiError(text || "HTTP error", res.status);
        return text as T;
    }
}

async function request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    options: ApiOptions = {}
) {
    const url = buildUrl(path, options.params);
    const init: RequestInit = { method, signal: options.signal, headers: options.headers };

    if (body !== undefined) {
        if (isBodyLike(body)) {
            init.body = body as BodyInit;
            // ne pas fixer Content-Type, le navigateur le fera
            init.headers = { ...(options.headers || {}) };
        } else {
            init.body = JSON.stringify(body);
            init.headers = { "Content-Type": "application/json", ...(options.headers || {}) };
        }
    }

    const res = await apiFetch(url, init); // gère Authorization + refresh + retry 401
    return handle<T>(res);
}

export const api = {
    get: <T>(path: string, options?: ApiOptions) => request<T>("GET", path, undefined, options),
    delete: <T>(path: string, options?: ApiOptions) => request<T>("DELETE", path, undefined, options),
    post: <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>("POST", path, body, options),
    put:  <T>(path: string, body?: unknown, options?: ApiOptions) => request<T>("PUT", path, body, options),
    patch:<T>(path: string, body?: unknown, options?: ApiOptions) => request<T>("PATCH", path, body, options),
};
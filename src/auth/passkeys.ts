import {b64urlToArrayBuffer, arrayBufferToB64url, base64urlToBuffer, bufferToBase64url} from "@/lib/base64url";
import type {
    PublicKeyCredentialRequestOptionsJSON,
    AssertionResponseJSON, ServerRegistrationOptions, AttestationResponsePayload,
} from "@/lib/credentials";

const API_URL = import.meta.env.VITE_API_URL;

// ---------------- CSRF Helper ----------------
function readCookie(name: string): string | null {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
}
async function xsrfHeader(): Promise<Record<string, string>> {
    await fetch(`${API_URL}/api/auth/csrf`, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" },
    });
    const token = readCookie("XSRF-TOKEN");
    return token ? { "X-XSRF-TOKEN": token } : {};
}

// ---------------- Fetch Wrapper ----------------
export const authApi = async (path: string, init?: RequestInit) => {
    const method = (init?.method || "GET").toUpperCase();
    const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(needsCsrf ? await xsrfHeader() : {}),
        ...(init?.headers || {}),
    };
    return fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...init,
        headers,
    });
};

// ---------------- Registration ----------------
export async function beginRegistration(token: string): Promise<unknown> {
    if (!token) throw new Error("Token manquant");


// 1) Récupérer les options du serveur
    const res = await authApi(`/webauthn/register/options`, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error(`Impossible d'obtenir les options (HTTP ${res.status})`);
    const options: ServerRegistrationOptions = await res.json();


// 2) Convertir pour WebAuthn API
    const publicKey: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
            ...options.user,
            id: base64urlToBuffer(options.user.id),
        },
        excludeCredentials: (options.excludeCredentials || []).map((c) => ({
            ...c,
            id: base64urlToBuffer(c.id),
        })),
    };


// 3) Créer la passkey (type précis avec attestation)
    const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Création annulée");


// 4) Préparer la réponse
    const att = cred.response as AuthenticatorAttestationResponse;


// Type guard pour getTransports sans any
    type WithTransports = { getTransports: () => string[] };
    const hasGetTransports = (obj: unknown): obj is WithTransports =>
        typeof obj === "object" && obj !== null && typeof (obj as WithTransports).getTransports === "function";


    const clientExtensionResults: AuthenticationExtensionsClientOutputs = cred.getClientExtensionResults();
    const transports: string[] | undefined = hasGetTransports(att) ? (att as WithTransports).getTransports() : undefined;


    const payload: { token: string; credential: AttestationResponsePayload } = {
        token,
        credential: {
            id: cred.id,
            type: cred.type as PublicKeyCredentialType,
            rawId: bufferToBase64url(cred.rawId),
            response: {
                attestationObject: bufferToBase64url(att.attestationObject),
                clientDataJSON: bufferToBase64url(att.clientDataJSON),
                transports,
            },
            clientExtensionResults,
        },
    };


// 5) Envoyer au backend
    const fin = await authApi(`/webauthn/register/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!fin.ok) {
        const txt = await fin.text();
        throw new Error(txt || `Erreur (HTTP ${fin.status})`);
    }
    return fin.json().catch(() => ({}));
}
// ---------------- Authentication ----------------
export async function beginAuthentication() {
    // 1) Get options (POST obligatoire)
    const res = await authApi(`/webauthn/authenticate/options`, { method: "POST" });
    if (!res.ok) throw new Error("Erreur d’obtention des options d’authentification");
    const opts: PublicKeyCredentialRequestOptionsJSON = await res.json();

    const publicKey: PublicKeyCredentialRequestOptions = {
        ...opts,
        challenge: b64urlToArrayBuffer(opts.challenge),
        allowCredentials: opts.allowCredentials?.map((c) => ({
            ...c,
            id: b64urlToArrayBuffer(c.id),
        })),
    };

    const cred = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Authentification annulée");

    const assertion = cred.response as AuthenticatorAssertionResponse;

    const payload: AssertionResponseJSON & {
        clientExtensionResults: AuthenticationExtensionsClientOutputs;
        authenticatorAttachment: AuthenticatorAttachment | null;
    } = {
        id: cred.id,
        rawId: arrayBufferToB64url(cred.rawId),
        type: cred.type,
        clientDataJSON: arrayBufferToB64url(assertion.clientDataJSON),
        authenticatorData: arrayBufferToB64url(assertion.authenticatorData),
        signature: arrayBufferToB64url(assertion.signature),
        userHandle: assertion.userHandle ? arrayBufferToB64url(assertion.userHandle) : null,
        clientExtensionResults: cred.getClientExtensionResults(),
        authenticatorAttachment: cred.authenticatorAttachment as AuthenticatorAttachment ?? null,
    };

    // 2) Verify assertion — endpoint Spring
    const verify = await authApi(`/login/webauthn`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!verify.ok) throw new Error("Vérification d’assertion échouée");
    return await verify.json();
}

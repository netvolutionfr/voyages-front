import {b64urlToArrayBuffer, arrayBufferToB64url, base64urlToBuffer} from "@/lib/base64url";
import type {
    PublicKeyCredentialRequestOptionsJSON,
    AssertionResponseJSON, ServerRegistrationOptions
} from "@/lib/credentials";

const API_URL = import.meta.env.VITE_API_URL;

// ---------------- CSRF Helper ----------------
function readCookie(name: string): string | null {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
}
async function xsrfHeader(): Promise<Record<string, string>> {
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

function pickB64url(v: string | { value: string } | undefined): string {
    if (!v) throw new Error("Valeur manquante");
    return typeof v === "string" ? v : v.value;
}

function toArrayBufferId(id: string | { value: string }): ArrayBuffer {
    return base64urlToBuffer(pickB64url(id));
}

export function normalizeCreationOptions(options: ServerRegistrationOptions): PublicKeyCredentialCreationOptions {
    const challengeB64 = pickB64url(options.challenge);

    const exclude = (options.excludeCredentials ?? []).map((c) => ({
        type: c.type,
        id: toArrayBufferId(c.id),
        transports: c.transports,
    }));

    return {
        rp: options.rp,
        user: {
            id: toArrayBufferId(options.user.id),
            name: String(options.user.name ?? ""),          // peut rester un handle opaque
            displayName: String(options.user.displayName ?? ""),
        },
        challenge: base64urlToBuffer(challengeB64),
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        excludeCredentials: exclude.length ? exclude : undefined,
        authenticatorSelection: options.authenticatorSelection,
        attestation: options.attestation ?? "none",
        // ne PAS transmettre `hints` et passer `extensions` à undefined si null
        extensions: (options.extensions ?? undefined) as AuthenticationExtensionsClientInputs | undefined,
    };
}

// ---------------- Registration ONE STEP---------

// email=stanis@netvolution.fr, displayName=null, registrationRequest={"username":"stanis@netvolution.fr","userId":"MTA1YzlhMDAtMWY3Yy00NTZiLWExZDUtNDZlOTEzNDg0YjA3","credential":{"type":"public-key","rawId":"DefNEhAtrghwU97G7fE4RZoiXAk","id":"DefNEhAtrghwU97G7fE4RZoiXAk","response":{"clientDataJSON":"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoidTdzRG8wclB3RGJNQ2F2cjhhSG9Zb3FFVENUajZhdnNnNEpzNzB3T29SVSIsIm9yaWdpbiI6Imh0dHBzOi8vY2FtcHVzYXdheS5mciJ9","attestationObject":"o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYZU4o1QP2Br4QTh4gxxKSPjwJWoINqJjGMjEnWttcvCRdAAAAAPv8MAcVTk7MjAtuAgVX170AFA3nzRIQLa4IcFPexu3xOEWaIlwJpQECAyYgASFYIAfEhvRjXMzLt7QzhvOKaP3DLd_qHLzMsiz-Pfth7GDmIlggYhU2XS5I06UlAKWboD3VXzvSRwwQZPl52n4o9UmbPrY"},"authenticatorAttachment":"platform"}}
export type CredentialCreationResponse = {
    id: string;
    rawId: string; // base64url
    type: PublicKeyCredentialType;
    response: {
        attestationObject: string; // base64url
        clientDataJSON: string; // base64url
        transports?: string[];
    };
    authenticatorAttachment?: AuthenticatorAttachment | null;
};

export type RegistrationRequest = {
    username: string; // email
    userId: string; // base64url
    credential: CredentialCreationResponse;
}

export type RegistrationOptionsPayload = {
    email: string;
    displayName?: string | null;
    registrationRequest: RegistrationRequest;
};

function makeCredentialCreationResponse(cred: PublicKeyCredential): CredentialCreationResponse {
    const att = cred.response as AuthenticatorAttestationResponse;

    type WithTransports = { getTransports: () => string[] };
    const hasGetTransports = (obj: unknown): obj is WithTransports =>
        typeof obj === "object" && obj !== null && typeof (obj as WithTransports).getTransports === "function";

    const transports = hasGetTransports(att) ? att.getTransports() : undefined;


    return {
        id: cred.id,
        type: cred.type as PublicKeyCredentialType,
        rawId: arrayBufferToB64url(cred.rawId),
        response: {
            attestationObject: arrayBufferToB64url(att.attestationObject),
            clientDataJSON: arrayBufferToB64url(att.clientDataJSON),
            transports,
        },
        authenticatorAttachment: (cred.authenticatorAttachment as AuthenticatorAttachment) ?? null,
    };
}

/**
 * Enrôlement passkey "one-step", sans e-mail préalable.
 * - Récupère les options (GET /api/auth/register/options, sans params)
 * - Appelle navigator.credentials.create(...)
 * - Retourne l'objet { registrationRequest: string } pour l’envoyer ensuite à /webauthn/register/finish-onestep
 */
export async function beginRegistrationOneStep(): Promise<CredentialCreationResponse> {
    // 1) Options serveur (GET, sans params)
    const res = await authApi(`/webauthn/register/options`, {
        method: "GET",
        headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`Impossible d'obtenir les options (HTTP ${res.status})`);

    // 2) Conversion en PublicKeyCredentialCreationOptions
    const serverOptions: ServerRegistrationOptions = await res.json();
    console.log("beginRegistrationOneStep - conversion des options", serverOptions);

    const publicKey = normalizeCreationOptions(serverOptions);

    // 3) Création de la passkey (discoverable + UV requis déjà côté serveur)
    const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Création annulée");

    return makeCredentialCreationResponse(cred);
}

/**
 * Finalisation one-step avec email + displayName après create()
 */
export async function finishRegistrationOneStep(
    args: RegistrationOptionsPayload
): Promise<unknown> {
    const fin = await authApi(`/webauthn/register/finish-onestep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            {
                email: args.email,
                displayName: args.displayName ?? null,
                registrationRequest: JSON.stringify(args.registrationRequest),
            },
        ),
    });
    if (!fin.ok) {
        const txt = await fin.text();
        throw new Error(txt || `Erreur finish-onestep (HTTP ${fin.status})`);
    }
    return fin.json().catch(() => ({}));
}
// ---------------- Authentication ----------------
export async function beginAuthentication(opts?: { conditional?: boolean; signal?: AbortSignal }) {
    // 1) Récupérer les options d’authentification (POST)
    const res = await authApi(`/webauthn/authenticate/options`, { method: "POST" });
    if (!res.ok) throw new Error("Erreur d’obtention des options d’authentification");
    const srv: PublicKeyCredentialRequestOptionsJSON = await res.json();

    // IMPORTANT : pour la Conditional UI, le serveur ne doit pas forcer allowCredentials (laisse vide/omise)
    const publicKey: PublicKeyCredentialRequestOptions = {
        ...srv,
        challenge: b64urlToArrayBuffer(srv.challenge),
        allowCredentials: srv.allowCredentials?.length
            ? srv.allowCredentials.map((c) => ({ ...c, id: b64urlToArrayBuffer(c.id) }))
            : undefined, // <= discoverable
    };

    // 2) WebAuthn get() — avec Conditional UI si demandé
    const cred = (await navigator.credentials.get({
        publicKey,
        mediation: opts?.conditional ? "conditional" : "required",
        signal: opts?.signal,
    })) as PublicKeyCredential | null;

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
        authenticatorAttachment: (cred.authenticatorAttachment as AuthenticatorAttachment) ?? null,
    };

    // 3) Vérif côté backend
    const verify = await authApi(`/login/webauthn`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!verify.ok) throw new Error("Vérification d’assertion échouée");
    return verify.json();
}

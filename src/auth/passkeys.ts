import {arrayBufferToB64url, base64urlToBuffer, bufferToBase64url} from "@/lib/base64url";
import type {
    ServerRegistrationOptions,
    RegistrationOptionsPayload,
    CredentialCreationResponse,
    FinishOneStepResponse
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
 ---------------- Registration ONE STEP---------

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
): Promise<FinishOneStepResponse> {
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
    return await fin.json() as Promise<FinishOneStepResponse>;
}

// ------------------ Registration ---------------
export async function beginRegistration(email: string): Promise<CredentialCreationResponse> {
    // 1) Options serveur (GET, sans params)
    const res = await authApi(`/webauthn/register/options`, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: JSON.stringify({ email: email }),
    });
    if (!res.ok) throw new Error(`Impossible d'obtenir les options (HTTP ${res.status})`);

    // 2) Conversion en PublicKeyCredentialCreationOptions
    const serverOptions: ServerRegistrationOptions = await res.json();
    console.log("beginRegistration - conversion des options", serverOptions);

    const publicKey = normalizeCreationOptions(serverOptions);
    console.log("beginRegistration - publicKey", publicKey);

    // 3) Création de la passkey (discoverable + UV requis déjà côté serveur)
    const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Création annulée");

    console.log("beginRegistration - credential created", cred);
    return makeCredentialCreationResponse(cred);
}

/**
 * Finalisation one-step avec email + displayName après create()
 */
export async function finishRegistration(
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
export type CredentialRequestResponse = {
    id: string;
    rawId: string; // base64url
    type: PublicKeyCredentialType;
    response: {
        authenticatorData: string; // base64url
        clientDataJSON: string;    // base64url
        signature: string;         // base64url
        userHandle: string | null;
    };
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
};

export type AuthFinishResponse = {
    tokenType: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    };
};

export async function beginAuthenticationOneStep(): Promise<CredentialRequestResponse> {
    const res = await fetch("/api/webauthn/authenticate/options", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
    });
    if (!res.ok) throw new Error("Impossible d’obtenir les options d’authentification");
    const opts = await res.json();

    const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: opts.challenge.value ? base64urlToBuffer(opts.challenge.value) : base64urlToBuffer(opts.challenge),
        timeout: opts.timeout,
        rpId: opts.rpId,
        allowCredentials: [],
        userVerification: opts.userVerification,
    };

    const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
    if (!assertion) throw new Error("Aucune assertion renvoyée par le navigateur");

    const resObj = assertion.response as AuthenticatorAssertionResponse;
    return {
        id: assertion.id,
        rawId: bufferToBase64url(assertion.rawId),
        type: assertion.type as PublicKeyCredentialType,
        response: {
            authenticatorData: bufferToBase64url(resObj.authenticatorData),
            clientDataJSON: bufferToBase64url(resObj.clientDataJSON),
            signature: bufferToBase64url(resObj.signature),
            userHandle: resObj.userHandle ? bufferToBase64url(resObj.userHandle) : null,
        },
        clientExtensionResults: assertion.getClientExtensionResults(),
    };
}

export async function finishAuthenticationOneStep(
    credential: CredentialRequestResponse
): Promise<AuthFinishResponse> {
    // AuthnFinishRequest[
    // id=J1aQEQEyHV3QxtF6mGAlonEmiZY,
    // rawId=J1aQEQEyHV3QxtF6mGAlonEmiZY,
    // type=public-key,
    // response=Response[
    //      clientDataJSON=eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiU1NmWTRBZUdwcElBSDJ4VVlLckRkWkVvaHl1SWRpckhETHFXNWFLcU95WSIsIm9yaWdpbiI6Imh0dHBzOi8vY2FtcHVzYXdheS5mciJ9,
    //      authenticatorData=ZU4o1QP2Br4QTh4gxxKSPjwJWoINqJjGMjEnWttcvCQdAAAAAA,
    //      signature=MEYCIQDr2n0VWvV_UmuEFIRCh3lsQht61LWQ9ho1hHU2TeftHAIhAKRd03AonVPXcJysEIDVPUWUFFEQG5GgK3wkEknvIgMQ,
    //      userHandle=T0ROa09EQXlaall0T0RKaE9TMDBORFpqTFRneFpESXRPV1F6TkRWbE1qUTRNek5s],
    //      clientExtensionResults={}
    // ],

    // "credential":{
    //      "id":"1chL0JS7tFyK83UqDTUv1zHPysQ",
    //      "rawId":"1chL0JS7tFyK83UqDTUv1zHPysQ",
    //      "type":"public-key",
    //      "response":{
    //          "authenticatorData":"SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MdAAAAAA",
    //          "clientDataJSON":"eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiQUFBQUJ3QUFBQUFBQUFBQUFBQU9BQUFMQ2dBQUFBIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo1MTczIiwiY3Jvc3NPcmlnaW4iOmZhbHNlLCJvdGhlcl9rZXlzX2Nhbl9iZV9hZGRlZF9oZXJlIjoiZG8gbm90IGNvbXBhcmUgY2xpZW50RGF0YUpTT04gYWdhaW5zdCBhIHRlbXBsYXRlLiBTZWUgaHR0cHM6Ly9nb28uZ2wveWFiUGV4In0",
    //          "signature":"MEUCIQCIEIZpObkbmX91_lTNdEwTf-BBApvr_M_W9GdLWe_BCAIgZXCJrdVXN8KtUTw8s6-_9z979DKFY3M2_riT_DUeQJw",
    //          "userHandle":"ZDkxYmI4MzYtYzkwZS00ZWQ4LWJkY2YtN2MxMDMyZGQxMjJh"
    //      },
    //      "clientExtensionResults":{}
    //      }

    const authenticationRequest = {
        id: credential.id,
        rawId: credential.rawId,
        type: credential.type,
        response: {
            authenticatorData: credential.response.authenticatorData,
            clientDataJSON: credential.response.clientDataJSON,
            signature: credential.response.signature,
            userHandle: credential.response.userHandle,
        },
        clientExtensionResults: credential.clientExtensionResults,
    }

    const res = await fetch("/api/webauthn/authenticate/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(authenticationRequest),
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Échec de la finalisation de l’authentification");
    }
    return res.json();
}
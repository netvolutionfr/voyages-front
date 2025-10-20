export type PublicKeyCredentialCreationOptionsJSON = {
    rp: { name: string; id?: string };
    user: { id: string; name: string; displayName: string };
    challenge: string;
    pubKeyCredParams: { type: 'public-key'; alg: number }[];
    timeout?: number;
    attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
    authenticatorSelection?: {
        residentKey?: 'required' | 'preferred' | 'discouraged';
        userVerification?: 'required' | 'preferred' | 'discouraged';
        authenticatorAttachment?: 'platform' | 'cross-platform';
        requireResidentKey?: boolean; // compat
    };
    excludeCredentials?: { type: 'public-key'; id: string; transports?: AuthenticatorTransport[] }[];
};

export type PublicKeyCredentialRequestOptionsJSON = {
    challenge: string;
    timeout?: number;
    rpId?: string;
    userVerification?: 'required' | 'preferred' | 'discouraged';
    allowCredentials?: { type: 'public-key'; id: string; transports?: AuthenticatorTransport[] }[];
};

export type AttestationResponseJSON = {
    id: string;
    rawId: string;
    type: string;
    clientDataJSON: string;
    attestationObject: string;
};

export type AssertionResponseJSON = {
    id: string;
    rawId: string;
    type: string;
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
};

export interface ServerPublicKeyCredentialDescriptor {
    type: PublicKeyCredentialType;
    id: string; // base64url
    transports?: AuthenticatorTransport[];
}


export interface ServerPublicKeyCredentialUserEntity {
    id: string; // base64url
    name: string;
    displayName: string;
}

export type ServerRegistrationOptions = {
    rp: PublicKeyCredentialRpEntity;
    user: { id: string | { value: string }; name: string; displayName?: string };
    challenge: string | { value: string };
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout?: number;
    excludeCredentials?: Array<{
        type: PublicKeyCredentialType;
        id: string | { value: string };
        transports?: AuthenticatorTransport[];
    }>;
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
    // champs additionnels côté serveur qu'on ignorera
    hints?: unknown;
    extensions?: Record<string, unknown> | null;
};

export interface AttestationResponsePayload {
    id: string;
    type: PublicKeyCredentialType;
    rawId: string; // base64url
    response: {
        attestationObject: string; // base64url
        clientDataJSON: string; // base64url
        transports?: string[];
    };
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
}

export type FinishOneStepResponse = {
    tokenType: string;     // "Bearer"
    accessToken: string;   // JWT
    expiresIn: number;     // 900
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "PENDING" | "USER" | "ADMIN" | string;
        status: "PENDING" | "ACTIVE" | string;
    };
};

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

export type FinishResult = {
    email: string;
    status?: "PENDING" | "ACTIVE"
};

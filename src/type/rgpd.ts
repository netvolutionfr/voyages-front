// Contrat backend RGPD — voir docs/adr/ (ADR-0002 à 0006) côté back.

export type DataExport = {
    exportedAt: string;
    format: "voyages-gdpr-export/v1";
    profile: {
        publicId: string;
        email: string;
        firstName: string;
        lastName: string;
        displayName: string;
        gender: "M" | "F" | "N" | null;
        birthDate: string | null;
        telephone: string | null;
        role: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "USER";
        status: "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";
        section: string | null;
        createdAt: string;
        updatedAt: string;
    };
    consent: { givenAt: string | null; text: string | null };
    legalGuardian: { publicId: string; fullName: string; email: string } | null;
    familyLinks: Array<{
        relation: "CHILD" | "PARENT";
        publicId: string;
        fullName: string;
        email: string;
    }>;
    trips: {
        registrations: Array<{
            tripTitle: string;
            destination: string | null;
            departureDate: string | null;
            returnDate: string | null;
            registrationStatus: "PENDING" | "VALIDATED" | "REJECTED" | "ENROLLED" | "CONFIRMED" | "CANCELED";
            registrationDate: string | null;
            decisionDate: string | null;
            decisionMessage: string | null;
        }>;
        preferences: Array<{ tripTitle: string; interest: "YES" | "NO" }>;
    };
    documents: Array<{
        type: string | null;
        originalFilename: string | null;
        mime: string | null;
        size: number;
        sha256: string | null;
        fileNumber: string | null;
        deliveryDate: string | null;
        expirationDate: string | null;
        createdAt: string;
    }>;
    healthForm: { signedAt: string; validUntil: string | null; payload: unknown } | null;
    security: {
        passkeys: Array<{ createdAt: string; aaguid: string }>;
        lastLoginAt: string | null;
    };
};

/** Champs modifiables directement via PATCH /me/profile. */
export type ProfilePatch = Partial<{
    telephone: string;
    displayName: string;
    gender: "M" | "F" | "N";
}>;

export type RectificationField = "FIRST_NAME" | "LAST_NAME" | "BIRTH_DATE" | "EMAIL";

export type RectificationStatus = "PENDING" | "APPLIED" | "REJECTED";

export type RectificationRequest = {
    id: string;
    field: RectificationField;
    requestedValue: string;
    reason: string | null;
    status: RectificationStatus;
    createdAt: string;
    processedAt: string | null;
    adminComment: string | null;
};

/** Demande de rectification vue côté admin (liste paginée). */
export type AdminRectificationRequest = {
    id: string;
    userPublicId: string;
    userFullName: string;
    userEmail: string;
    field: RectificationField;
    requestedValue: string;
    reason: string | null;
    status: RectificationStatus;
    createdAt: string;
};

/** Codes d'erreur stables renvoyés par DELETE /me — le texte est géré côté front. */
export type DeletionErrorCode =
    | "invalid_otp"
    | "too_many_requests"
    | "student_self_erasure_forbidden"
    | "last_active_admin"
    | "active_trip_registration"
    | "guardian_of_active_student";

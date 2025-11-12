export type UUID = string;

export interface StudentHealthFormResponse {
    id: UUID;
    studentPublicId: UUID | null;
    allergies: Allergies | null;
    treatments: Treatments | null;
    emergencyContacts: EmergencyContacts | null;
    consentHospitalization: boolean;
    consentTransport: boolean;
    signedAt: string | null;
    signatureUrl: string | null;
    validUntil: string | null;
    createdAt: string;
    updatedAt: string;
    version: number;
    status: "MISSING" | "INCOMPLETE" | "COMPLETE" | "SIGNED" | "EXPIRED" | null;
}

export interface StudentHealthFormUpsertRequest {
    allergies: Allergies | null;
    treatments: Treatments | null;
    emergencyContacts: EmergencyContacts | null;
    consentHospitalization: boolean;
    consentTransport: boolean;
    validUntil: string | null; // ISO string or null
    expectedVersion: number | null;
}

export interface Allergies {
    drug?: string[] | null;
    food?: string[] | null;
    other?: string[] | null;
    notes?: string | null;
}

export interface Treatments {
    daily?: TreatmentEntry[] | null;
    emergency?: TreatmentEntry[] | null;
    hasPAI?: boolean | null;
    paiDetails?: string | null;
}

export interface TreatmentEntry {
    name: string;
    dose?: string | null;
    schedule?: string | null;
    notes?: string | null;
}

export interface EmergencyContacts {
    primary: EmergencyContact;
    secondary?: EmergencyContact | null;
    backup?: EmergencyContact | null;
}

export interface EmergencyContact {
    name: string;
    relation: string;
    phone: string;
    altPhone?: string | null;
}
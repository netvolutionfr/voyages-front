export type DocumentKind = "FILE" | "FORM";

export type DocumentItem = {
    documentType: {
        id: number;
        code: string;
        label: string;
        kind: DocumentKind;
        acceptedMime?: string[];
        maxSizeMb?: number;
    };
    tripRequired: boolean;
    requiredReasons?: Array<{ tripId: number; label: string }>;
    deadline?: { daysBeforeTrip: number; date: string };
    provided: boolean;
    providedAt?: string;
    lastObject?: { id: string; size: number; mime: string; status: "READY"|"REJECTED"; previewable: boolean };
};

export type DocumentsResponse = {
    userId: number;
    trip: { id: number; title: string; countryId: number };
    items: DocumentItem[];
    missingCount: number;
};
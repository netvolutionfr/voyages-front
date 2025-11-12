import type {IPays} from "@/pages/voyages/IPays.ts";

export type IVoyage = {
    id: number;
    title: string;
    description: string;
    destination: string;
    country?: IPays;
    familyContribution: number;  // en CENTIMES côté API
    coverPhotoUrl?: string;

    tripDates: { from: Date; to: Date; };
    minParticipants: number;
    maxParticipants: number;

    registrationDates: { from: Date; to: Date; };

    poll: boolean;

    sections?: Array<{ id: number; label: string }>;
    chaperones?: Array<{
        publicId: string;
        lastName: string;
        firstName: string;
        email?: string;
        telephone?: string;
    }>;
    formalities?: Array<{
        id: number;
        documentType: {
            id: number;
            abr: string;
            label: string;
            description: string;
        };
        type: 'FILE' | 'TEXT' | 'CHECKBOX';
        required: boolean;
        daysBeforeTrip?: number;
        acceptedMime?: string[];
        maxSizeMb?: number;
        retentionDays?: number;
        storeScan: boolean;
        notes?: string;
        manuallyAdded: boolean;
    }>;
    participants?: Array<{
        id: number; lastName: string; firstNale: string; email: string;
        birthDate: string; gender: 'M' | 'F' | 'N'; telephone?: string;
    }>;
    interestedCount?: number; // nombre de personnes intéressées (si sondage)
    interestedByCurrentUser: boolean;
    registeredByCurrentUser: boolean;
}

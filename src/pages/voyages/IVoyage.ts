import type {IPays} from "@/pages/voyages/IPays.ts";

export type IVoyage = {
    id: number;
    title: string;
    description: string;
    destination: string;
    country?: IPays;
    familyContribution: number;  // en CENTIMES côté API
    totalPrice?: number;           // en CENTIMES côté API
    coverPhotoUrl?: string;
    sectors?: Array<"CYCLE_BAC" | "CYCLE_POST_BAC">;

    tripDates: { from: Date; to: Date; };
    minParticipants: number;
    maxParticipants: number;

    registrationPeriod: { from: Date; to: Date; };

    poll: boolean;

    sections?: Array<{ id: number; label: string }>;
    chaperones?: Array<{ id: number; nom: string }>;
    mandatoryDocuments?: Array<{ id: number; label: string }>;
    participants?: Array<{
        id: number; lastName: string; firstNale: string; email: string;
        birthDate: string; gender: 'M' | 'F' | 'N'; telephone?: string;
    }>;
    interestedCount?: number; // nombre de personnes intéressées (si sondage)
    interestedByCurrentUser: boolean;
}

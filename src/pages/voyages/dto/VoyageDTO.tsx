export type VoyageDTO = {
    id: number;
    title: string;
    description: string;
    destination: string;
    country: {
        id: number;
        name?: string;
    }
    countryName?: string;

    familyContribution: number;  // en CENTIMES côté API
    coverPhotoUrl?: string;

    tripDates: { from: string; to: string }; // ISO
    minParticipants: number;
    maxParticipants: number;

    registrationDates?: { from: string; to: string }; // ISO

    poll: boolean; // indique si le voyage est en mode sondage (dates non confirmées)

    sections?: Array<{ publicId: string; label: string }>;
    chaperones?: Array<{ publicId: string; fullName: string }>;
    mandatoryDocuments?: Array<{ id: number; name: string }>;
    participants?: Array<{
        id: number; lastName: string; firstName: string; email: string;
        birthDate: string; gender: 'M' | 'F' | 'N'; telephone?: string;
    }>;
    updatedAt: string;
}

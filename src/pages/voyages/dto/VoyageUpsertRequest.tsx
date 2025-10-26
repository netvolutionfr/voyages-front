export type VoyageUpsertRequest = {
    id?: number | null;
    title: string;
    description?: string | null;
    destination: string;

    familyContribution?: number | null; // CENTIMES pour l’API
    coverPhotoUrl?: string | null;

    countryId: number;

    tripDates: { from: string; to: string };        // ISO
    minParticipants: number;
    maxParticipants: number;

    registrationDates?: { from: string; to: string } | null;

    poll: boolean; // indique si le voyage est en mode sondage (dates non confirmées)

    chaperoneIds: string[];
    sectionIds: string[];
};

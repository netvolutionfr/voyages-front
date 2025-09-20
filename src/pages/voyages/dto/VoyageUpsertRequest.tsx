export type VoyageUpsertRequest = {
    id?: number | null;
    title: string;
    description?: string | null;
    destination: string;

    totalPrice?: number | null;           // CENTIMES pour l’API
    familyContribution?: number | null; // CENTIMES pour l’API
    coverPhotoUrl?: string | null;

    countryId: number;

    tripDates: { from: string; to: string };        // ISO
    minParticipants: number;
    maxParticipants: number;

    registrationPeriod?: { from: string; to: string } | null;

    poll: boolean; // indique si le voyage est en mode sondage (dates non confirmées)

    chaperoneIds: string[];
    sectionIds: string[];
    sectors: Array<"CYCLE_BAC"|"CYCLE_POST_BAC">;
};

export type VoyageUpsertRequest = {
    id?: number | null;
    nom: string;
    description?: string | null;
    destination: string;

    prixTotal?: number | null;           // CENTIMES pour l’API
    participationDesFamilles?: number | null; // CENTIMES pour l’API
    coverPhotoUrl?: string | null;

    paysId: number;

    datesVoyage: { from: string; to: string };        // ISO
    nombreMinParticipants: number;
    nombreMaxParticipants: number;

    datesInscription?: { from: string; to: string } | null;

    sondage: boolean; // indique si le voyage est en mode sondage (dates non confirmées)

    organisateurIds: string[];
    sectionIds: string[];
    secteurs: Array<"CYCLE_BAC"|"CYCLE_POST_BAC">;
};

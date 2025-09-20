export type VoyageDTO = {
    id: number;
    nom: string;
    description: string;
    destination: string;
    pays: {
        id: number;
        nom?: string;
    }
    paysNom?: string;

    participationDesFamilles: number;  // en CENTIMES côté API
    prixTotal?: number;           // en CENTIMES côté API
    coverPhotoUrl?: string;
    secteurs?: Array<"CYCLE_BAC" | "CYCLE_POST_BAC">;

    datesVoyage: { from: string; to: string }; // ISO
    nombreMinParticipants: number;
    nombreMaxParticipants: number;

    datesInscription?: { from: string; to: string }; // ISO

    sondage: boolean; // indique si le voyage est en mode sondage (dates non confirmées)

    sections?: Array<{ publicId: string; libelle: string }>;
    organisateurs?: Array<{ publicId: string; nom: string }>;
    documentsObligatoires?: Array<{ id: number; nom: string }>;
    participants?: Array<{
        id: number; nom: string; prenom: string; email: string;
        dateNaissance: string; sexe: 'M' | 'F' | 'N'; telephone?: string;
    }>;
    updatedAt: string;
}

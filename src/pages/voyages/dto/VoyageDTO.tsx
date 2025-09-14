export type VoyageDTO = {
    id: number;
    nom: string;
    description: string;
    destination: string;
    paysId: number;
    paysNom?: string;

    participationDesFamilles: number;  // en CENTIMES côté API
    prixTotal?: number;           // en CENTIMES côté API
    coverPhotoUrl?: string;
    secteurs?: Array<"CYCLE_BAC" | "CYCLE_POST_BAC">;

    datesVoyage: { from: string; to: string }; // ISO
    nombreMinParticipants: number;
    nombreMaxParticipants: number;

    datesInscription?: { from: string; to: string }; // ISO

    sections?: Array<{ id: number; libelle: string }>;
    organisateurs?: Array<{ id: number; nom: string }>;
    documentsObligatoires?: Array<{ id: number; nom: string }>;
    participants?: Array<{
        id: number; nom: string; prenom: string; email: string;
        dateNaissance: string; sexe: 'M' | 'F' | 'N'; telephone?: string;
    }>;
}

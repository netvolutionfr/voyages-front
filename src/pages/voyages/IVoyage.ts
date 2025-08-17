export type IVoyage = {
    id: number;
    nom: string;
    description: string;
    destination: string;
    dateDepart: string; // ISO 8601 date string
    dateRetour: string; // ISO 8601 date string
    nombreMinParticipants: number;
    nombreMaxParticipants: number;
    dateDebutInscription: string; // ISO 8601 date string
    dateFinInscription: string; // ISO 8601 date string
    sections?: Array<{ id: number; libelle: string }>;
    organisateurs?: Array<{ id: number; nom: string }>;
    documentsObligatoires?: Array<{ id: number; nom: string }>;
    participants?: Array<{
        id: number;
        nom: string;
        prenom: string;
        email: string;
        dateNaissance: string; // ISO 8601 date string
        sexe: 'M' | 'F' | 'N';
        telephone?: string;
    }>;
}

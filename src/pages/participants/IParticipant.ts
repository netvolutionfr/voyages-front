export type IParticipant = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    dateNaissance: string;
    sexe: 'M' | 'F' | 'N';
    telephone?: string;
}

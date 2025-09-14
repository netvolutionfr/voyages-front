export type IUser = {
    id: string; // Id sous forme de UUID
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    validated?: boolean;
    role: string;
}

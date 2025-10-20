// Interface pour les données de l'utilisateur
interface User {
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    publicId: string;
    role: string;
    avatar?: string; // Calculé à partir de Gravatar
    telephone?: string | null;
    validated?: boolean | null;
}

export type { User };

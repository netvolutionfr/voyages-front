// Interface pour les données de l'utilisateur
interface User {
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    realm_access: {
        roles: string[];
    };
    avatar?: string; // Calculé à partir de Gravatar
}

export type { User };

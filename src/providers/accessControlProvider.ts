import type { AccessControlProvider } from "@refinedev/core";
import { keycloak } from "./authProvider.ts"; // Réutilisez l'instance Keycloak

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource }) => {

        // Si l'utilisateur n'est pas authentifié, aucune permission n'est accordée
        if (!keycloak.authenticated) {
            return { can: false };
        }

        const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];

        // Logique pour les ressources d'administration
        if (resource === "admin") {
            if (userRoles.includes("admin")) {
                // L'utilisateur a le rôle "admin", il peut donc accéder à la ressource
                return { can: true };
            } else {
                // L'utilisateur n'a pas le rôle "admin", l'accès est refusé
                return { can: false };
            }
        }

        // Logique pour les ressources utilisateur
        if (userRoles.includes("user")) {
            // L'utilisateur a le rôle "user", il peut donc accéder à la ressource
            return {can: true};
        }

        // Par défaut, l'accès est refusé pour les ressources non spécifiées
        return { can: false };
    },
};

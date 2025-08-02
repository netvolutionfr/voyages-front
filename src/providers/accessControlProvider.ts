import type { AccessControlProvider } from "@refinedev/core";
import { keycloak } from "./authProvider.ts"; // Réutilisez l'instance Keycloak

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        // Vérifie si l'utilisateur est authentifié et que les rôles sont disponibles
        if (keycloak.authenticated && keycloak.tokenParsed?.realm_access?.roles) {
            const userRoles = keycloak.tokenParsed.realm_access.roles;

            // Logique pour les ressources "admin"
            if (resource?.includes("admin")) {
                // Seuls les utilisateurs avec le rôle 'admin' peuvent accéder aux ressources d'administration
                if (userRoles.includes("admin")) {
                    return { can: true };
                }
            }

            // Logique pour les autres actions et ressources
            if (action === "create" || action === "edit" || action === "delete") {
                // Seuls les admins peuvent créer, modifier ou supprimer des posts par exemple
                if (userRoles.includes("admin")) {
                    return { can: true };
                }
            }

            // Par défaut, l'utilisateur a la permission de lire les données
            return { can: true };
        }

        // Si l'utilisateur n'est pas authentifié, il n'a aucune permission
        return { can: false };
    },
};

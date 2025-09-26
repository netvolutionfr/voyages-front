import type { AccessControlProvider, CanParams } from "@refinedev/core";
import { fetchMe } from "./session";
import type { Role } from "./types";
import { RULES, type CrudAction } from "./rbac";

function hasSomeRole(userRoles: Role[], required?: Role[]): boolean {
    if (!required || required.length === 0) return true; // si aucune règle, accès autorisé par défaut pour la ressource définie
    return required.some((r) => userRoles.includes(r));
}

function normalizeAction(action?: string): CrudAction | undefined {
    // sécurise l'action pour nos clés connues
    if (!action) return undefined;
    const a = action.toLowerCase();
    const allowed: CrudAction[] = ["list", "show", "create", "edit", "delete", "export", "clone"];
    return allowed.find((x) => x === a);
}

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action}: CanParams) => {
        // 1) Auth requise
        const me = await fetchMe();
        if (!me) {
            return { can: false, reason: "Non authentifié" };
        }

        const act = normalizeAction(action);
        const rulesForResource = resource ? RULES[resource] : undefined;

        // 2) Si aucune règle pour la ressource → par défaut **refus**
        if (!resource || !rulesForResource) {
            return { can: false, reason: "Ressource non autorisée" };
        }

        // 3) Si l'action n’est pas listée → refus par défaut (sécurisé)
        if (!act) {
            return { can: false, reason: "Action non autorisée" };
        }

        const requiredRoles = rulesForResource[act];

        // 4) (Optionnel) Règle de propriété : si on veut autoriser l’édition de “son” objet
        // Exemple : si pas les rôles requis mais l'utilisateur est propriétaire du record
        // Nécessite que Refine passe params.record ou params.id et que tu vérifies côté API.
        // Ici on reste simple : uniquement RBAC par rôles.

        const ok = hasSomeRole(me.roles, requiredRoles);
        return ok ? { can: true } : { can: false, reason: "Rôle insuffisant" };
    },
};

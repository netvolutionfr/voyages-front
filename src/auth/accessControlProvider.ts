import type { AccessControlProvider, CanParams } from "@refinedev/core";
import type {Role} from "./types";
import { RULES, type CrudAction } from "./rbac";
import {getIdentityCached} from "@/auth/session.ts";
import {fetchMe} from "@/auth/me.ts";

function hasSomeRole(userRole: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "USER" | undefined, required?: Role[] | undefined): boolean {
    if (!required || required.length === 0) return true; // si aucune règle, accès autorisé par défaut pour la ressource définie
    return required.some((r) => userRole === r);
}

function normalizeAction(action?: string): CrudAction | undefined {
    // sécurise l'action pour nos clés connues
    if (!action) return undefined;
    const a = action.toLowerCase();
    const allowed: CrudAction[] = ["list", "show", "create", "edit", "delete", "export", "clone"];
    return allowed.find((x) => x === a);
}


export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }: CanParams) => {
        // 1) identité (JWT -> cache -> /me)
        const me = await getIdentityCached(fetchMe);
        console.log("Me dans ACL:", me);
        console.log("Vérification ACL pour", me?.email, "sur", resource, "/", action);
        if (!me) return { can: false, reason: "Non authentifié" };
        if (me.status && me.status !== "ACTIVE") {
            return { can: false, reason: "Compte non activé" };
        }

        const act = normalizeAction(action);
        const rulesForResource = resource ? RULES[resource] : undefined;

        if (!resource || !rulesForResource) {
            console.log(`Ressource non autorisée: ${resource}`);
            return { can: false, reason: "Ressource non autorisée" };
        }
        if (!act || !(act in rulesForResource)) {
            console.log(`Action non autorisée: ${action} sur ressource ${resource}`);
            return { can: false, reason: "Action non autorisée" };
        }

        const requiredRoles = rulesForResource[act] as Role[] | undefined;
        const ok = hasSomeRole(me.role, requiredRoles);
        return ok ? { can: true } : { can: false, reason: "Rôle insuffisant" };
    },
};
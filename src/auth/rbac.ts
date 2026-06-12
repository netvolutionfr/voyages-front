import type { Role } from "./types";

export type CrudAction = "list" | "show" | "create" | "edit" | "delete" | "export" | "clone";

type ActionRules = Partial<Record<CrudAction, Role[]>>;
type ResourceRules = Partial<Record<string, ActionRules>>;

// Exemple : adapte à tes besoins/app
export const RULES: ResourceRules = {
    admin: {
        list: ["ADMIN"],
        show: ["ADMIN"],
        create: ["ADMIN"],
        edit: ["ADMIN"],
        delete: ["ADMIN"],
        export: ["ADMIN"],
    },
    // Clé alignée sur le nom de ressource Refine/API (resources.ts), sinon le
    // contrôle central ne couvre pas les ressources réellement mutées.
    trips: {
        list: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
        show: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
        create: ["ADMIN", "TEACHER"],
        edit: ["ADMIN", "TEACHER"],
        delete: ["ADMIN"],
        export: ["ADMIN", "TEACHER"],
    },
    users: {
        list: ["ADMIN"],
        show: ["ADMIN", "TEACHER"],
        create: ["ADMIN"],
        edit: ["ADMIN"],
        delete: ["ADMIN"],
    },
};

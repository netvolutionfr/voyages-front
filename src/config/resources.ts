import type {IResourceItem} from "@refinedev/core";

export const resources: IResourceItem[] = [
    {
        name: "me",
        create: "/me",
        edit: "/me",
        show: "/me",
    },

    {
        name: "documents",
        list: "/documents",
        show: "/documents/:id",
        create: "/documents/create",
        edit: "/documents/edit/:id",
    },

    // Ressources d'administration, protégées
    {
        name: "trips",
        list: "/voyages",
        show: "/voyages/:id",
        create: "/voyages/create",
        edit: "/voyages/edit/:id",
    },
    {
        name: "sections",
        list: "/admin/sections",
        create: "/admin/sections/create",
        edit: "/admin/sections/edit/:id",
    },
    {
        name: "users",
        list: "/admin/users",
    },
];

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
        name: "participants",
        list: "/participants",
        show: "/participants/:id",
        create: "/participants/create",
        edit: "/participants/edit/:id",
    },
    {
        name: "voyages",
        list: "/voyages",
        show: "/voyages/:id",
        create: "/voyages/create",
        edit: "/voyages/edit/:id",
    },
];

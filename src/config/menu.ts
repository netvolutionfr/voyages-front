import {
    IconAddressBook,
    IconDashboard,
    IconDirections,
    IconId,
    IconSchool, IconUser,
    IconUsers
} from "@tabler/icons-react";

export const menuEleves = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: IconDashboard,
    },
    {
        title: "Profil",
        url: "/profil",
        icon: IconAddressBook,
    },
    {
        title: "Voyages",
        url: "/voyages",
        icon: IconDirections,
    },
    {
        title: "Documents",
        url: "/documents",
        icon: IconId,
    },
    {
        title: "Enfants",
        url: "/participants",
        icon: IconUsers,
    }
];

export const menuParents = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: IconDashboard,
    },
    {
        title: "Profil",
        url: "/profil",
        icon: IconAddressBook,
    },
    {
        title: "Voyages",
        url: "/voyages",
        icon: IconDirections,
    },
    {
        title: "Enfants",
        url: "/participants",
        icon: IconUsers,
    }
];

export const menuProfs = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: IconDashboard,
    },
    {
        title: "Gestion des Voyages",
        url: "/voyages",
        icon: IconDirections,
    },
    {
        title: "Participants",
        url: "/participants",
        icon: IconUsers,
    },
];

export const menuAdmin = [
    {
        title: "Gestion des voyages",
        url: "/voyages",
        icon: IconDirections,
    },
    {
        title: "Liste des participants",
        url: "/admin/participants",
        icon: IconUsers,
    },
    {
        title: "Gestion des sections",
        url: "/admin/sections",
        icon: IconSchool,
    },
    {
        title: "Liste des utilisateurs",
        url: "/admin/users",
        icon: IconUser,
    },
];

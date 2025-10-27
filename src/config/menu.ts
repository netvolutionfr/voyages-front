import {
    IconDashboard,
    IconDirections,
    IconCheckupList,
    IconSchool,
    IconUser,
    IconUsers,
    IconId,
} from "@tabler/icons-react";

export const menuEleves = [
    {
        title: "Accueil",
        url: "/",
        icon: IconDashboard,
    },
    {
        title: "Fiche santé",
        url: "/sanitaire",
        icon: IconCheckupList,
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
    }
];

export const menuParents = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: IconDashboard,
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
        title: "Voyages",
        url: "/voyages",
        icon: IconDirections,
    },
    {
        title: "Participants",
        url: "/admin/participants",
        icon: IconUsers,
    },
    {
        title: "Sections",
        url: "/admin/sections",
        icon: IconSchool,
    },
    {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: IconUser,
    },
];

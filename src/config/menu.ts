import { IconAddressBook, IconDashboard, IconDirections, IconId, IconListDetails, IconUsers } from "@tabler/icons-react";

export const menuNavMain = [
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
];

export const menuNavAdmin = [
    {
        title: "Gestion des voyages",
        url: "/admin/voyages",
        icon: IconListDetails,
    },
    {
        title: "Liste des participants",
        url: "/admin/participants",
        icon: IconUsers,
    },
];

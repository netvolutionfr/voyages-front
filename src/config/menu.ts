import { IconAddressBook, IconDashboard, IconDirections, IconId, IconListDetails, IconUsers } from "@tabler/icons-react";

export const menuNavMain = [
    {
        title: "Tableau de bord",
        url: "/dashboard",
        icon: IconDashboard,
    },
    {
        title: "Profil",
        url: "/dashboard/profil",
        icon: IconAddressBook,
    },
    {
        title: "Voyages",
        url: "/dashboard/voyages",
        icon: IconDirections,
    },
    {
        title: "Documents",
        url: "/dashboard/documents",
        icon: IconId,
    },
];

export const menuNavAdmin = [
    {
        title: "Gestion des voyages",
        url: "/dashboard/admin/voyages",
        icon: IconListDetails,
    },
    {
        title: "Liste des utilisateurs",
        url: "/dashboard/admin/utilisateurs",
        icon: IconUsers,
    },
];

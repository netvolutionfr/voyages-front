import {IconHeartbeat, IconUsersGroup, IconUser} from "@tabler/icons-react";

const menuProfil = [
    {
        title: 'Fiche de renseignements',
        icon: IconUser,
        href: '/profil',
    },
    {
        title: 'Fiche sanitaire',
        icon: IconHeartbeat,
        href: '/profil/sanitaire',
    },
    {
        title: 'Parents',
        icon: IconUsersGroup,
        href: '/profil/parents',
    },
]
export default menuProfil;

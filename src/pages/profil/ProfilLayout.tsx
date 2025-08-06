import {Separator} from "@/components/ui/separator.tsx";
import {Outlet} from "react-router-dom";
import menuProfil from "@/config/menu-profil.ts";
import SidebarNav from "@/components/common/SidebarNav.tsx";



const ProfilLayout = () => {
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Profil</h1>
            <p>Cette page vous permet de modifier vos coordonnées, les informations de votre fiche sanitaire, ainsi que les coordonnées de vos parents si nécessaire.</p>
            <Separator className="my-6" />
            <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
                <aside className='top-0 lg:sticky lg:w-1/5'>
                    <SidebarNav items={menuProfil} />
                </aside>
                <div className='flex w-full overflow-y-hidden p-1'>
                    <Outlet />
                </div>
            </div>
        </>
    );
}
export default ProfilLayout;

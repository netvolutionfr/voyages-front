import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { IconGlobe } from '@tabler/icons-react'
import React from "react";
import {menuAdmin, menuEleves, menuParents, menuProfs} from "@/config/menu.ts";
import {useGetIdentity} from "@refinedev/core";
import type {User} from "@/type/User.ts";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import NavMain from "@/components/common/NavMain.tsx";
import NavUser from "@/components/common/NavUser.tsx";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {

    const { data: user, isLoading } = useGetIdentity<User>();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const isAdmin = user?.role == "ADMIN";
    const isParent = user?.role === "PARENT";
    const isProf = user?.role === "TEACHER";
    const isEleve = user?.role === "STUDENT";
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="/">
                                <IconGlobe className="!size-5" />
                                <span className="text-base font-semibold">Voyages</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {isEleve && (
                    <NavMain items={menuEleves} menuTitle="Élèves" />
                )}
                {isParent && (
                    <NavMain items={menuParents} menuTitle="Parents" />
                )}
                {isProf && (
                    <NavMain items={menuProfs} menuTitle="Professeurs" />
                )}
                {isAdmin && (
                    <NavMain items={menuAdmin} menuTitle="Administration" />
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar;

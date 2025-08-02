import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { IconGlobe } from '@tabler/icons-react'
import React from "react";
import {NavUser} from "@/components/common/NavUser.tsx";
import {NavMain} from "@/components/common/NavMain.tsx";
import {menuNavAdmin, menuNavMain} from "@/config/menu.ts";
import {useGetIdentity} from "@refinedev/core";
import type {User} from "@/type/User.ts";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { data: user, isLoading } = useGetIdentity<User>();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const isAdmin = user?.realm_access.roles.includes("admin")

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <IconGlobe className="!size-5" />
                                <span className="text-base font-semibold">Voyages</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={menuNavMain} />
                {isAdmin && (
                    <NavMain items={menuNavAdmin} menuTitle="Administration" />
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}

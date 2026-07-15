import { type Icon } from "@tabler/icons-react"

import {
    SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Link, useLocation} from "react-router-dom";

const NavMain = ({
                            items,
                            menuTitle
                        }: {
    items: {
        title: string
        url: string
        icon?: Icon
    }[],
    menuTitle?: string
}) => {
    const { pathname } = useLocation();
    const isActive = (url: string) =>
        url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");
    return (
        <SidebarGroup>
            {menuTitle && <SidebarGroupLabel>{menuTitle}</SidebarGroupLabel>}
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title} isActive={isActive(item.url)} asChild>
                                <Link to={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export default NavMain;

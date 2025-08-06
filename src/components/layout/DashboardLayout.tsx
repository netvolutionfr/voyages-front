import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import SiteHeader from "@/components/common/SiteHeader.tsx";
import AppSidebar from "@/components/common/AppSidebar.tsx";
import {Outlet} from "react-router-dom";
import {ThemeProvider} from "@/components/common/ThemeProvider.tsx";

function DashboardLayout() {
    return (
        <div className="antialiased">
            <ThemeProvider>
                <SidebarProvider>
                    <AppSidebar variant="inset" />
                    <SidebarInset>
                        <SiteHeader />
                        <div className="h-full p-4 md:p-6">
                            <Outlet />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
        </div>
    )
}

export default DashboardLayout;

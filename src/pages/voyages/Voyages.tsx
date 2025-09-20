import React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {useTable} from "@refinedev/react-table";
import {useList} from "@refinedev/core";
import {DataTable} from "@/components/ui/data-table.tsx";
import type {IVoyage} from "@/pages/voyages/IVoyage.ts";
import {voyagesColumns} from "@/pages/voyages/VoyagesColumns.tsx";
import {keycloak} from "@/providers/authProvider.ts";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {VoyageCard} from "@/pages/voyages/VoyageCard.tsx";


const Voyages = () => {


    const columns =
        React.useMemo <ColumnDef <IVoyage>[]> (() => voyagesColumns, []);

    const userRoles: string[] = keycloak.tokenParsed?.realm_access?.roles || [];
    const isAdminOrTeacher = userRoles.includes("admin") || userRoles.includes("teacher");

    // Admin view: keep the existing management table
    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "trips",
        },
    });

    // Student view: list voyages open for registration (current date within the inscription window)
    const { data, isLoading: isLoadingList } = useList<IVoyage>({
        resource: "trips",
        pagination: { pageSize: 12 },
        sorters: [{ field: "departureDate", order: "asc" }],
    });

    const isLoading = isAdminOrTeacher
        ? tableInstance.refineCore.tableQuery?.isLoading
        : isLoadingList;

    if (isLoading) {
        if (isAdminOrTeacher) {
            return (<LoadingSpinner />)
        } else {
            return (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-24" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }
    }

    if (!isAdminOrTeacher) {
        // const voyagesOuverts = (data?.data || []).filter((v) => {
        //     const debut = new Date(v.datesInscription.from + 'T00:00:00Z');
        //     const fin = new Date(v.datesInscription.to + 'T23:59:59Z');
        //     return today >= debut && today <= fin;
        // });
        const voyages = data?.data || [];

        return (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {voyages.map((v) => {
                    return (
                        <VoyageCard v={v} />
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Gestion des voyages</h1>
            <DataTable columns={voyagesColumns} table={tableInstance} entity="voyages" filter="nom" />
        </div>
    );
}
export default Voyages;

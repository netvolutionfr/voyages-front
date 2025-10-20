import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useList, useCan } from "@refinedev/core";
import { DataTable } from "@/components/ui/data-table";
import type { IVoyage } from "@/pages/voyages/IVoyage";
import { voyagesColumns } from "@/pages/voyages/VoyagesColumns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { VoyageCard } from "@/pages/voyages/VoyageCard";

const Voyages: React.FC = () => {
    // 1) Demande d’autorisation : “édition voyages” = profil Admin/Teacher dans nos règles
    const { data: canEditRes, isLoading: canLoading } = useCan({
        resource: "voyages",
        action: "edit",
    });

    const isAdminOrTeacher = canEditRes?.can === true;

    // 2) Table gestion (admin/teacher)
    const columns = React.useMemo<ColumnDef<IVoyage>[]>(() => voyagesColumns, []);
    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "trips", // ton nom d’endpoint REST
        },
    });

    // 3) Grille “élève/parent”
    const { data, isLoading: isLoadingList } = useList<IVoyage>({
        resource: "trips",
        pagination: { pageSize: 12 },
        sorters: [{ field: "departureDate", order: "asc" }],
    });

    // 4) Loading global : tient compte du temps de `useCan`
    const tableIsLoading = tableInstance.refineCore.tableQuery?.isLoading ?? false;
    const isLoading = canLoading
        ? true
        : isAdminOrTeacher
            ? tableIsLoading
            : isLoadingList;

    if (isLoading) {
        return isAdminOrTeacher ? (
            <LoadingSpinner />
        ) : (
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

    // 5) Vue élève/parent
    if (!isAdminOrTeacher) {
        const voyages = data?.data ?? [];
        return (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {voyages.map((v) => (
                    <VoyageCard key={v.id} v={v} />
                ))}
            </div>
        );
    }

    // 6) Vue admin/teacher (table gestion)
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Gestion des voyages</h1>
            <DataTable columns={voyagesColumns} table={tableInstance} entity="voyages" filter="title" />
        </div>
    );
};

export default Voyages;

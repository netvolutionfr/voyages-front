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

/** Table de gestion (admin/teacher). Montée seulement si le RBAC l'autorise :
 *  la requête liste "gestion" ne part jamais pour un parent/élève. */
const VoyagesAdminTable: React.FC = () => {
    const columns = React.useMemo<ColumnDef<IVoyage>[]>(() => voyagesColumns, []);
    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "trips", // ton nom d'endpoint REST
        },
    });

    if (tableInstance.refineCore.tableQuery?.isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Gestion des voyages</h1>
            <DataTable columns={voyagesColumns} table={tableInstance} entity="trips" filter="title" />
        </div>
    );
};

/** Grille de consultation (élève/parent). */
const VoyagesGrid: React.FC = () => {
    const { result: listResult, query: listQuery } = useList<IVoyage>({
        resource: "trips",
        pagination: { pageSize: 12 },
        sorters: [{ field: "departureDate", order: "asc" }],
    });

    if (listQuery.isLoading) {
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

    const voyages = listResult?.data ?? [];
    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {voyages.map((v) => (
                <VoyageCard key={v.id} v={v} />
            ))}
        </div>
    );
};

const Voyages: React.FC = () => {
    // Décision RBAC d'abord, fetch ensuite : on ne monte que la vue (et la
    // requête) correspondant au rôle, au lieu de lancer les deux en parallèle.
    const { data: canEditRes, isLoading: canLoading } = useCan({
        resource: "trips",
        action: "edit",
    });

    if (canLoading) {
        return <LoadingSpinner />;
    }

    return canEditRes?.can === true ? <VoyagesAdminTable /> : <VoyagesGrid />;
};

export default Voyages;

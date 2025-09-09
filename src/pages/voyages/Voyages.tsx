import React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {useTable} from "@refinedev/react-table";
import {Link, useList} from "@refinedev/core";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {DataTable} from "@/components/ui/data-table.tsx";
import type {IVoyage} from "@/pages/voyages/IVoyage.ts";
import {voyagesColumns} from "@/pages/voyages/VoyagesColumns.tsx";
import {keycloak} from "@/providers/authProvider.ts";
import { Button } from "@/components/ui/button";
import {formatCurrencyFromCents} from "@/lib/utils.ts";

const Voyages = () => {
    const columns =
        React.useMemo <ColumnDef <IVoyage>[]> (() => voyagesColumns, []);

    const userRoles: string[] = keycloak.tokenParsed?.realm_access?.roles || [];
    const isAdminOrTeacher = userRoles.includes("admin") || userRoles.includes("teacher");

    // Admin view: keep existing management table
    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "voyages",
        },
    });

    // Student view: list voyages open for registration (current date within inscription window)
    const { data, isLoading: isLoadingList } = useList<IVoyage>({
        resource: "voyages",
        pagination: { pageSize: 100 },
    });

    const isLoading = isAdminOrTeacher
        ? tableInstance.refineCore.tableQuery?.isLoading
        : isLoadingList;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAdminOrTeacher) {
        const today = new Date();
        const voyagesOuverts = (data?.data || []).filter((v) => {
            const debut = new Date(v.datesInscription.from + 'T00:00:00Z');
            const fin = new Date(v.datesInscription.to + 'T23:59:59Z');
            return today >= debut && today <= fin;
        });

        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Voyages ouverts aux inscriptions</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {voyagesOuverts.map((v) => (
                        <div key={v.id} className="rounded-lg border p-4 bg-white">
                            <div className="text-lg font-semibold">{v.nom}</div>
                            <div className="text-sm text-gray-600">{v.destination} ({v.pays?.nom ?? ""})</div>
                            <div className="mt-2 text-sm">{v.description}</div>
                            <div className="mt-2 text-sm">
                                Participation des familles : {formatCurrencyFromCents(v.participationDesFamilles)}
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                Inscriptions: {new Date(v.datesInscription.from).toLocaleDateString()} → {new Date(v.datesInscription.to).toLocaleDateString()}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Voyage: {new Date(v.datesVoyage.from).toLocaleDateString()} → {new Date(v.datesVoyage.to).toLocaleDateString()}
                            </div>
                            <div className="mt-4">
                                <Button asChild>
                                <Link go={{ to: { resource: "participants", action: "create" }, query: { voyageId: String(v.id) } }}>
                                    S'inscrire
                                </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                    {voyagesOuverts.length === 0 && (
                        <div className="col-span-full text-center text-sm text-gray-600 py-10">
                            Aucun voyage ouvert aux inscriptions pour le moment.
                        </div>
                    )}
                </div>
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

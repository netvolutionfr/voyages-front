import React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {useTable} from "@refinedev/react-table";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {DataTable} from "@/components/ui/data-table.tsx";
import type {IVoyage} from "@/pages/voyages/IVoyage.ts";
import {voyagesColumns} from "@/pages/voyages/VoyagesColumns.tsx";

const Voyages = () => {
    const columns =
        React.useMemo <ColumnDef <IVoyage>[]> (() => voyagesColumns, []);

    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "voyages",
        },
    });

    const isLoading = tableInstance.refineCore.tableQuery?.isLoading;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Gestion des voyages</h1>
            <DataTable columns={voyagesColumns} table={tableInstance} entity="voyages" filter="nom" />
        </div>
    );
}
export default Voyages;

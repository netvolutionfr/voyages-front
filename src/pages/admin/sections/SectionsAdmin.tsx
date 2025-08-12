import React from "react";
import {DataTable} from "@/components/ui/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import {sectionsColumns} from "@/pages/admin/sections/SectionsColumns.tsx";
import type {ColumnDef} from "@tanstack/react-table";
import type {ISection} from "@/pages/admin/sections/ISection.ts";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

const SectionsAdmin = () => {
    const columns =
        React.useMemo <ColumnDef <ISection>[]> (() => sectionsColumns, []);

    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "sections",
        },
    });

    const isLoading = tableInstance.refineCore.tableQuery?.isLoading;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Gestion des sections</h1>
            <DataTable columns={sectionsColumns} table={tableInstance} entity="sections" filter="libelle" />
        </div>
    );
}
export default SectionsAdmin;

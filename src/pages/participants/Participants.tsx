import React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {useTable} from "@refinedev/react-table";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {DataTable} from "@/components/ui/data-table.tsx";
import {participantsColumns} from "@/pages/participants/ParticipantsColumns.tsx";
import type {IParticipant} from "@/pages/participants/IParticipant.ts";

const Participants = () => {
    const columns =
        React.useMemo <ColumnDef <IParticipant>[]> (() => participantsColumns, []);

    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "participants",
        },
    });

    const isLoading = tableInstance.refineCore.tableQuery?.isLoading;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Vos enfants</h1>
            <DataTable columns={participantsColumns} table={tableInstance} entity="participants" filter="nom" />
        </div>
    );

}
export default Participants;

import React from "react";
import {DataTable} from "@/components/ui/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import type {ColumnDef} from "@tanstack/react-table";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import type {IUser} from "@/pages/admin/users/IUser.ts";
import {usersColumns} from "@/pages/admin/users/UsersColumns.tsx";

const UsersAdmin = () => {
    const columns =
        React.useMemo <ColumnDef <IUser>[]> (() => usersColumns, []);

    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "users",
        },
    });

    const isLoading = tableInstance.refineCore.tableQuery?.isLoading;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Liste des utilisateurs de l'application</h1>
            <DataTable columns={usersColumns} table={tableInstance} entity="users" filter="nom" createButon={false} />
        </div>
    );
}
export default UsersAdmin;

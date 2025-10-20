import type {ColumnDef} from "@tanstack/react-table";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";
import type {IUser} from "@/pages/admin/users/IUser.ts";
import {UserCheck, UserLock} from "lucide-react";

export const usersColumns: ColumnDef<IUser>[] = [
    {
        id: "lastName",
        accessorKey: "lastName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
        cell: ({ row }) => <span>{row.getValue("lastName")}</span>,
    },
    {
        id: "firstName",
        accessorKey: "firstName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prénom" />
        ),
        cell: ({ row }) => <span>{row.getValue("firstName")}</span>,
    },
    {
        id: "email",
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => <span>{row.getValue("email")}</span>,
    },
    {
        id: "telephone",
        accessorKey: "telephone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Téléphone" />
        ),
        cell: ({ row }) => <span>{row.getValue("telephone")}</span>,
    },
    {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Statut" />
        ),
        cell: ({ row }) => (
            row.getValue("status") === "ACTIVE"
                ? (
                    <div className="flex justify-center items-center">
                        <UserCheck size={18} />
                    </div>
                )
                : row.getValue("status") === "PENDING"
                    ? (
                        <div className="flex justify-center items-center">
                            <UserLock size={18} />
                        </div>
                    )
                    : null
        ),
    },
    {
        id: "role",
        accessorKey: "role",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rôle" />
        ),
        cell: ({ row }) => <span>{row.getValue("role")}</span>,
    },
];

import type {ColumnDef} from "@tanstack/react-table";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";
import type {IUser} from "@/pages/admin/users/IUser.ts";
import { UserRoundCheck } from "lucide-react";

export const usersColumns: ColumnDef<IUser>[] = [
    {
        id: "nom",
        accessorKey: "nom",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
        cell: ({ row }) => <span>{row.getValue("nom")}</span>,
    },
    {
        id: "prenom",
        accessorKey: "prenom",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prénom" />
        ),
        cell: ({ row }) => <span>{row.getValue("prenom")}</span>,
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
        id: "validated",
        accessorKey: "validated",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Validé" />
        ),
        cell: ({ row }) => (
            row.getValue("validated")
                ? (
                    <div className="flex justify-center items-center">
                        <UserRoundCheck size={18} />
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

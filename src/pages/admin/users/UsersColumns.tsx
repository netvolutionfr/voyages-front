import type {ColumnDef} from "@tanstack/react-table";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";
import type {IUser} from "@/pages/admin/users/IUser.ts";
import {UserCheck, UserLock} from "lucide-react";
import ActionsCell from "@/pages/admin/users/ActionsCell.tsx";

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
        id: "section",
        accessorKey: "section",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Classe" />
        ),
        cell: ({ row }) => <span>{row.getValue("section")}</span>,
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
        id: "birthDate",
        accessorKey: "birthDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date de naissance" />
        ),
        cell: ({ row }) => {
            const bd = row.getValue("birthDate");
            if (!bd) return null;

            let date: Date;
            if (typeof bd === "string" || typeof bd === "number") {
                date = new Date(bd);
            } else if (bd instanceof Date) {
                date = bd;
            } else {
                // fallback: tenter une conversion sécurisée
                date = new Date(String(bd));
            }

            if (isNaN(date.getTime())) return <span>Date invalide</span>;

            const age = Math.floor((Date.now() - date.getTime()) / 31557600000);
            return <span>{date.toLocaleDateString()} ({age} ans)</span>;
        },
    },
    {
        id: "gender",
        accessorKey: "gender",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Genre" />
        ),
        cell: ({ row }) => <span>{row.getValue("gender")}</span>,
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
        cell: ({ row }) => {
            const role = row.getValue("role");
            switch (role) {
                case "ADMIN":
                    return <span>Admin</span>;
                case "TEACHER":
                    return <span>Teacher</span>;
                case "STUDENT":
                    return <span>Student</span>;
                case "PARENT":
                    return <span>Parent</span>;
            }
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({row}) => <ActionsCell user={row.original as IUser} />
    },

];

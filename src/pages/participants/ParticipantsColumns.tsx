import type {ColumnDef} from "@tanstack/react-table";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";
import type {IParticipant} from "@/pages/participants/IParticipant.ts";
import ActionsCell from "@/pages/participants/ActionsCell.tsx";
import {convertDateToString} from "@/lib/utils.ts";

export const participantsColumns: ColumnDef<IParticipant>[] = [
    {
        id: "lastName",
        accessorKey: "lastName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("lastName")}</span>,
        enableSorting: true,
    },
    {
        id: "firstName",
        accessorKey: "firstName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prénom" />
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("firstName")}</span>,
        enableSorting: true,
    },
    {
        id: "birthDate",
        accessorKey: "birthDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date de naissance" />
        ),
        cell: ({ row }) => <span>{convertDateToString(row.getValue("birthDate"))}</span>,
        enableSorting: true,
    },
    {
        id: "sectionLabel",
        accessorKey: "sectionLabel",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Section" />
        ),
        cell: ({ row }) => <span>{row.getValue("sectionLabel")}</span>,
        enableSorting: true,
    },
    {
        id: "email",
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => <span>{row.getValue("email")}</span>,
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({row}) => <ActionsCell item={row.original as IParticipant} />
    },
];

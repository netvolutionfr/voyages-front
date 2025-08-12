import type {ColumnDef} from "@tanstack/react-table";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";
import type {IParticipant} from "@/pages/participants/IParticipant.ts";
import ActionsCell from "@/pages/participants/ActionsCell.tsx";
import {convertDateToString} from "@/lib/utils.ts";

export const participantsColumns: ColumnDef<IParticipant>[] = [
    {
        id: "nom",
        accessorKey: "nom",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("nom")}</span>,
        enableSorting: true,
    },
    {
        id: "prenom",
        accessorKey: "prenom",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prénom" />
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("prenom")}</span>,
        enableSorting: true,
    },
    {
        id: "dateNaissance",
        accessorKey: "dateNaissance",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date de naissance" />
        ),
        cell: ({ row }) => <span>{convertDateToString(row.getValue("dateNaissance"))}</span>,
        enableSorting: true,
    },
    {
        id: "sectionLibelle",
        accessorKey: "sectionLibelle",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Section" />
        ),
        cell: ({ row }) => <span>{row.getValue("sectionLibelle")}</span>,
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

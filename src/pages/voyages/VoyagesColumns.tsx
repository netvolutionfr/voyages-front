import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@radix-ui/react-checkbox";
import ActionsCell from "@/pages/voyages/ActionsCell.tsx";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";
import type {IVoyage} from "@/pages/voyages/IVoyage.ts";
import {formatCurrencyFromCents} from "@/lib/utils.ts";

export const voyagesColumns: ColumnDef<IVoyage>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Titre" />
        ),
        meta: {
            filterOperator: "contains",
        },
        cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
        enableSorting: true,
    },
    {
        id: "destination",
        accessorKey: "destination",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Destination" />
        ),
        cell: ({ row }) => <span>{row.getValue("destination")}</span>,
    },
    {
        id: "country.name",
        accessorKey: "country.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pays" />
        ),
        cell: ({ row }) => <span>{row.getValue("country.name")}</span>,
    },
    {
        id: "familyContribution",
        accessorKey: "familyContribution",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prix" />
        ),
        cell: ({ row }) => <span>{formatCurrencyFromCents(row.getValue("familyContribution"))}</span>,
    },
    {
        id: "interestedCount",
        accessorKey: "interestedCount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Likes" />
        ),
        cell: ({ row }) => <span>{row.getValue("interestedCount")}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({row}) => <ActionsCell item={row.original as IVoyage} />
    },
];

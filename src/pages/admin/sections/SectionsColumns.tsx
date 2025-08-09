import type {ISection} from "@/pages/admin/sections/ISection.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@radix-ui/react-checkbox";
import ActionsCell from "@/pages/admin/sections/ActionsCell.tsx";
import {DataTableColumnHeader} from "@/components/ui/data-table-column-header.tsx";

export const sectionsColumns: ColumnDef<ISection>[] = [
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
        id: "libelle",
        accessorKey: "libelle",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Libellé" />
        ),
        meta: {
            filterOperator: "contains",
        },
        cell: ({ row }) => <span className="font-medium">{row.getValue("libelle")}</span>,
        enableSorting: true,
    },
    {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => <span>{row.getValue("description")}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({row}) => <ActionsCell item={row.original as ISection} />
    },
];

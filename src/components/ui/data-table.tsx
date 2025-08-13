import {type ColumnDef, flexRender} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import type {UseTableReturnType} from "@refinedev/react-table";
import type {BaseRecord, HttpError} from "@refinedev/core";
import {DataTableToolbar} from "@/components/ui/data-table-toolbar.tsx";
import {DataTablePagination} from "@/components/ui/data-table-pagination.tsx";

interface DataTableProps<TData extends BaseRecord, TValue> {
    columns: ColumnDef<TData, TValue>[]
    table: UseTableReturnType<TData, HttpError>,
    entity?: string,
    filter?: string,
    createButon?: boolean,
}

export function DataTable<TData extends BaseRecord, TValue>({
                                                                columns,
                                                                table,
                                                                entity = "items",
                                                                filter = "name",
                                                                createButon = true,
                                         }: DataTableProps<TData, TValue>) {

    return (
        <div className="flex flex-col gap-4">
        <DataTableToolbar table={table} entity={entity} filter={filter} createButon={createButon} />
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Aucune donnée trouvée.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        <DataTablePagination table={table} />
        </div>
    )
}

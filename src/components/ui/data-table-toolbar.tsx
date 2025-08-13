import type {Table} from "@tanstack/react-table";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Plus, X} from "lucide-react";
import {DataTableViewOptions} from "@/components/ui/data-table-view-options.tsx";
import {Link} from "@refinedev/core";


interface DataTableToolbarProps<TData> {
    table: Table<TData>,
    entity?: string,
    filter?: string,
    createButon?: boolean,
}

export function DataTableToolbar<TData>({
                                            table,
                                            entity = "items",
                                            filter = "name",
                                            createButon = true,
                                        }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Input
                    placeholder="Filter..."
                    value={(table.getColumn(filter)?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                            table.getColumn(filter)?.setFilterValue(event.target.value);
                        }
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetColumnFilters()}
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                {createButon && (
                <Button size="sm" asChild>
                    <Link go={{
                        to: {
                            resource: entity,
                            action: "create",
                        }
                    }}
                          className="flex items-center gap-2">
                        <Plus />
                    </Link>
                </Button>
                )}
            </div>
        </div>
    )
}

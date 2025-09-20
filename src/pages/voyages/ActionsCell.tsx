import { useDelete } from "@refinedev/core";
import { toast } from "sonner";

import { Button } from "@/components/ui/button.tsx";
import { EditIcon, TrashIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import {Link} from "react-router-dom";
import type {ISection} from "@/pages/admin/sections/ISection.ts";

function ActionsCell({item}: { item: ISection }) {
    const { mutate: deleteItem } = useDelete<ISection>();

    const handleDelete = () => {
        deleteItem(
            {
                resource: "trips",
                id: item.id,
            },
            {
                onSuccess: () => {
                    toast.success(`Voyage ${item.label} supprimé !`);
                },
                onError: (error) => {
                    toast.error(`Erreur suppression du voyage : ${error.message}`);
                },
            }
        );
    };
    return (
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link to={`/voyages/edit/${item.id}`}>
                    <EditIcon/>
                </Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" color="destructive">
                        <TrashIcon/>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action supprimera définitivement le voyage <strong>{item.label}</strong> et
                            ne peut pas être annulée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
export default ActionsCell;

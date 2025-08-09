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
                resource: "sections",
                id: item.id,
            },
            {
                onSuccess: () => {
                    toast.success(`Section ${item.libelle} supprimée !`);
                },
                onError: (error) => {
                    toast.error(`Erreur suppression de la section : ${error.message}`);
                },
            }
        );
    };
    return (
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link to={`/admin/sections/edit/${item.id}`}>
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
                            Cette action supprimera définitivement la section <strong>{item.libelle}</strong> et
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

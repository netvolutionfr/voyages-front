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
import type {IUser} from "@/pages/admin/users/IUser.ts";

function ActionsCell({user}: { user: IUser }) {
    const { mutate: deleteItem } = useDelete<IUser>();

    const handleDelete = () => {
        deleteItem(
            {
                resource: "users",
                id: user.publicId,
            },
            {
                onSuccess: () => {
                    toast.success(`Utilisateur ${user.email} supprimé !`);
                },
                onError: (error) => {
                    toast.error(`Erreur suppression de l'utilisateur : ${error.message}`);
                },
            }
        );
    };
    return (
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link to={`/admin/users/edit/${user.publicId}`}>
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
                            Cette action supprimera définitivement l'utilisateur <strong>{user.email}</strong> et
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

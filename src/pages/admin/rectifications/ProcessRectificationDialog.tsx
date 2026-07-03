import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { patchRectificationRequest } from "@/api/rgpd.ts";
import type { AdminRectificationRequest } from "@/type/rgpd.ts";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
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
import { Textarea } from "@/components/ui/textarea.tsx";
import { ExternalLink } from "lucide-react";

const FIELD_LABELS: Record<AdminRectificationRequest["field"], string> = {
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    BIRTH_DATE: "Date de naissance",
    EMAIL: "Email",
};

export function ProcessRectificationDialog({
    request,
    onProcessed,
}: {
    request: AdminRectificationRequest;
    onProcessed: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [adminComment, setAdminComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const process = async (status: "APPLIED" | "REJECTED") => {
        setSubmitting(true);
        try {
            await patchRectificationRequest(request.id, { status, adminComment: adminComment || undefined });
            toast.success(status === "APPLIED" ? "Demande marquée appliquée" : "Demande rejetée");
            setOpen(false);
            onProcessed();
        } catch {
            toast.error("Impossible de mettre à jour la demande");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    Traiter
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Traiter la demande de rectification</DialogTitle>
                    <DialogDescription>
                        {request.userFullName} ({request.userEmail}) demande de modifier{" "}
                        <strong>{FIELD_LABELS[request.field]}</strong> en « {request.requestedValue} »
                        {request.reason ? ` — motif : ${request.reason}` : ""}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Cette action ne modifie pas la fiche utilisateur : appliquez d'abord le changement, puis
                        clôturez la demande ci-dessous.
                    </p>
                    <Button variant="secondary" asChild className="w-full">
                        <Link to={`/admin/users/edit/${request.userPublicId}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                            Ouvrir la fiche utilisateur
                        </Link>
                    </Button>

                    <Textarea
                        placeholder="Commentaire admin (optionnel)"
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => process("REJECTED")} disabled={submitting}>
                        Rejeter
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={submitting}>Marquer appliquée</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Avez-vous appliqué la modification ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette étape ne modifie pas la fiche utilisateur elle-même. Confirmez uniquement si
                                    vous avez déjà mis à jour « {FIELD_LABELS[request.field]} » sur la fiche via le
                                    lien ci-dessus.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => process("APPLIED")}>
                                    Oui, confirmer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ProcessRectificationDialog;

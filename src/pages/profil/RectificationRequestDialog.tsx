import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormMask } from "use-mask-input";
import { toast } from "sonner";
import {
    rectificationRequestSchema,
    type RectificationRequestFormData,
} from "@/schemas/rectificationRequestSchema.ts";
import { createRectificationRequest } from "@/api/rgpd.ts";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { IconCircleCheck } from "@tabler/icons-react";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

const FIELD_LABELS: Record<RectificationRequestFormData["field"], string> = {
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    BIRTH_DATE: "Date de naissance",
    EMAIL: "Email",
};

function toIsoDate(value: string): string {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
}

export function RectificationRequestDialog() {
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedField, setSelectedField] = useState<RectificationRequestFormData["field"]>("FIRST_NAME");

    const form = useForm<RectificationRequestFormData>({
        resolver: zodResolver(rectificationRequestSchema),
        defaultValues: { field: "FIRST_NAME", requestedValue: "", reason: "" },
    });
    const registerWithMask = useHookFormMask(form.register);

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            // Reset après fermeture pour ne pas garder une confirmation ou des valeurs obsolètes.
            setSubmitted(false);
            setSelectedField("FIRST_NAME");
            form.reset({ field: "FIRST_NAME", requestedValue: "", reason: "" });
        }
    };

    const onSubmit = async (values: RectificationRequestFormData) => {
        try {
            const requestedValue =
                values.field === "BIRTH_DATE" ? toIsoDate(values.requestedValue) : values.requestedValue;
            await createRectificationRequest({
                field: values.field,
                requestedValue,
                reason: values.reason || undefined,
            });
            setSubmitted(true);
        } catch {
            toast.error("Impossible d'envoyer la demande pour le moment");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">Demander une rectification</Button>
            </DialogTrigger>
            <DialogContent>
                {submitted ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Demande envoyée</DialogTitle>
                        </DialogHeader>
                        <Alert>
                            <IconCircleCheck />
                            <AlertTitle>Votre demande a été transmise</AlertTitle>
                            <AlertDescription>
                                Elle sera traitée sous 1 mois. Aucune modification n'a encore été appliquée à votre
                                fiche.
                            </AlertDescription>
                        </Alert>
                        <DialogFooter>
                            <Button onClick={() => handleOpenChange(false)}>Fermer</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Demander une rectification</DialogTitle>
                            <DialogDescription>
                                Ces informations relèvent du dossier scolaire ou de l'identifiant de connexion : elles
                                ne sont pas modifiables directement. Votre demande sera examinée par l'établissement.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="field"
                                    render={({ field: f }) => (
                                        <FormItem>
                                            <FormLabel>Champ concerné</FormLabel>
                                            <Select
                                                value={f.value}
                                                onValueChange={(v) => {
                                                    f.onChange(v);
                                                    setSelectedField(v as RectificationRequestFormData["field"]);
                                                    form.setValue("requestedValue", "");
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(Object.keys(FIELD_LABELS) as Array<keyof typeof FIELD_LABELS>).map(
                                                        (key) => (
                                                            <SelectItem key={key} value={key}>
                                                                {FIELD_LABELS[key]}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="requestedValue"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Nouvelle valeur souhaitée</FormLabel>
                                            <FormControl>
                                                {selectedField === "BIRTH_DATE" ? (
                                                    <Input
                                                        {...registerWithMask("requestedValue", ["99/99/9999"], {
                                                            required: true,
                                                        })}
                                                        inputMode="numeric"
                                                        placeholder="jj/mm/aaaa"
                                                    />
                                                ) : (
                                                    <Input
                                                        {...form.register("requestedValue")}
                                                        type={selectedField === "EMAIL" ? "email" : "text"}
                                                    />
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Motif (optionnel)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <LoadingSpinner /> : "Envoyer la demande"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default RectificationRequestDialog;

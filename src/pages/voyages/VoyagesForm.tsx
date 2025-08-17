import {useParams} from "react-router-dom";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect} from "react";
import {Link} from "@refinedev/core";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {type VoyageFormData, VoyageSchema} from "@/schemas/voyageSchema.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import { fr } from "react-day-picker/locale"

const VoyagesForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);
    const form = useForm({
        resolver: zodResolver(VoyageSchema),
        refineCoreProps : {
            resource: "voyages",
            id: id ?? undefined,
            action: isEditing ? "edit" : "create",
            redirect: false
        },
        shouldFocusError: true,
    });

    const isLoading = form.refineCore.formLoading;

    useEffect(() => {
        form.setFocus("nom");
    }, [form, isEditing, id]);

    const register = form.register;

    const onSubmit = async (values: VoyageFormData) => {
        await form.refineCore.onFinish(values);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">{isEditing ? `Mise à jour du voyage` : "Ajout d'un nouveau voyage"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

                    <FormField
                        control={form.control}
                        name="nom"
                        render={() => (
                            <FormItem>
                                <FormLabel>Nom du voyage</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom"

                                        type="text"
                                        {...register("nom")} />
                                </FormControl>
                                <FormDescription>Donnez un titre au voyage</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={() => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Description"
                                        {...register("description")}
                                    />
                                </FormControl>
                                <FormDescription>Description détaillée du voyage</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="destination"
                        render={() => (
                            <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Destination"
                                        type="text"
                                        {...register("destination")} />
                                </FormControl>
                                <FormDescription>Où se déroule le voyage ?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="datesVoyage"
                        render={({ field } ) => (
                            <FormItem>
                                <FormLabel>Dates du voyage</FormLabel>
                                <FormControl>
                                    <Calendar
                                        mode="range"
                                        locale={fr}
                                        className="bg-transparent p-0"
                                        buttonVariant="outline"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() // Disable past dates
                                        }
                                    />
                                </FormControl>
                                <FormDescription>Quand le voyage a-t-il lieu ?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="datesInscription"
                        render={({ field } ) => (
                            <FormItem>
                                <FormLabel>Dates d'inscription</FormLabel>
                                <FormControl>
                                    <Calendar
                                        mode="range"
                                        locale={fr}
                                        className="bg-transparent p-0"
                                        buttonVariant="outline"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date(Date.now() - 1000 * 60 * 60 * 24) // Disable past dates except today
                                        }
                                    />
                                </FormControl>
                                <FormDescription>Quand les inscriptions sont-elles ouvertes ?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nombreMinParticipants"
                        render={() => (
                            <FormItem>
                                <FormLabel>Nombre minimum de participants</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nombre minimum de participants"
                                        type="number"
                                        {...register("nombreMinParticipants", { valueAsNumber: true })} />
                                </FormControl>
                                <FormDescription>Combien de participants minimum sont requis ?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nombreMaxParticipants"
                        render={() => (
                            <FormItem>
                                <FormLabel>Nombre maximum de participants</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nombre maximum de participants"
                                        type="number"
                                        {...register("nombreMaxParticipants", { valueAsNumber: true })} />
                                </FormControl>
                                <FormDescription>Combien de participants maximum sont autorisés ?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button className="mr-2" variant="outline" asChild>
                        <Link to="/voyages">Annuler</Link>
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </form>
            </Form>
        </div>
    );
}
export default VoyagesForm;

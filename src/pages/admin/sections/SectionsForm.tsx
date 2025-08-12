import {useParams} from "react-router-dom";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {type SectionFormData, SectionSchema} from "@/schemas/sectionSchema.ts";
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

const SectionsForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);
    const form = useForm({
        resolver: zodResolver(SectionSchema),
        refineCoreProps : {
            resource: "sections",
            id: id ?? undefined,
            action: isEditing ? "edit" : "create",
            redirect: "list"
        },
        shouldFocusError: true,
    });

    const isLoading = form.refineCore.formLoading;

    useEffect(() => {
        form.setFocus("libelle");
    }, [form, isEditing, id]);

    const register = form.register;

    const onSubmit = async (values: SectionFormData) => {
        await form.refineCore.onFinish(values);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">{isEditing ? `Mise à jour de la section` : "Ajout d'une nouvelle section"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

                    <FormField
                        control={form.control}
                        name="libelle"
                        render={() => (
                            <FormItem>
                                <FormLabel>Libellé</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Libellé"

                                        type="text"
                                        {...register("libelle")} />
                                </FormControl>
                                <FormDescription>L'abréviation utilisée pour la section</FormDescription>
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
                                    <Input
                                        placeholder="Description"

                                        type="text"
                                        {...register("description")} />
                                </FormControl>
                                <FormDescription>Description détaillée de la section</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="mr-2" variant="outline" asChild>
                        <Link to="/admin/sections">Annuler</Link>
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </form>
            </Form>
        </div>
    );
}
export default SectionsForm;

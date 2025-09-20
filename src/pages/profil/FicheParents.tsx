import LoadingSpinner from "@/components/common/LoadingSpinner";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {type ficheParentsFormData, ficheParentsSchema} from "@/schemas/ficheParentsSchema.ts";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {PhoneInput} from "@/components/ui/phone-input.tsx";


const FicheParents = () => {
    const form = useForm({
        resolver: zodResolver(ficheParentsSchema),
        refineCoreProps : {
            resource: "me",
            id: "me",
            action: "edit",
            redirect: false
        },
    });

    const register = form.register;

    const onSubmit = async (values: ficheParentsFormData) => {
        await form.refineCore.onFinish(values);
    };

    return (
        <>
            <Card className="w-full max-w-lg shadow-none">
                <CardHeader>Coordonnées des parents</CardHeader>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="text-lg font-semibold mb-4">Parent 1</div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="parent1LastName"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl>
                                                <Input {...register("parent1LastName")} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parent1FirstName"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl>
                                                <Input {...register("parent1FirstName")} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parent1Email"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...register("parent1Email")} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parent1Telephone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <PhoneInput defaultCountry="FR" {...field} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                            <div className="text-lg font-semibold mb-4 mt-8">Parent 2</div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="parent2LastName"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl>
                                                <Input {...register("parent2LastName")} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parent2FirstName"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl>
                                                <Input {...register("parent2FirstName")} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parent2Email"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...register("parent2Email")} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parent2Telephone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <PhoneInput defaultCountry="FR" {...field} className="input" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                            <Button type="submit" disabled={form.refineCore.formLoading}>
                                {form.refineCore.formLoading ? <LoadingSpinner /> : "Enregistrer"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}
export default FicheParents;

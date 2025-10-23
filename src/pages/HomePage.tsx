import {Button} from "@/components/ui/button.tsx";
import {IconEdit} from "@tabler/icons-react";
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {PhoneInput} from "@/components/ui/phone-input.tsx";
import {z} from "zod";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import type {Me} from "@/auth/types.ts";
import type {HttpError} from "@refinedev/core";

const formSchema = z.object({
    telephone: z.string().min(10, 'Téléphone requis'),
})
type formData = z.infer<typeof formSchema>;

const HomePage = () => {
    const form = useForm<Me, HttpError, { telephone: string }>({
        resolver: zodResolver(formSchema),
        refineCoreProps : {
            resource: "me",
            action: "edit",
            id: "me",
            redirect: false
        },
        shouldFocusError: true,
    });
    const [open, setOpen] = useState(false);

    const me = { ...form.refineCore.queryResult?.data?.data} as Me;

    // Remplir le champ quand les données arrivent
    useEffect(() => {
        if (me?.telephone) {
            form.reset({ telephone: me.telephone });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me?.telephone]);

    useEffect(() => {
        form.setFocus("telephone");
    }, [form]);

    const onSubmit = async (values: formData) => {
        await form.refineCore.onFinish(values);
        if (form.refineCore.queryResult?.isSuccess) {
            setOpen(false);
        }
    };

    return (
    <>
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        <p>Bienvenue sur votre tableau de bord. Ici, vous pouvez gérer vos informations personnelles et accéder à vos données.</p>
        {form.refineCore.queryResult?.isError && <p>Une erreur est survenue lors du chargement des données.</p>}
        {me && (
            <>
                <div className="p-6 bg-white rounded-lg shadow-md mt-4">
                    <h2 className="text-xl font-semibold mb-4">Vos informations</h2>
                    <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-6 gap-y-4 items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Nom</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    {me.lastName}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Prénom</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    {me.firstName}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Email</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    {me.email}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Téléphone</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    <div className="flex">{me.telephone}</div>
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="link"><IconEdit/></Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                                    <DialogHeader>
                                                        <DialogTitle>Numéro de téléphone</DialogTitle>
                                                        <DialogDescription>
                                                            Veuillez saisir votre numéro de téléphone portable.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 mt-6 mb-6">
                                                        <div className="grid gap-3">
                                                                <FormField
                                                                    control={form.control}
                                                                    name="telephone"
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <FormItem>
                                                                                <FormLabel>Téléphone</FormLabel>
                                                                                <FormControl>
                                                                                    <PhoneInput defaultCountry="FR" {...field} value={me.telephone as string}/>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        </>
                                                                    )}
                                                                />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">Annuler</Button>
                                                        </DialogClose>
                                                        <Button type="submit">Enregistrer</Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
    </>
    );
};

export default HomePage;

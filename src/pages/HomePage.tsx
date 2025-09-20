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

const formSchema = z.object({
    telephone: z.string().min(10, 'Téléphone requis'),
})
type formData = z.infer<typeof formSchema>;

const HomePage = () => {
    const form = useForm({
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
        {form.refineCore.queryResult?.data && (
            <>
                <div className="p-6 bg-white rounded-lg shadow-md mt-4">
                    <h2 className="text-xl font-semibold mb-4">Vos informations</h2>
                    <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-6 gap-y-4 items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Nom</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    {form.refineCore.queryResult?.data.data.lastName}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Prénom</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    {form.refineCore.queryResult?.data.data.firstName}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Email</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    {form.refineCore.queryResult?.data.data.email}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 text-gray-500 font-medium">Téléphone</div>
                            <div className="flex-1 text-gray-800">
                                <div className="flex items-center">
                                    <div className="flex">{form.refineCore.queryResult?.data.data.telephone}</div>
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
                                                                                    <PhoneInput defaultCountry="FR" {...field} value={form.refineCore.queryResult?.data?.data.telephone}/>
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

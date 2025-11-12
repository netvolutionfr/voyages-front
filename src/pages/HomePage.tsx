import {Button} from "@/components/ui/button.tsx";
import {IconEdit} from "@tabler/icons-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
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
import {User, Mail, Calendar, Phone, UserCircle, Info} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";

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
    const [roleInFrench, setRoleInFrench] = useState<string>("");

    const me = { ...form.refineCore.queryResult?.data?.data} as Me;
    const isLoading = form.refineCore.queryResult?.isLoading;
    const isError = form.refineCore.queryResult?.isError;

    // Remplir le champ quand les données arrivent
    useEffect(() => {
        if (me?.telephone) {
            form.reset({ telephone: me.telephone });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me?.telephone]);

    // Traduire le rôle
    useEffect(() => {
        if (me?.role) {
            switch (me.role) {
                case "TEACHER":
                    setRoleInFrench("Enseignant");
                    break;
                case "ADMIN":
                    setRoleInFrench("Administrateur");
                    break;
                case "STUDENT":
                    setRoleInFrench("Élève");
                    break;
                case "PARENT":
                    setRoleInFrench("Parent");
                    break;
                default:
                    setRoleInFrench("");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me?.role]);

    useEffect(() => {
        form.setFocus("telephone");
    }, [form]);

    const onSubmit = async (values: formData) => {
        await form.refineCore.onFinish(values);
        if (form.refineCore.queryResult?.isSuccess) {
            setOpen(false);
        }
    };

    // Calculer l'âge
    const calculateAge = (birthDate?: string): number | null => {
        if (!birthDate) return null;
        return Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    };

    const age = calculateAge(me?.birthDate);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl p-4 py-8 space-y-6">
                {/* En-tête */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                    <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Bienvenue sur votre tableau de bord. Consultez et gérez vos informations personnelles.
                        </p>
                    </div>
                </div>

                {/* État de chargement */}
                {isLoading && (
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                )}

                {/* Erreur de chargement */}
                {isError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">
                            Une erreur est survenue lors du chargement des données.
                        </p>
                    </div>
                )}

                {/* Informations utilisateur */}
                {me && !isLoading && (
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                            <h2 className="text-lg font-semibold">Vos informations</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Nom */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Nom</span>
                                    </div>
                                    <div className="flex-1 text-sm pl-7 sm:pl-0">{me.lastName}</div>
                                </div>

                                {/* Prénom */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Prénom</span>
                                    </div>
                                    <div className="flex-1 text-sm pl-7 sm:pl-0">{me.firstName}</div>
                                </div>

                                {/* Profil */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Profil</span>
                                    </div>
                                    <div className="flex-1 pl-7 sm:pl-0">
                                        <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                            {roleInFrench}
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                                    </div>
                                    <div className="flex-1 text-sm pl-7 sm:pl-0 break-all">{me.email}</div>
                                </div>

                                {/* Date de naissance */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Date de naissance</span>
                                    </div>
                                    <div className="flex-1 text-sm pl-7 sm:pl-0">
                                        {me.birthDate ? (
                                            <>
                                                {new Date(me.birthDate).toLocaleDateString("fr-FR")}
                                                {age && (
                                                    <span className="text-muted-foreground ml-2">({age} ans)</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>

                                {/* Genre */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b last:border-0">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Genre</span>
                                    </div>
                                    <div className="flex-1 text-sm pl-7 sm:pl-0">{me.gender || "—"}</div>
                                </div>

                                {/* Téléphone */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3">
                                    <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Téléphone</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-2 pl-7 sm:pl-0">
                                        <span className="text-sm">{me.telephone || "—"}</span>
                                        <Dialog open={open} onOpenChange={setOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <IconEdit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <Form {...form}>
                                                    <div onSubmit={(e) => {
                                                        e.preventDefault();
                                                        form.handleSubmit(onSubmit)(e);
                                                    }}>
                                                        <DialogHeader>
                                                            <DialogTitle>Numéro de téléphone</DialogTitle>
                                                            <DialogDescription>
                                                                Veuillez saisir votre numéro de téléphone portable.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <FormField
                                                                control={form.control}
                                                                name="telephone"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Téléphone</FormLabel>
                                                                        <FormControl>
                                                                            <PhoneInput
                                                                                defaultCountry="FR"
                                                                                {...field}
                                                                                value={me.telephone as string}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button variant="outline">Annuler</Button>
                                                            </DialogClose>
                                                            <Button
                                                                type="button"
                                                                onClick={form.handleSubmit(onSubmit)}
                                                            >
                                                                Enregistrer
                                                            </Button>
                                                        </DialogFooter>
                                                    </div>
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
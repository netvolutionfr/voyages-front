import {useForm} from "@refinedev/react-hook-form";
import type {HttpError} from "@refinedev/core";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import {profilePatchSchema, type ProfilePatchFormData} from "@/schemas/profilePatchSchema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {PhoneInput} from "@/components/ui/phone-input.tsx";
import RectificationRequestDialog from "@/pages/profil/RectificationRequestDialog.tsx";

/** yyyy-MM-dd (LocalDate backend) -> jj/mm/aaaa, affichage seul (champ non modifiable ici). */
function formatDateFR(isoDate?: string | null): string {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

function ReadOnlyField({label, value}: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || "—"}</p>
        </div>
    );
}

const FicheRenseignements = () => {
    const form = useForm<ProfilePatchFormData, HttpError, ProfilePatchFormData>({
        resolver: zodResolver(profilePatchSchema),
        refineCoreProps: {
            resource: "me",
            id: "me",
            action: "edit",
            redirect: false,
        },
    });

    const {register} = form;
    const profile = form.refineCore.query?.data?.data as
        | { firstName?: string; lastName?: string; email?: string; birthDate?: string; section?: string }
        | undefined;

    const onSubmit = async (values: ProfilePatchFormData) => {
        // PATCH /me/profile : absent = inchangé, on n'envoie donc que des valeurs renseignées.
        await form.refineCore.onFinish({
            gender: values.gender,
            telephone: values.telephone || undefined,
            displayName: values.displayName || undefined,
        });
    };

    if (form.refineCore.query?.isLoading) {
        return <LoadingSpinner/>;
    }

    return (
        <div className="w-full max-w-lg space-y-6">
            <Card className="shadow-none">
                <CardHeader>Identité</CardHeader>
                <CardContent className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Ces informations relèvent du dossier scolaire ou de l'identifiant de connexion et ne sont pas
                        modifiables directement.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <ReadOnlyField label="Prénom" value={profile?.firstName}/>
                        <ReadOnlyField label="Nom" value={profile?.lastName}/>
                        <ReadOnlyField label="Email" value={profile?.email}/>
                        <ReadOnlyField label="Date de naissance" value={formatDateFR(profile?.birthDate)}/>
                        <ReadOnlyField label="Section" value={profile?.section}/>
                    </div>
                    <RectificationRequestDialog/>
                </CardContent>
            </Card>

            <Card className="shadow-none">
                <CardHeader>Fiche de renseignements</CardHeader>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Sexe</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row gap-8">
                                                <FormItem className="flex items-center gap-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="M"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Masculin
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center gap-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="F"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Féminin
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center gap-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="N"/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Non spécifié
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telephone"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Téléphone</FormLabel>
                                        <FormControl>
                                            <PhoneInput defaultCountry="FR" {...field} className="input"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayName"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Nom d'affichage</FormLabel>
                                        <FormControl>
                                            <Input {...register("displayName")} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Separator/>

                            <Button type="submit" disabled={form.refineCore.formLoading}>
                                {form.refineCore.formLoading ? <LoadingSpinner/> : "Enregistrer"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};
export default FicheRenseignements;

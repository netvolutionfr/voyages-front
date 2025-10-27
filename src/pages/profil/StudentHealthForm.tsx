import {useOne, useCreate, type HttpError} from "@refinedev/core";
import type {StudentHealthFormResponse, StudentHealthFormUpsertRequest} from "@/type/studentHealthForm.ts";
import {useEffect, useMemo} from "react";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {studentHealthFormSchema, type StudentHealthFormValues} from "@/schemas/studentHealthFormSchema.ts";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
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
import {Textarea} from "@/components/ui/textarea.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import type {Resolver, SubmitHandler} from "react-hook-form";

const csvToArray = (csv?: string): string[] | undefined => {
    if (!csv) return undefined;
    const arr = csv
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    return arr.length ? arr : undefined;
};

const arrayToCsv = (arr?: string[] | null): string => {
    if (!arr || arr.length === 0) return "";
    return arr.join(", ");
};

const ensureStringOrNull = (v?: string): string | null => (v && v.length > 0 ? v : null);
type FormIn = StudentHealthFormValues;
type FormOut = StudentHealthFormValues;
export default function StudentHealthForm() {

    // GET /me/health-form
    const { data, isLoading, refetch } = useOne<StudentHealthFormResponse>({
        resource: "me/health-form",
        id: "me",
        queryOptions: { staleTime: 0 },
    });

    // POST /me/health-form (upsert)
    const { mutate: save, isLoading: isSaving } = useCreate<StudentHealthFormResponse>();

    const initial: StudentHealthFormValues = useMemo(() => {
        const res = data?.data;
        return {
            drugAllergiesCsv: arrayToCsv(res?.allergies?.drug ?? undefined),
            foodAllergiesCsv: arrayToCsv(res?.allergies?.food ?? undefined),
            otherAllergiesCsv: arrayToCsv(res?.allergies?.other ?? undefined),
            allergiesNotes: res?.allergies?.notes ?? "",

            vegetarian: Boolean(res?.diet?.vegetarian ?? false),
            noPork: Boolean(res?.diet?.noPork ?? false),
            lactoseIntolerant: Boolean(res?.diet?.lactoseIntolerant ?? false),
            glutenFree: Boolean(res?.diet?.glutenFree ?? false),
            dietNotes: res?.diet?.notes ?? "",

            dailyTreatments: res?.treatments?.daily?.map((t) => `${t.name}${t.dose ? ` (${t.dose})` : ""}`).join("; ") ?? "",
            emergencyTreatments: res?.treatments?.emergency?.map((t) => t.name).join("; ") ?? "",
            hasPAI: Boolean(res?.treatments?.hasPAI ?? false),
            paiDetails: res?.treatments?.paiDetails ?? "",

            primaryName: res?.emergencyContacts?.primary?.name ?? "",
            primaryRelation: res?.emergencyContacts?.primary?.relation ?? "",
            primaryPhone: res?.emergencyContacts?.primary?.phone ?? "",
            primaryAltPhone: res?.emergencyContacts?.primary?.altPhone ?? "",

            secondaryName: res?.emergencyContacts?.secondary?.name ?? "",
            secondaryRelation: res?.emergencyContacts?.secondary?.relation ?? "",
            secondaryPhone: res?.emergencyContacts?.secondary?.phone ?? "",

            backupName: res?.emergencyContacts?.backup?.name ?? "",
            backupRelation: res?.emergencyContacts?.backup?.relation ?? "",
            backupPhone: res?.emergencyContacts?.backup?.phone ?? "",

            consentHospitalization: Boolean(res?.consentHospitalization ?? false),
            consentTransport: Boolean(res?.consentTransport ?? false),

            validUntil: res?.validUntil ?? "",
            version: res?.version ?? 0,
        };
    }, [data]);

    const form = useForm<StudentHealthFormResponse, HttpError, StudentHealthFormValues>({
        resolver: zodResolver(studentHealthFormSchema) as Resolver<FormIn, unknown, FormOut>,
        defaultValues: initial,
        mode: "onChange",
    });

    useEffect(() => {
        if (data?.data) {
            form.reset(initial);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const onSubmit: SubmitHandler<StudentHealthFormValues> = (values) => {
        const dto: StudentHealthFormUpsertRequest = {
            allergies: {
                drug: csvToArray(values.drugAllergiesCsv) ?? null ?? undefined,
                food: csvToArray(values.foodAllergiesCsv) ?? null ?? undefined,
                other: csvToArray(values.otherAllergiesCsv) ?? null ?? undefined,
                notes: ensureStringOrNull(values.allergiesNotes),
            },
            diet: {
                vegetarian: values.vegetarian,
                noPork: values.noPork,
                lactoseIntolerant: values.lactoseIntolerant,
                glutenFree: values.glutenFree,
                notes: ensureStringOrNull(values.dietNotes),
            },
            treatments: {
                daily: values.dailyTreatments && values.dailyTreatments.trim().length > 0
                    ? values.dailyTreatments.split(";").map((s) => ({ name: s.trim() }))
                    : null,
                emergency: values.emergencyTreatments && values.emergencyTreatments.trim().length > 0
                    ? values.emergencyTreatments.split(";").map((s) => ({ name: s.trim() }))
                    : null,
                hasPAI: values.hasPAI,
                paiDetails: ensureStringOrNull(values.paiDetails),
            },
            emergencyContacts: {
                primary: {
                    name: values.primaryName,
                    relation: values.primaryRelation,
                    phone: values.primaryPhone,
                    altPhone: ensureStringOrNull(values.primaryAltPhone ?? ""),
                },
                secondary:
                    values.secondaryName && values.secondaryRelation && values.secondaryPhone
                        ? {
                            name: values.secondaryName,
                            relation: values.secondaryRelation,
                            phone: values.secondaryPhone,
                        }
                        : null,
                backup:
                    values.backupName && values.backupRelation && values.backupPhone
                        ? {
                            name: values.backupName,
                            relation: values.backupRelation,
                            phone: values.backupPhone,
                        }
                        : null,
            },
            consentHospitalization: values.consentHospitalization,
            consentTransport: values.consentTransport,
            validUntil: values.validUntil && values.validUntil.length > 0 ? values.validUntil : null,
            expectedVersion: values.version ?? null,
        };

        save(
            {
                resource: "me/health-form",
                values: dto
            }, {
                onSuccess: () => refetch()
            });
    };

    return (
        <Card className="mx-auto">
            <CardHeader>
                <CardTitle>Fiche santé & autorisations</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Chargement…</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Allergies */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">Allergies</h3>
                                <FormField
                                    control={form.control}
                                    name="drugAllergiesCsv"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Médicamenteuses</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: pénicilline, ibuprofène" {...field} />
                                            </FormControl>
                                            <FormDescription>Séparez par des virgules.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="foodAllergiesCsv"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alimentaires</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: arachide, gluten" {...field} />
                                            </FormControl>
                                            <FormDescription>Séparez par des virgules.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="otherAllergiesCsv"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Autres</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: latex, piqûres d'insectes" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="allergiesNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Précisions</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Détails utiles (EpiPen, protocole…)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* Diet */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">Régime alimentaire</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="vegetarian"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>Végétarien</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="noPork"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>Sans porc</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lactoseIntolerant"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>Intolérance lactose</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="glutenFree"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>Sans gluten</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="dietNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Précisions</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Intolérances, précisions de menus…" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            {/* Treatments */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">Traitements</h3>
                                <FormField
                                    control={form.control}
                                    name="dailyTreatments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quotidiens</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="ex: Vitamine D (1/j); Ventoline" {...field} />
                                            </FormControl>
                                            <FormDescription>Séparez par un point-virgule ;</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emergencyTreatments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>En cas d’urgence</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="ex: EpiPen; Sucre" {...field} />
                                            </FormControl>
                                            <FormDescription>Séparez par un point-virgule ;</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <FormField
                                        control={form.control}
                                        name="hasPAI"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>PAI (protocole) existant</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paiDetails"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Détails PAI</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ex: signé le 2025-09-01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Contacts */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">Contacts d’urgence</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="primaryName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact principal — Nom</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="primaryRelation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lien</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="primaryPhone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="primaryAltPhone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone (alt)</FormLabel>
                                            <FormControl><Input placeholder="optionnel" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <Label className="text-sm mt-2">Contact secondaire (optionnel)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="secondaryName" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Nom" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="secondaryRelation" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Lien" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="secondaryPhone" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Téléphone" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <Label className="text-sm mt-2">Contact de secours (optionnel)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="backupName" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Nom" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="backupRelation" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Lien" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="backupPhone" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><Input placeholder="Téléphone" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </section>

                            {/* Consents & ValidUntil */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">Autorisations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <FormField
                                        control={form.control}
                                        name="consentHospitalization"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>Autorisation soins / hospitalisation</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="consentTransport"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0 border rounded-lg p-3">
                                                <FormLabel>Autorisation transport</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Validité jusqu’au</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormDescription>Optionnel (ex. fin d’année scolaire)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </section>

                            <input type="hidden" value={form.getValues("version") ?? 0} readOnly />

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Enregistrement…" : "Enregistrer"}
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => form.reset(initial)} disabled={isSaving}>
                                    Réinitialiser
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
                {data?.data?.updatedAt ? (
                    <span>Dernière mise à jour : {new Date(data.data.updatedAt).toLocaleString()}</span>
                ) : (
                    <span>Complétez la fiche puis Enregistrer</span>
                )}
            </CardFooter>
        </Card>
    );
}
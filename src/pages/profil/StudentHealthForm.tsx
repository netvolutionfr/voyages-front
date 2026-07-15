import { useEffect, useMemo } from "react";
import { IconAlertCircle, IconPill, IconPhone, IconShield, IconInfoCircle, IconCircleCheck } from "@tabler/icons-react";
import { useOne, useCreate } from "@refinedev/core";
import type {
    StudentHealthFormResponse,
    StudentHealthFormUpsertRequest,
} from "@/type/studentHealthForm";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    studentHealthFormSchema,
    type StudentHealthFormValues,
} from "@/schemas/studentHealthFormSchema";

// shadcn/ui
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useForm, useWatch, type Resolver, type SubmitHandler } from "react-hook-form";
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
} from "@/components/ui/alert-dialog";

// ===== Helpers =====
// Bornes de découpage : évite d'envoyer des listes/items démesurés au backend
const MAX_LIST_ITEMS = 50;
const MAX_ITEM_LENGTH = 200;

const csvToArray = (csv?: string): string[] | undefined => {
    if (!csv) return undefined;
    const arr = csv
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, MAX_LIST_ITEMS)
        .map((s) => s.slice(0, MAX_ITEM_LENGTH));
    return arr.length ? arr : undefined;
};

const splitTreatments = (raw?: string): { name: string }[] | null => {
    if (!raw || raw.trim().length === 0) return null;
    const items = raw
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, MAX_LIST_ITEMS)
        .map((s) => ({ name: s.slice(0, MAX_ITEM_LENGTH) }));
    return items.length ? items : null;
};

const arrayToCsv = (arr?: string[] | null): string => {
    if (!arr || arr.length === 0) return "";
    return arr.join(", ");
};

const ensureStringOrNull = (v?: string): string | null =>
    v && v.length > 0 ? v : null;

// ===== Component =====
export default function StudentHealthFormImproved() {
    // GET /me/health-form
    const { result, query: healthQuery } = useOne<StudentHealthFormResponse>({
        resource: "me/health-form",
        id: "me",
        queryOptions: { staleTime: 0 },
    });
    const { isLoading, refetch } = healthQuery;

    // POST /me/health-form (upsert)
    const { mutate: save, mutation: saveMutation } = useCreate<StudentHealthFormResponse>();
    const isSaving = saveMutation.isPending;

    // Map API → form defaults
    const initial: StudentHealthFormValues = useMemo(() => {
        const res = result;
        return {
            // allergies
            drugAllergiesCsv: arrayToCsv(res?.allergies?.drug ?? undefined),
            foodAllergiesCsv: arrayToCsv(res?.allergies?.food ?? undefined),
            otherAllergiesCsv: arrayToCsv(res?.allergies?.other ?? undefined),
            allergiesNotes: res?.allergies?.notes ?? "",

            // treatments
            dailyTreatments:
                res?.treatments?.daily
                    ?.map((t) => `${t.name}${t.dose ? ` (${t.dose})` : ""}`)
                    .join("; ") ?? "",
            emergencyTreatments:
                res?.treatments?.emergency?.map((t) => t.name).join("; ") ?? "",
            hasPAI: Boolean(res?.treatments?.hasPAI ?? false),
            paiDetails: res?.treatments?.paiDetails ?? "",

            // contacts
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

            // consents
            consentHospitalization: Boolean(res?.consentHospitalization ?? false),
            consentTransport: Boolean(res?.consentTransport ?? false),
            hospitalizationRefusalReason: res?.hospitalizationRefusalReason ?? "",
            transportRefusalReason: res?.transportRefusalReason ?? "",

            // misc
            validUntil: res?.validUntil ?? "",
            version: res?.version ?? 0,
        };
    }, [result]);

    // React Hook Form
    const form = useForm<StudentHealthFormValues>({
        resolver: zodResolver(studentHealthFormSchema) as Resolver<
            StudentHealthFormValues,
            unknown,
            StudentHealthFormValues
        >,
        defaultValues: initial,
        mode: "onChange",
    });
    const hasUnsavedChanges = form.formState.isDirty;
    const canSave = hasUnsavedChanges && !isSaving && !isLoading;
    const hasSavedHealthForm = Boolean(
        result &&
        result.status !== "MISSING" &&
        (result.signedAt || result.updatedAt)
    );
    const savedHealthFormStatus = hasSavedHealthForm
        ? result?.signedAt
            ? `Signé le ${new Date(result.signedAt).toLocaleString()}`
            : result?.updatedAt
                ? `Dernière mise à jour : ${new Date(result.updatedAt).toLocaleString()}`
                : null
        : null;
    const hasPAI = useWatch({
        control: form.control,
        name: "hasPAI",
    });

    // Refresh defaults on new data
    useEffect(() => {
        if (result) {
            form.reset(initial);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    // Submit → DTO mapping
    // Les motifs de refus sont validés par le schéma (superRefine) :
    // ce handler n'est appelé qu'avec des valeurs cohérentes.
    const onSubmit: SubmitHandler<StudentHealthFormValues> = (values) => {
        if (!hasUnsavedChanges) {
            return;
        }

        const dto: StudentHealthFormUpsertRequest = {
            allergies: {
                drug: csvToArray(values.drugAllergiesCsv) ?? null,
                food: csvToArray(values.foodAllergiesCsv) ?? null,
                other: csvToArray(values.otherAllergiesCsv) ?? null,
                notes: ensureStringOrNull(values.allergiesNotes),
            },
            treatments: {
                daily: splitTreatments(values.dailyTreatments),
                emergency: splitTreatments(values.emergencyTreatments),
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
                    values.secondaryName &&
                    values.secondaryRelation &&
                    values.secondaryPhone
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
            hospitalizationRefusalReason: values.consentHospitalization
                ? null
                : values.hospitalizationRefusalReason,
            transportRefusalReason: values.consentTransport
                ? null
                : values.transportRefusalReason,
            validUntil:
                values.validUntil && values.validUntil.length > 0
                    ? values.validUntil
                    : null,
            expectedVersion: values.version ?? null,
        };

        save(
            { resource: "me/health-form", values: dto },
            { onSuccess: () => refetch() }
        );
    };

    // ===== UI =====
    return (
        <Card className="mx-auto max-w-4xl">
            <CardHeader>
                <CardTitle className="text-3xl">Fiche santé & autorisations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Statut de complétion (signedAt / updatedAt) */}
                {savedHealthFormStatus && (
                    <div className="flex items-start gap-3 rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950/20">
                        <IconCircleCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0 dark:text-emerald-400" />
                        <div className="text-sm">
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">Formulaire enregistré</p>
                            <p className="text-emerald-700 dark:text-emerald-300">
                                {savedHealthFormStatus}
                            </p>
                        </div>
                    </div>
                )}

                {/* Notice RGPD */}
                <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                    <IconInfoCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Ces informations sont <span className="font-medium text-foreground">confidentielles</span> et uniquement accessibles par les personnels habilités de l’établissement et les encadrants lors des sorties. Elles sont protégées conformément au RGPD (mission d’intérêt public).
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Chargement…</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Allergies */}
                            <section className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <IconAlertCircle className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Allergies</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="drugAllergiesCsv"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Médicamenteuses</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ex: pénicilline, ibuprofène"
                                                        {...field}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="foodAllergiesCsv"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Alimentaires (intolérances incluses)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ex: arachide, lactose, gluten"
                                                        {...field}
                                                    />
                                                </FormControl>

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
                                                    <Input
                                                        placeholder="Ex: latex, piqûres d'insectes"
                                                        {...field}
                                                    />
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
                                                    <Textarea
                                                        placeholder="Détails utiles : sévérité, protocole (ex: EpiPen), signes d’alerte…"
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Traitements */}
                            <section className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <IconPill className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Traitements</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="dailyTreatments"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quotidiens</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Ex: Vitamine D (1/jour) ; Ventoline"
                                                        rows={2}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="emergencyTreatments"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>En cas d'urgence</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Ex: EpiPen ; Sucre"
                                                        rows={2}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Ligne PAI responsive, sans décalage sur desktop */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
                                        {/* Colonne 1 : switch PAI */}
                                        <FormField
                                            control={form.control}
                                            name="hasPAI"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-3">
                                                    <FormLabel className="pr-4">PAI (protocole) existant</FormLabel>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Colonne 2 : détails PAI */}
                                        <FormField
                                            control={form.control}
                                            name="paiDetails"
                                            render={({ field }) => {
                                                // Mobile: totalement masqué quand non coché
                                                // Desktop: invisible mais espace réservé quand non coché (pas de décalage)
                                                const mobile = hasPAI ? "block" : "hidden";
                                                const desktop = hasPAI
                                                    ? "md:block md:visible md:opacity-100"
                                                    : "md:block md:invisible md:opacity-0 md:pointer-events-none";
                                                return (
                                                    <FormItem className={`${mobile} ${desktop}`} aria-hidden={!hasPAI}>
                                                        <FormLabel>Détails PAI</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Ex: signé le 2025-09-01"
                                                                disabled={!hasPAI}
                                                                tabIndex={hasPAI ? 0 : -1}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Contacts d'urgence */}
                            <section className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <IconPhone className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Contacts d'urgence</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* principal */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Contact principal
                                            </span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="primaryName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Nom et prénom <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nom complet" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="primaryRelation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Lien <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: père, mère" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="primaryPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Téléphone <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="06 12 34 56 78" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="primaryAltPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Téléphone (alt)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Optionnel" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* secondaire */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Contact secondaire (optionnel)
                                            </span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="secondaryName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Nom" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="secondaryRelation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Lien" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="secondaryPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Téléphone" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* secours */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Contact de secours (optionnel)
                                            </span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="backupName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Nom" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="backupRelation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Lien" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="backupPhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Téléphone" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Autorisations & validité */}
                            <section className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-muted/50 px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <IconShield className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Autorisations & validité</h2>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="consentHospitalization"
                                        render={({ field }) => {
                                            const isNo = !field.value;
                                            return (
                                                <FormItem className="space-y-2 rounded-lg border p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Autorisation soins / hospitalisation</FormLabel>
                                                            <p className="text-xs text-muted-foreground">En cas d'urgence médicale</p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </div>

                                                    {isNo && (
                                                        <FormField
                                                            control={form.control}
                                                            name="hospitalizationRefusalReason"
                                                            render={({ field: reasonField }) => (
                                                                <FormItem className="mt-3">
                                                                    <FormLabel className="text-xs">Motif du refus</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Précisez votre motif (requis si refus)."
                                                                            rows={2}
                                                                            {...reasonField}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="consentTransport"
                                        render={({ field }) => {
                                            const isNo = !field.value;
                                            return (
                                                <FormItem className="space-y-2 rounded-lg border p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Autorisation transport</FormLabel>
                                                            <p className="text-xs text-muted-foreground">Par les moyens appropriés</p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </div>

                                                    {isNo && (
                                                        <FormField
                                                            control={form.control}
                                                            name="transportRefusalReason"
                                                            render={({ field: reasonField }) => (
                                                                <FormItem className="mt-3">
                                                                    <FormLabel className="text-xs">Motif du refus</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Précisez votre motif (requis si refus)."
                                                                            rows={2}
                                                                            {...reasonField}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="validUntil"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Validité jusqu’au</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                <Button type="submit" disabled={!canSave} className="flex-1">
                                    {isSaving ? "Enregistrement…" : "Enregistrer"}
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button" variant="secondary" disabled={isSaving}>
                                            Réinitialiser
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Réinitialiser tous les champs ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Cette action efface les modifications non enregistrées et recharge les dernières valeurs connues.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => form.reset(initial)}>
                                                Réinitialiser
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
                {hasSavedHealthForm && result?.updatedAt ? (
                    <span>
                        Dernière mise à jour : {new Date(result.updatedAt).toLocaleString()}
                    </span>
                ) : (
                    <span>Complétez la fiche puis Enregistrer</span>
                )}
            </CardFooter>
        </Card>
    );
}

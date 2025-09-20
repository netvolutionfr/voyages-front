import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {type BaseRecord, type HttpError, useSelect} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import type { IPays } from "@/pages/voyages/IPays";
import { VoyageSchema, type VoyageFormData } from "@/schemas/voyageSchema";
import {dtoToForm} from "@/pages/voyages/voyageMappers";

import { fr } from "react-day-picker/locale";

import axiosInstance from "@/lib/axios";
import imageCompression from "browser-image-compression";
import type {VoyageUpsertRequest} from "@/pages/voyages/dto/VoyageUpsertRequest.tsx";
import type {VoyageDTO} from "@/pages/voyages/dto/VoyageDTO.tsx";
import type {DateRange} from "react-day-picker";
import type {SubmitHandler, Resolver} from "react-hook-form";
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import {Switch} from "@/components/ui/switch.tsx";

/** Enum front pour rester synchro avec le back */
const secteursAll = [
    { value: "CYCLE_BAC", label: "Cycle bac" },
    { value: "CYCLE_POST_BAC", label: "Cycle post-bac" },
] as const;

type SectionOption = { publicId: string; label: string };
type UserOption    = { publicId: string; fullName: string };

const isoNow = () => new Date().toISOString();
const isoPlusDays = (n: number) => new Date(Date.now() + n*864e5).toISOString();

const VoyagesForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    // Pays
    const { options: paysOptions } = useSelect<IPays>({
        resource: "country",
        optionLabel: "name",
        optionValue: "id",
        pagination: { pageSize: 200 },
        sort: [{ field: "name", order: "asc" }],
    });

    // Sections (multi)
    const { options: sectionOptions } = useSelect<SectionOption>({
        resource: "sections",
        optionLabel: "label",
        optionValue: "publicId",
        pagination: { pageSize: 500 },
        sort: [{ field: "label", order: "asc" }],
    });

    // Organisateurs (multi) : profs + admins
    const { options: organisateurOptions } = useSelect<UserOption>({
        resource: "users",
        optionLabel: "fullName",
        optionValue: "publicId",
        pagination: { pageSize: 500 },
        sort: [{ field: "firstName", order: "asc" }],
        filters: [{ field: "role", operator: "in", value: ["TEACHER", "ADMIN"]}],
    });


    const form = useForm<
        BaseRecord,          // TData (retour de getOne/getList) — si tu as un IVoyage, mets-le ici
        HttpError,           // TError (Refine)
        VoyageUpsertRequest, // TRequest (payload API)
        VoyageFormData       // TFormValues (ce que RHF manipule → ton Zod infer)
    >({
        resolver: zodResolver(VoyageSchema) as Resolver<VoyageFormData>,
        refineCoreProps: {
            resource: "trips",
            id: id ?? undefined,
            action: isEditing ? "edit" : "create",
            redirect: "list",
        },
        defaultValues: {
            title: "",
            description: null,
            destination: "",
            totalPrice: null,
            familyContribution: null,
            coverPhotoUrl: null,
            countryId: 0, // ou undefined si tu rends ce champ optional dans le schéma
            tripDates: { from: isoNow(), to: isoPlusDays(7) },
            minParticipants: 1,
            maxParticipants: 1,
            registrationPeriod: null, // { from: Date, to: Date } | null | undefined
            chaperoneIds: [],
            sectionIds: [],
            sectors: [],
            poll: false,
        },
        shouldFocusError: true,
    });

    const { query } = form.refineCore;
    const loading = form.refineCore.formLoading;

    // Pré-remplissage en édition : mapper la réponse API (IVoyage) vers les defaults du form
    const record = query?.data?.data as VoyageDTO | undefined;

    useEffect(() => {
        if (!isEditing || !record) return;
        console.log("Reset form with record", dtoToForm(record));
        form.reset(dtoToForm(record));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, record?.id, record?.updatedAt]);

    useEffect(() => {
        form.setFocus("title");
    }, [form]);


    useEffect(() => {
        const sub = form.watch((v, info) => {
            console.log("[WATCH]", info.name, v.chaperoneIds, v);
        });
        return () => sub.unsubscribe();
    }, [form]);

    useEffect(() => {
        console.log("[FORMSTATE] errors", form.formState.errors);
    }, [form.formState.errors]);


    /** Upload direct vers MinIO via presigned URL */
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const handleCoverUpload = async (file: File) => {
        // Compression de l'image
        const compressed = await imageCompression(file, {
            maxSizeMB: 1,          // max 1 Mo
            maxWidthOrHeight: 1600, // redimensionne si trop grand
            useWebWorker: true,
        });

        // 2) URL pré-signée
        const presignRes = await axiosInstance.get(
            `/files/presign`,
            { params: { filename: compressed.name, contentType: compressed.type } }
        );
        const { url, key } = presignRes.data;

        // 3) PUT sur MinIO
        const putRes = await fetch(url, { method: "PUT", body: compressed, headers: { "Content-Type": compressed.type } });
        if (!putRes.ok) throw new Error("Échec de l’upload de la photo");

        // 3) Stocker la clé (coverPhotoUrl) côté form
        form.setValue("coverPhotoUrl", key, { shouldDirty: true, shouldValidate: true });
        setCoverPreview(URL.createObjectURL(file));
    };

    const onSubmit: SubmitHandler<VoyageFormData> = async (values) => {
        // Adapter les valeurs du form (euros → centimes)
        if (values.totalPrice != null) values.totalPrice = Math.round(values.totalPrice * 100);
        if (values.familyContribution != null) values.familyContribution = Math.round(values.familyContribution * 100);

        console.log("Submitting voyage form", values);
        await form.refineCore.onFinish(values as VoyageUpsertRequest);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <h1 className="text-2xl font-bold">
                {isEditing ? "Mise à jour du voyage" : "Ajout d'un nouveau voyage"}
            </h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 max-w-3xl mx-auto py-10"
                >
                    {/* Nom */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={() => (
                            <FormItem>
                                <FormLabel>Titre du voyage</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nom" type="text" {...form.register("title")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Mode Sondage */}
                    <FormField
                        control={form.control}
                        name="poll"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sondage</FormLabel>
                                <FormDescription>
                                    Si activé, le voyage est en mode sondage (il apparaît dans la liste avec un bouton "Je suis intéressé").
                                </FormDescription>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Destination */}
                    <FormField
                        control={form.control}
                        name="destination"
                        render={() => (
                            <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <FormControl>
                                    <Input placeholder="Destination" type="text" {...form.register("destination")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Pays (paysId) */}
                    <FormField
                        control={form.control}
                        name="countryId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Pays</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn("w-[240px] justify-between", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value
                                                    ? paysOptions.find((o) => Number(o.value) === Number(field.value))?.label
                                                    : "Choisir un pays"}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[240px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Rechercher..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                                <CommandGroup>
                                                    {paysOptions.map((p) => (
                                                        <CommandItem
                                                            value={String(p.value)}
                                                            key={p.value}
                                                            onSelect={() => form.setValue("countryId", Number(p.value), { shouldDirty: true })}
                                                        >
                                                            {p.label}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    Number(p.value) === Number(field.value) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={() => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Description" {...form.register("description")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Prix total (euros dans le form) */}
                    <FormField
                        control={form.control}
                        name="totalPrice"
                        render={() => (
                            <FormItem>
                                <FormLabel>Prix total (en €)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Prix total"
                                        {...form.register("totalPrice", {
                                            valueAsNumber: true,
                                            setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
                                        })}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Participation familles (euros dans le form) */}
                    <FormField
                        control={form.control}
                        name="familyContribution"
                        render={() => (
                            <FormItem>
                                <FormLabel>Participation des familles (en €)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Participation des familles"
                                        {...form.register("familyContribution", {
                                            valueAsNumber: true,
                                            setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
                                        })}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Cover photo */}
                    <FormField
                        control={form.control}
                        name="coverPhotoUrl"
                        render={() => (
                            <FormItem>
                                <FormLabel>Photo de couverture</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const f = e.target.files?.[0];
                                                if (f) await handleCoverUpload(f);
                                            }}
                                        />
                                        {coverPreview && (
                                            <img src={coverPreview} alt="Aperçu" className="h-16 w-24 object-cover rounded" />
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Dates voyage / inscription */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="tripDates"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dates du voyage</FormLabel>
                                    <FormControl>
                                        <Calendar
                                            mode="range"
                                            locale={fr}
                                            className="bg-transparent p-0"
                                            buttonVariant="outline"
                                            selected={field.value as unknown as DateRange}
                                            onSelect={(range) =>
                                                { field.onChange(range ?? { from: undefined, to: undefined });}
                                            }
                                            disabled={(date) => date < new Date()}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="registrationPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dates d'inscription</FormLabel>
                                    <FormControl>
                                        <Calendar
                                            mode="range"
                                            locale={fr}
                                            className="bg-transparent p-0"
                                            buttonVariant="outline"
                                            selected={field.value as unknown as DateRange ?? undefined}
                                            onSelect={(range) => field.onChange(range ?? null)}
                                            disabled={(date) =>
                                                date < new Date(new Date().setDate(new Date().getDate() - 1))
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Participants min/max */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">Nombre de participants</div>
                        <FormField
                            control={form.control}
                            name="minParticipants"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Mini</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Min. participants"
                                            {...form.register("minParticipants", { valueAsNumber: true })}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxParticipants"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Maxi</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Max. participants"
                                            {...form.register("maxParticipants", { valueAsNumber: true })}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Sections (multi) */}
                    <FormField
                        control={form.control}
                        name="sectionIds"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Sections concernées</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={sectionOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value ?? []}
                                            placeholder="Choisir des sections"
                                            responsive={true}
                                            autoSize={true}
                                            maxCount={0}
                                            hideSelectAll={true}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    {/* Organisateurs (Multi-Select) */}
                    <FormField
                        control={form.control}
                        name="chaperoneIds"
                        render={({ field, fieldState }) => {

                            return (
                                <FormItem>
                                    <FormLabel>Organisateurs</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={organisateurOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value ?? []}
                                            placeholder="Choisir des organisateurs"
                                            responsive={true}
                                            autoSize={true}
                                            maxCount={0}
                                            hideSelectAll={true}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {/* TEMP: Affiche l'erreur brute sous le champ */}
                                    {fieldState.error && (
                                        <pre className="text-xs text-muted-foreground">{JSON.stringify(fieldState.error, null, 2)}</pre>
                                    )}
                                </FormItem>
                            );
                        }}
                    />

                    {/* Secteurs (checkboxes) */}
                    <FormField
                        control={form.control}
                        name="sectors"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Secteurs</FormLabel>
                                <FormControl>
                                    <div className="flex flex-col gap-2">
                                        {secteursAll.map((s) => {
                                            const current: string[] = field.value || [];
                                            const checked = current.includes(s.value);
                                            return (
                                                <label key={s.value} className="inline-flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const set = new Set(current);
                                                            if (e.target.checked) set.add(s.value);
                                                            else set.delete(s.value);
                                                            form.setValue(
                                                                "sectors",
                                                                Array.from(set) as Array<"CYCLE_BAC" | "CYCLE_POST_BAC">,
                                                                { shouldDirty: true });
                                                        }}
                                                    />
                                                    {s.label}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </FormControl>
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
};

export default VoyagesForm;

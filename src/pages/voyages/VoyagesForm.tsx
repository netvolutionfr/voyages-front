import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {type BaseRecord, type HttpError, useList, useSelect} from "@refinedev/core";
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
import {ChevronsUpDown, Check, ImageIcon} from "lucide-react";
import {cn, getCoverUrl} from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import type { IPays } from "@/pages/voyages/IPays";
import { VoyageSchema, type VoyageFormData } from "@/schemas/voyageSchema";
import {dtoToForm} from "@/pages/voyages/voyageMappers";

import { fr } from "react-day-picker/locale";

import imageCompression from "browser-image-compression";
import type {VoyageUpsertRequest} from "@/pages/voyages/dto/VoyageUpsertRequest.tsx";
import type {VoyageDTO} from "@/pages/voyages/dto/VoyageDTO.tsx";
import type {DateRange} from "react-day-picker";
import type {SubmitHandler, Resolver} from "react-hook-form";
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {ClassesMultiPicker, type Cycle, type YearTag} from "@/components/ui/class-multi-picker.tsx";
import {api} from "@/auth/api.ts";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from "@/components/ui/input-group.tsx";

/** Enum front pour rester synchro avec le back */
type SectionOption = {
    publicId: string;
    label: string
    description: string;
    cycle: string;
    year: string;
};
type UserOption    = { publicId: string; fullName: string };

const isoNow = () => new Date().toISOString();
const isoPlusDays = (n: number) => new Date(Date.now() + n*864e5).toISOString();

const VoyagesForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);
    const [coverPreview, setCoverPreview] = useState<string | null | undefined>(null);
    const [tripStartDate, setTripStartDate] = useState<Date>(new Date());
    const [registerStartDate, setRegisterStartDate] = useState<Date>(new Date());

    // Pays
    const { options: paysOptions } = useSelect<IPays>({
        resource: "country",
        optionLabel: "name",
        optionValue: "id",
        pagination: { pageSize: 200 },
        sort: [{ field: "name", order: "asc" }],
    });

    // Sections (multi)
    const { data: sectionOptions } = useList<SectionOption>({
        resource: "sections",
        pagination: { pageSize: 500 },
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
            familyContribution: null,
            coverPhotoUrl: null,
            countryId: 0, // ou undefined si tu rends ce champ optional dans le schéma
            tripDates: { from: isoNow(), to: isoPlusDays(7) },
            minParticipants: 1,
            maxParticipants: 1,
            registrationDates: null, // { from: Date, to: Date } | null | undefined
            chaperoneIds: [],
            sectionIds: [],
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
        setCoverPreview(record.coverPhotoUrl ? getCoverUrl(record.coverPhotoUrl) : null);
        setTripStartDate(new Date(record.tripDates.from));
        if (record.registrationDates) {
            setRegisterStartDate(new Date(record.registrationDates.from));
        }
        form.reset(dtoToForm(record));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, record?.id, record?.updatedAt]);

    useEffect(() => {
        form.setFocus("title");
    }, [form]);


    /** Upload direct vers MinIO via presigned URL */
    const handleCoverUpload = async (file: File) => {
        // Compression de l'image
        const compressed = await imageCompression(file, {
            maxSizeMB: 1,          // max 1 Mo
            maxWidthOrHeight: 1600, // redimensionne si trop grand
            useWebWorker: true,
        });

        // 2) URL pré-signée
        const presignRes: {url: string, key: string} = await api.get(
            `/files/presign`,
            { params: { filename: compressed.name, contentType: compressed.type } }
        );
        const { url, key } = presignRes;

        // 3) PUT sur MinIO
        const putRes = await fetch(url, { method: "PUT", body: compressed, headers: { "Content-Type": compressed.type } });
        if (!putRes.ok) throw new Error("Échec de l’upload de la photo");

        // 3) Stocker la clé (coverPhotoUrl) côté form
        form.setValue("coverPhotoUrl", key, { shouldDirty: true, shouldValidate: true });
        setCoverPreview(URL.createObjectURL(file));
    };

    const onSubmit: SubmitHandler<VoyageFormData> = async (values) => {
        if (values.familyContribution != null) {
            values.familyContribution = Math.round(values.familyContribution * 100);
        }

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

                    {/* Participation familles (euros dans le form) */}
                    <FormField
                        control={form.control}
                        name="familyContribution"
                        render={() => (
                            <FormItem>
                                <FormLabel>Participation des familles (en €)</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <InputGroupText>€</InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            placeholder="0.00"
                                            {...form.register("familyContribution", {
                                                setValueAs: (v) => {
                                                    if (v === "" || v == null) return undefined;

                                                    // Gestion des virgules en entrée
                                                    v = v.toString().replace(",", ".");

                                                    // 1. Convertit en nombre (avec les flottants imparfaits)
                                                    const num = Number(v);

                                                    // 2. Arrondit proprement à 2 décimales. toFixed() retourne une string
                                                    const fixedString = num.toFixed(2);

                                                    // 3. Reconvertit en Number pour la validation Zod
                                                    return Number(fixedString);
                                                }
                                            })}
                                        />
                                    </InputGroup>
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
                                        <div className="w-64">
                                            <AspectRatio ratio={16 / 9} className="rounded-lg border bg-muted/30 overflow-hidden">
                                                {coverPreview ? (
                                                    <img
                                                        src={coverPreview}
                                                        alt="Photo de couverture"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8 opacity-60" />
                                                        <span className="text-sm">Aucune image</span>
                                                    </div>
                                                )}
                                            </AspectRatio>
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const f = e.target.files?.[0];
                                                if (f) await handleCoverUpload(f);
                                            }}
                                        />
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
                                            defaultMonth={tripStartDate}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )
                            }
                        />
                        <FormField
                            control={form.control}
                            name="registrationDates"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dates d'inscription</FormLabel>
                                    <FormControl>
                                        <Calendar
                                            mode="range"
                                            locale={fr}
                                            className="bg-transparent p-0"
                                            buttonVariant="outline"
                                            selected={field.value as unknown as DateRange}
                                            onSelect={(range) => field.onChange(range ?? null)}
                                            disabled={(date) =>
                                                date < new Date(new Date().setDate(new Date().getDate() - 1))
                                            }
                                            defaultMonth={registerStartDate}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )
                            }
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
                                        <ClassesMultiPicker
                                            options={sectionOptions?.data?.map(s => ({
                                                id: s.publicId,
                                                label: s.label,
                                                description: s.description,
                                                cycle: s.cycle as Cycle,
                                                year: s.year as YearTag
                                            })) || []}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Sélectionner des classes…"
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

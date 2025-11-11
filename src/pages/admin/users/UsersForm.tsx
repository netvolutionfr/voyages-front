import { useParams } from "react-router-dom";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UserFormData, UserSchema } from "@/schemas/userSchema.ts";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useEffect } from "react";
import { type HttpError, Link, useList } from "@refinedev/core";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import { useHookFormMask } from "use-mask-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { PhoneInput } from "@/components/ui/phone-input.tsx";

type SectionOption = {
    publicId: string;
    label: string;
    description: string;
    cycle: string;
    year: string;
};

const isoToFr = (iso?: string | null) => {
    if (!iso) return "";
    const [year, month, day] = iso.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
};

const frToIso = (fr?: string | null) => {
    if (!fr) return undefined;
    if (!fr.includes("/")) return fr; // on ne touche pas si déjà ISO
    const [day, month, year] = fr.split("/");
    if (!day || !month || !year) return undefined;
    return `${year}-${month}-${day}`;
};

const UsersForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const { data: sectionOptions } = useList<SectionOption>({
        resource: "sections",
        pagination: { pageSize: 500 },
    });

    const groupedSections = (sectionOptions?.data ?? [])
        .slice()
        .sort((a, b) => {
            if (a.cycle === b.cycle) {
                return a.year.localeCompare(b.year, "fr");
            }
            return a.cycle.localeCompare(b.cycle, "fr");
        })
        .reduce<Record<string, SectionOption[]>>((acc, section) => {
            if (!acc[section.cycle]) {
                acc[section.cycle] = [];
            }
            acc[section.cycle].push(section);
            return acc;
        }, {});

    const form = useForm<UserFormData, HttpError, UserFormData>({
        resolver: zodResolver(UserSchema),
        refineCoreProps: {
            resource: "users",
            id: id ?? undefined,
            action: isEditing ? "edit" : "create",
            redirect: "list",
        },
        shouldFocusError: true,
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            gender: "N",
            birthDate: "",
            telephone: "",
            sectionPublicId: "",
            role: "STUDENT",
        },
    });

    const {
        refineCore: { queryResult, formLoading },
        reset,
        control,
        register,
        setFocus,
        watch,
    } = form;

    const registerWithMask = useHookFormMask(register);

    const currentRole = watch("role");
    const isStudent = currentRole === "STUDENT";

    // Hydratation des données en mode édition
    useEffect(() => {
        if (!isEditing) return;

        const data = queryResult?.data?.data;
        if (!data) return;

        reset({
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            email: data.email ?? "",
            telephone: data.telephone ?? "",
            gender: (data.gender as "M" | "F" | "N") ?? "N",
            birthDate: isoToFr(data.birthDate as string | null),
            sectionPublicId: data.sectionPublicId ?? "",
            role: (data.role as UserFormData["role"]) ?? "STUDENT",
        });
    }, [isEditing, queryResult?.data?.data, reset]);

    // Focus initial
    useEffect(() => {
        setFocus("lastName");
    }, [setFocus]);

    const onSubmit = async (values: UserFormData) => {
        const birthDateIso = frToIso(values.birthDate ?? null);

        const normalizedGender: "M" | "F" | "N" =
            values.gender === "M" || values.gender === "F" || values.gender === "N"
                ? values.gender
                : "N";

        const payload: UserFormData = {
            ...values,
            birthDate: birthDateIso ?? null,
            gender: normalizedGender,
            sectionPublicId: values.sectionPublicId || "",
            role: values.role,
        };

        await form.refineCore.onFinish(payload);
    };

    if (formLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">
                {isEditing
                    ? "Mise à jour de l'utilisateur"
                    : "Ajout d'un nouvel utilisateur"}
            </h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 max-w-3xl mx-auto py-10"
                >
                    {/* NOM */}
                    <FormField
                        control={control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom"
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* PRÉNOM */}
                    <FormField
                        control={control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Prénom"
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* EMAIL : modifiable en create, lecture seule en edit */}
                    <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="prenom.nom@exemple.fr"
                                        autoComplete="email"
                                        {...field}
                                        disabled={isEditing}
                                        readOnly={isEditing}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* RÔLE */}
                    {isEditing ? (
                        // Rôle en lecture seule en édition
                        <FormField
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rôle</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value}
                                            disabled
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        // Rôle sélectionnable uniquement à la création
                        <FormField
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rôle</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un rôle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="STUDENT">Élève</SelectItem>
                                            <SelectItem value="TEACHER">Enseignant</SelectItem>
                                            <SelectItem value="PARENT">Parent</SelectItem>
                                            <SelectItem value="ADMIN">Administrateur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* SECTION (si STUDENT) */}
                    {isStudent && (
                        <FormField
                            control={control}
                            name="sectionPublicId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Classe / section</FormLabel>
                                    <Select
                                        key={field.value ?? "empty"}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value ?? ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une classe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(groupedSections).map(
                                                ([cycle, sections]) => (
                                                    <SelectGroup key={cycle}>
                                                        <SelectLabel>{cycle}</SelectLabel>
                                                        {sections.map((section) => (
                                                            <SelectItem
                                                                key={section.publicId}
                                                                value={section.publicId}
                                                            >
                                                                {section.label} -{" "}
                                                                {section.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* TÉLÉPHONE */}
                    <FormField
                        control={control}
                        name="telephone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        defaultCountry="FR"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* GENRE */}
                    <FormField
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Genre</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value ?? "N"}
                                        onValueChange={field.onChange}
                                        className="flex flex-row gap-8"
                                    >
                                        <FormItem className="flex items-center gap-3">
                                            <FormControl>
                                                <RadioGroupItem id="genre-m" value="M" />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor="genre-m"
                                                className="font-normal"
                                            >
                                                Masculin
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem className="flex items-center gap-3">
                                            <FormControl>
                                                <RadioGroupItem id="genre-f" value="F" />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor="genre-f"
                                                className="font-normal"
                                            >
                                                Féminin
                                            </FormLabel>
                                        </FormItem>

                                        <FormItem className="flex items-center gap-3">
                                            <FormControl>
                                                <RadioGroupItem id="genre-n" value="N" />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor="genre-n"
                                                className="font-normal"
                                            >
                                                Non spécifié
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* DATE DE NAISSANCE */}
                    <FormField
                        control={control}
                        name="birthDate"
                        render={() => (
                            <FormItem>
                                <FormLabel>Date de naissance</FormLabel>
                                <FormControl>
                                    <Input
                                        {...registerWithMask("birthDate", ["99/99/9999"], {
                                            required: false,
                                        })}
                                        inputMode="numeric"
                                        placeholder="jj/mm/aaaa"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button className="mr-2" variant="outline" asChild>
                        <Link to="/admin/users">Annuler</Link>
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </form>
            </Form>
        </div>
    );
};

export default UsersForm;
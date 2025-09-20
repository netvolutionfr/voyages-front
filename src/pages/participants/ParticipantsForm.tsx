import {useParams} from "react-router-dom";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link, useSelect} from "@refinedev/core";
import {type ParticipantFormData, ParticipantSchema} from "@/schemas/participantSchema.ts";
import {PhoneInput} from "@/components/ui/phone-input.tsx";
import {useHookFormMask} from "use-mask-input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import type {ISection} from "@/pages/admin/sections/ISection.ts";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";


const ParticipantsForm = () => {
    const { id } = useParams<{ id: string }>();
    const { options } = useSelect<ISection>({
        resource: "sections",
        optionLabel: "label",
        optionValue: "id",
        pagination: {
            pageSize: 100,
        }
    });
    const isEditing = Boolean(id);
    const form = useForm({
        resolver: zodResolver(ParticipantSchema),
        defaultValues: { gender: "N" },
        refineCoreProps : {
            resource: "participants",
            id: id ?? undefined,
            action: isEditing ? "edit" : "create",
            redirect: "list"
        },
        shouldFocusError: true,
    });
    const registerWithMask = useHookFormMask(form.register);

    const isLoading = form.refineCore.formLoading;

    const register = form.register;

    const onSubmit = async (values: ParticipantFormData) => {
        // Format dateNaissance to YYYY-MM-DD for backend compatibility
        if (values.birthDate) {
            const [day, month, year] = values.birthDate.split('/');
            values.birthDate = `${year}-${month}-${day}`;
        }
        await form.refineCore.onFinish(values);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">{isEditing ? `Mise à jour de la fiche élève` : "Ajout d'un nouvel élève"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sexe</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value ?? "N"}                // valeur contrôlée par RHF
                                        onValueChange={field.onChange}            // remonte le changement à RHF
                                        className="flex flex-row gap-8"
                                    >
                                        <FormItem className="flex items-center gap-3">
                                            <FormControl>
                                                <RadioGroupItem id="sexe-m" value="M" />
                                            </FormControl>
                                            <FormLabel htmlFor="sexe-m" className="font-normal">Masculin</FormLabel>
                                        </FormItem>

                                        <FormItem className="flex items-center gap-3">
                                            <FormControl>
                                                <RadioGroupItem id="sexe-f" value="F" />
                                            </FormControl>
                                            <FormLabel htmlFor="sexe-f" className="font-normal">Féminin</FormLabel>
                                        </FormItem>

                                        <FormItem className="flex items-center gap-3">
                                            <FormControl>
                                                <RadioGroupItem id="sexe-n" value="N" />
                                            </FormControl>
                                            <FormLabel htmlFor="sexe-n" className="font-normal">Non spécifié</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Nom</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                {...register("lastName")} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Prénom</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                {...register("firstName")} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="email"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...register("email")} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="telephone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Téléphone</FormLabel>
                                        <FormControl>
                                            <PhoneInput
                                                defaultCountry="FR"
                                                {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="birthDate"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Date de naissance</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...registerWithMask("birthDate", ['99/99/9999'], {
                                                    required: true
                                                })}
                                                inputMode="numeric"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="sectionId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Section</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-[200px] justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? options.find((section) => (section.value === field.value))?.label : "Choisir une section"}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Rechercher..."
                                                        className="h-9"
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>Aucune section trouvée.</CommandEmpty>
                                                        <CommandGroup>
                                                            {options.map((section) => (
                                                                <CommandItem
                                                                    value={section.value}
                                                                    key={section.value}
                                                                    onSelect={() => {
                                                                        form.setValue("sectionId", section.value)
                                                                    }}
                                                                >
                                                                    {section.label}
                                                                    <Check
                                                                        className={cn(
                                                                            "ml-auto",
                                                                            section.value === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
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
                        </div>
                    </div>
                    <Button className="mr-2" variant="outline" asChild>
                        <Link to="/admin/sections">Annuler</Link>
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </form>
            </Form>
        </div>
    );
}
export default ParticipantsForm;

import {useParams} from "react-router-dom";
import {useForm} from "@refinedev/react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
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
import {useEffect} from "react";
import {Link, useSelect} from "@refinedev/core";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {type VoyageFormData, VoyageSchema} from "@/schemas/voyageSchema.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import { fr } from "react-day-picker/locale"
import type {IPays} from "@/pages/voyages/IPays.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";

const VoyagesForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);
    const { options } = useSelect<IPays>({
        resource: "pays",
        optionLabel: "nom",
        optionValue: "id",
        pagination: {
            pageSize: 100,
        }
    });
    const form = useForm({
        resolver: zodResolver(VoyageSchema),
        refineCoreProps : {
            resource: "voyages",
            id: id ?? undefined,
            action: isEditing ? "edit" : "create",
            redirect: "list"
        },
        shouldFocusError: true,
    });

    const isLoading = form.refineCore.formLoading;

    useEffect(() => {
        form.setFocus("nom");
    }, [form, isEditing, id]);

    const register = form.register;

    const onSubmit = async (values: VoyageFormData) => {
        await form.refineCore.onFinish(values);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">{isEditing ? `Mise à jour du voyage` : "Ajout d'un nouveau voyage"}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

                    <FormField
                        control={form.control}
                        name="nom"
                        render={() => (
                            <FormItem>
                                <FormLabel>Titre du voyage</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom"

                                        type="text"
                                        {...register("nom")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="destination"
                        render={() => (
                            <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Destination"
                                        type="text"
                                        {...register("destination")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="paysId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Pays</FormLabel>
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
                                                {field.value ? options.find((section) => (section.value === field.value))?.label : "Choisir un pays"}
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
                                                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                                <CommandGroup>
                                                    {options.map((pays) => (
                                                        <CommandItem
                                                            value={pays.value}
                                                            key={pays.value}
                                                            onSelect={() => {
                                                                form.setValue("paysId", pays.value)
                                                            }}
                                                        >
                                                            {pays.label}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto",
                                                                    pays.value === field.value
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
                    <FormField
                        control={form.control}
                        name="description"
                        render={() => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Description"
                                        {...register("description")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="datesVoyage"
                            render={({ field } ) => (
                                <FormItem>
                                    <FormLabel>Dates du voyage</FormLabel>
                                    <FormControl>
                                        <Calendar
                                            mode="range"
                                            locale={fr}
                                            className="bg-transparent p-0"
                                            buttonVariant="outline"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date() // Disable past dates
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="datesInscription"
                            render={({ field } ) => (
                                <FormItem>
                                    <FormLabel>Dates d'inscription</FormLabel>
                                    <FormControl>
                                        <Calendar
                                            mode="range"
                                            locale={fr}
                                            className="bg-transparent p-0"
                                            buttonVariant="outline"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date(Date.now() - 1000 * 60 * 60 * 24) // Disable past dates except today
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">Nombre de participants</div>
                        <FormField
                            control={form.control}
                            name="nombreMinParticipants"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Mini</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Min. participants"
                                            {...register("nombreMinParticipants", { valueAsNumber: true })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nombreMaxParticipants"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Maxi</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Max. participants"
                                            {...register("nombreMaxParticipants", { valueAsNumber: true })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button className="mr-2" variant="outline" asChild>
                        <Link to="/voyages">Annuler</Link>
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </form>
            </Form>
        </div>
    );
}
export default VoyagesForm;

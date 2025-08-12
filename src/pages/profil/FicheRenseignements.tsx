import {useForm} from "@refinedev/react-hook-form";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import {ficheRenseignementSchema, type ficheRenseignementFormData} from "@/schemas/ficheRenseignementSchema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {useHookFormMask} from "use-mask-input";
import {PhoneInput} from "@/components/ui/phone-input.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {SECTIONS} from "@/config/sections.ts";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {cn} from "@/lib/utils.ts";

function convertDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}` // format ISO compatible avec LocalDate
}

const FicheRenseignements = () => {
    const form = useForm({
        resolver: zodResolver(ficheRenseignementSchema),
        refineCoreProps : {
            resource: "me",
            id: "me",
            action: "edit",
            redirect: false
        },
    });

    const registerWithMask = useHookFormMask(form.register);
    const register = form.register;

    const onSubmit = async (values: ficheRenseignementFormData) => {
        // Convert date to ISO format for LocalDate compatibility
        if (values.dateNaissance) {
            values.dateNaissance = convertDateToISO(values.dateNaissance);
        }
        await form.refineCore.onFinish(values);
    };

    return (
        <>
            <Card className="w-full max-w-lg shadow-none">
                <CardHeader>Fiche de renseignements</CardHeader>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="sexe"
                                render={( {field }) => (
                                    <FormItem>
                                        <FormLabel>Sexe</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                {...register("sexe")}
                                                defaultValue={form.refineCore.queryResult?.data?.data.sexe}
                                                className="flex flex-row gap-8">
                                                <FormItem className="flex items-center gap-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="M" checked={field.value === "M"}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Masculin
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center gap-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="F" checked={field.value === "F"}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Féminin
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center gap-3">
                                                    <FormControl>
                                                        <RadioGroupItem value="N" checked={field.value === "N"}/>
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Non spécifié
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dateNaissance"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Date de naissance</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...registerWithMask("dateNaissance", ['99/99/9999'], {
                                                        required: true
                                                    })}
                                                    inputMode="numeric"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />



                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="telephone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Téléphone</FormLabel>
                                                <FormControl>
                                                    <PhoneInput defaultCountry="FR" {...field} className="input" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="section"
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
                                                        {field.value
                                                            ? SECTIONS.find(
                                                                (section) => section === field.value
                                                            )
                                                            : "Choisir une section"}
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
                                                            {SECTIONS.map((section) => (
                                                                <CommandItem
                                                                    value={section}
                                                                    key={section}
                                                                    onSelect={() => {
                                                                        form.setValue("section", section)
                                                                    }}
                                                                >
                                                                    {section}
                                                                    <Check
                                                                        className={cn(
                                                                            "ml-auto",
                                                                            section === field.value
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

                            <Button type="submit" disabled={form.refineCore.formLoading}>
                                {form.refineCore.formLoading ? <LoadingSpinner /> : "Enregistrer"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );

}
export default FicheRenseignements;

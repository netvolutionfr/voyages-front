import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronDown } from "lucide-react";

export type Cycle =
    | "BTS"
    | "FC"
    | "LYCEE_GENERAL"
    | "LYCEE_PRO"
    | "PREPA"
    | "SUPERIEUR";


export type YearTag =
    | "TROISIEME_PRO"
    | "LYCEE_PRO"
    | "SECONDE"
    | "SECONDE_PRO"
    | "PREMIERE"
    | "PREMIERE_PRO"
    | "TERMINALE"
    | "TERMINALE_PRO"
    | "BTS1"
    | "BTS2"
    | "FC"
    | "PREPA"
    | "SUPERIEUR";

export type ClasseOption = {
    id: string;
    label: string;        // ex: "Terminale G3", "BTS SIO 2"
    description?: string; // ex: "Lycée Jean Moulin"
    cycle: Cycle;         // une des 6 catégories
    year: YearTag;        // l’année “pédagogique” utile pour facetter
    meta?: Record<string, string | number>;
};

type Props = {
    options: ClasseOption[];
    value: string[];                        // ids sélectionnés
    onChange: (ids: string[]) => void;
    placeholder?: string;
};

// lib: aide au regroupement
const cycleLabel: Record<Cycle, string> = {
    BTS: "BTS",
    FC: "Formation continue",
    LYCEE_GENERAL: "Lycée général et technologique",
    LYCEE_PRO: "Lycée professionnel",
    PREPA: "Classes prépa",
    SUPERIEUR: "Enseignement supérieur",
};

const yearOrder: YearTag[] = ["TROISIEME_PRO","SECONDE", "SECONDE_PRO","PREMIERE", "PREMIERE_PRO","TERMINALE", "TERMINALE_PRO","BTS1","BTS2","PREPA", "FC", "SUPERIEUR"];

export function ClassesMultiPicker({ options, value, onChange, placeholder = "Choisir des classes..." }: Props) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [cycleFacet, setCycleFacet] = React.useState<Cycle[] | null>(null);
    const [yearFacet, setYearFacet] = React.useState<YearTag[] | null>(null);

    // filtrage
    const filtered = React.useMemo(() => {
        return options.filter((opt) => {
            const matchQuery =
                query.trim().length === 0 ||
                opt.label.toLowerCase().includes(query.toLowerCase());
            const matchCycle =
                !cycleFacet || cycleFacet.length === 0 || cycleFacet.includes(opt.cycle);
            const matchYear =
                !yearFacet || yearFacet.length === 0 || yearFacet.includes(opt.year);
            return matchQuery && matchCycle && matchYear;
        });
    }, [options, query, cycleFacet, yearFacet]);

    // groupage par cycle
    const groups = React.useMemo(() => {
        const map = new Map<Cycle, ClasseOption[]>();
        for (const o of filtered) {
            const arr = map.get(o.cycle) ?? [];
            arr.push(o);
            map.set(o.cycle, arr);
        }
        // tri interne par year puis label
        for (const [k, arr] of map) {
            arr.sort((a, b) => {
                const ya = yearOrder.indexOf(a.year);
                const yb = yearOrder.indexOf(b.year);
                if (ya !== yb) return ya - yb;
                return a.label.localeCompare(b.label, "fr");
            });
            map.set(k, arr);
        }
        return map;
    }, [filtered]);

    const valueSet = React.useMemo(() => new Set(value), [value]);

    // helpers
    const toggleOne = (id: string) => {
        const next = new Set(valueSet);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange([...next]);
    };

    const setAll = (ids: string[], checked: boolean) => {
        const next = new Set(valueSet);
        for (const id of ids) {
            if (checked) next.add(id);
            else next.delete(id);
        }
        onChange([...next]);
    };

    const allVisibleIds = filtered.map((o) => o.id);

    // boutons “select all visibles”
    const allVisibleSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => valueSet.has(id));
    const someVisibleSelected = allVisibleIds.some((id) => valueSet.has(id));

    // presets utiles
    const applyPreset = (preset: "ALL_TERMINALE" | "BTS2") => {
        if (preset === "ALL_TERMINALE") {
            const ids = options
                .filter((o) => o.year === "TERMINALE") // Tle peu importe le cycle
                .map((o) => o.id);
            setAll(ids, true);
        }
        if (preset === "BTS2") {
            const ids = options
                .filter((o) => o.cycle === "BTS" && o.year === "BTS2")
                .map((o) => o.id);
            setAll(ids, true);
        }
    };

    // facettes UI
    const toggleFacet = <T,>(curr: T[] | null, value: T): T[] | null => {
        const set = new Set(curr ?? []);
        if (set.has(value)) set.delete(value);
        else set.add(value);
        return [...set];
    };

    return (
        <div className="w-full">
            {/* Résumé + clear */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-between">
                            {value.length === 0 ? placeholder : `${value.length} sélection(s)`}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[560px]" align="start">
                        {/* Barre presets + actions globales */}
                        <div className="p-2 flex flex-wrap gap-2 border-b">
                            <Button size="sm" variant="secondary" onClick={() => applyPreset("ALL_TERMINALE")}>
                                + Toutes les Terminales
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => applyPreset("BTS2")}>
                                + BTS 2e année
                            </Button>
                            <div className="ml-auto flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant={allVisibleSelected ? "default" : someVisibleSelected ? "secondary" : "outline"}
                                    onClick={() => setAll(allVisibleIds, !allVisibleSelected)}
                                >
                                    {allVisibleSelected ? "Tout désélectionner (filtré)" : "Tout sélectionner (filtré)"}
                                </Button>
                            </div>
                        </div>

                        {/* Facettes */}
                        <div className="p-2 border-b space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {(["BTS", "FC", "LYCEE_GENERAL", "LYCEE_PRO", "PREPA", "SUPERIEUR"] as Cycle[]).map((c) => {
                                    const active = !!cycleFacet?.includes(c);
                                    return (
                                        <Badge
                                            key={c}
                                            variant={active ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => setCycleFacet(toggleFacet<Cycle>(cycleFacet, c))}
                                        >
                                            {cycleLabel[c]}
                                        </Badge>
                                    );
                                })}
                                <Button size="sm" variant="ghost" onClick={() => setCycleFacet(null)}>
                                    Réinitialiser cycles
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {yearOrder.map((y) => {
                                    const active = !!yearFacet?.includes(y);
                                    return (
                                        <Badge
                                            key={y}
                                            variant={active ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => setYearFacet(toggleFacet<YearTag>(yearFacet, y))}
                                        >
                                            {y}
                                        </Badge>
                                    );
                                })}
                                <Button size="sm" variant="ghost" onClick={() => setYearFacet(null)}>
                                    Réinitialiser années
                                </Button>
                            </div>
                        </div>

                        {/* Liste command (recherche + groupes) */}
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Rechercher une classe…"
                                value={query}
                                onValueChange={setQuery}
                            />
                            <CommandList>
                                <CommandEmpty>Aucun résultat</CommandEmpty>
                                <ScrollArea className="max-h-80">
                                    {[...groups.entries()]
                                        .sort((a, b) => a[0].localeCompare(b[0]))
                                        .map(([cycle, items]) => {
                                            const ids = items.map((i) => i.id);
                                            const allSelected = ids.length > 0 && ids.every((id) => valueSet.has(id));
                                            const someSelected = ids.some((id) => valueSet.has(id));
                                            return (
                                                <CommandGroup key={cycle} heading={
                                                    <div className="flex items-center justify-between w-full pr-2">
                                                        <span className="font-medium">{cycleLabel[cycle]} <span className="opacity-60">({items.length})</span></span>
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={allSelected ? true : someSelected ? undefined : false}
                                                                onCheckedChange={(v) => setAll(ids, !!v)}
                                                            />
                                                            <span className="text-xs opacity-70">Tout</span>
                                                        </div>
                                                    </div>
                                                }>
                                                    {items.map((item) => {
                                                        const checked = valueSet.has(item.id);
                                                        return (
                                                            <CommandItem
                                                                key={item.id}
                                                                onSelect={() => toggleOne(item.id)}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox checked={checked} onCheckedChange={() => toggleOne(item.id)} />
                                                                    <span>{item.label}</span>
                                                                </div>
                                                                <span className="text-xs opacity-60">{item.year}</span>
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            );
                                        })}
                                </ScrollArea>
                            </CommandList>
                        </Command>
                      <div className="p-2 border-t sticky bottom-0 bg-background flex items-center justify-between">
                        <Button size="sm" variant="outline" onClick={() => onChange([])}>
                          Tout effacer
                        </Button>
                        <Button size="sm" onClick={() => setOpen(false)}>
                          Terminer
                        </Button>
                      </div>
                        </PopoverContent>
                </Popover>

                {/* Chips des éléments choisis */}
                <ScrollArea className="max-h-20">
                    <div className="flex flex-wrap gap-1">
                        {value
                            .map((id) => options.find((o) => o.id === id))
                            .filter(Boolean)
                            .map((opt) => (
                                <Badge key={opt!.id} variant="secondary" className="pr-0">
                                    {opt!.label}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 ml-1"
                                        onClick={() => toggleOne(opt!.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

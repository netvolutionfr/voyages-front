import { Link } from "react-router-dom";
import {useUpdate} from "@refinedev/core";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrencyFromCents } from "@/lib/utils";
import { Heart } from "lucide-react";
import type { IVoyage } from "./IVoyage";
import React from "react";

type Preference = {
    id: string;
    voyageId: string;
    userId: string;
    interest: "YES" | "NO";
};

function getCoverUrl(coverPhotoUrl?: string | null): string | undefined {
    if (!coverPhotoUrl) return undefined;
    if (/^https?:\/\//i.test(coverPhotoUrl)) return coverPhotoUrl;
    const base = import.meta.env.VITE_FILES_BASE || "";
    const sep = base.endsWith("/") ? "" : "/";
    return `${base}${sep}${coverPhotoUrl}`;
}

function formatDateRange(from?: Date, to?: Date) {
    if (!from || !to) return "";
    const f = new Date(from);
    const t = new Date(to);
    const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    return `${fmt.format(f)} → ${fmt.format(t)}`;
}

export function VoyageCard({v}: {
    v: IVoyage;
}) {
    const cover = getCoverUrl(v.coverPhotoUrl);
    const prixFamilles = formatCurrencyFromCents(v.familyContribution);
    const dateRange = formatDateRange(v.tripDates?.from, v.tripDates?.to);

    const [currentUserInterest, setCurrentUserInterest] = React.useState(v.interestedByCurrentUser);
    const [countUserInterests, setCountUserInterests] = React.useState(v.interestedCount || 0);

    // Préférence actuelle (si existe déjà)

    const { mutate: setPref } = useUpdate<Preference>();

    const toggleInterest = () => {
        setPref({
            resource: "trip-preferences",
            id: v.id,
            values: { interest: currentUserInterest ? "NO" : "YES" },
            mutationMode: "optimistic",
        });
        setCurrentUserInterest(!currentUserInterest);
        setCountUserInterests((count) => currentUserInterest ? count - 1 : count + 1);
    };

    return (
        <Card key={v.id} className="overflow-hidden group hover:shadow-lg transition-shadow pt-0">
            {/* Image de couverture */}
            <div className="relative h-40 w-full bg-muted">
                {cover ? (
                    <img
                        src={cover}
                        alt={`Couverture ${v.title}`}
                        className={cn(
                            "h-full w-full object-cover transition-transform",
                            "group-hover:scale-[1.02]"
                        )}
                        loading="lazy"
                        style={{ aspectRatio: "500/300", objectFit: "cover" }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        Pas d’image
                    </div>
                )}

                {v.poll && typeof v.interestedCount === "number" && (
                    <div className="absolute left-2 top-2 rounded-full bg-background/80 backdrop-blur px-2 py-1 text-xs border flex items-center gap-1">
                        <Heart
                            className={cn(
                                "h-3.5 w-3.5 cursor-pointer",
                                currentUserInterest ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            )}
                            onClick={toggleInterest}
                        />
                        <span>{countUserInterests}</span>
                    </div>
                )}
            </div>

            {/* En-tête */}
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold leading-snug line-clamp-2">
                        {v.title}
                    </h3>
                    {v.country?.name && (
                        <Badge variant="secondary" className="shrink-0">
                            {v.country.name}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{v.destination}</p>
            </CardHeader>

            {/* Contenu */}
            <CardContent className="space-y-2">
                {dateRange && (
                    <div className="text-sm">
                        <span className="text-muted-foreground">Dates:&nbsp;</span>
                        <span className="font-medium">{dateRange}</span>
                    </div>
                )}
                <div className="text-sm">
                    <span className="text-muted-foreground">Participation familles:&nbsp;</span>
                    <span className="font-medium">{prixFamilles}</span>
                </div>

                {/* Badges secteurs */}
                {Array.isArray(v.sectors) && v.sectors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {v.sectors.map((s) => (
                            <Badge key={s} variant="outline" className="text-[11px]">
                                {s === "CYCLE_BAC"
                                    ? "Cycle bac"
                                    : s === "CYCLE_POST_BAC"
                                        ? "Post-bac"
                                        : s}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Badges sections */}
                {Array.isArray(v.sections) && v.sections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {v.sections.slice(0, 3).map((s) => (
                            <Badge key={s.id} variant="secondary" className="text-[11px]">
                                {s.label}
                            </Badge>
                        ))}
                        {v.sections.length > 3 && (
                            <Badge variant="outline" className="text-[11px]">
                                +{v.sections.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Footer / Actions */}
            <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    Min: {v.minParticipants} • Max: {v.maxParticipants}
                </div>

                <Button size="sm" asChild>
                    <Link to={`/voyages/${v.id}`}>Voir</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

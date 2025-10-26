import React from "react";
import { Link, useParams } from "react-router-dom";
import { useOne, useUpdate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {Heart, Calendar as CalendarIcon, MapPin, Users, FileText, ChevronLeft, ShieldCheck, Clock} from "lucide-react";
import type { IVoyage } from "@/pages/voyages/IVoyage";
import { cn, formatCurrencyFromCents, getCoverUrl } from "@/lib/utils";

// --- Helpers ---
function toDate(d?: Date | string): Date | undefined {
    if (!d) return undefined;
    return d instanceof Date ? d : new Date(d);
}

function formatDateRange(from?: Date | string, to?: Date | string) {
    if (!from || !to) return "";
    const f = toDate(from)!;
    const t = toDate(to)!;
    const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    return `${fmt.format(f)} → ${fmt.format(t)}`;
}

function within(now: Date, from?: Date | string, to?: Date | string) {
    const F = from ? toDate(from) : undefined;
    const T = to ? toDate(to) : undefined;
    if (!F || !T) return false;
    return now >= F && now <= T;
}

export default function VoyageDetail() {
    const { id } = useParams();
    const numericId = React.useMemo(() => (id ? Number(id) : NaN), [id]);

    const { data, isLoading, isError, error, refetch } = useOne<IVoyage>({
        resource: "trips",
        id: numericId,
        queryOptions: { enabled: Number.isFinite(numericId) },
    });

    const voyage = data?.data;
    const cover = voyage?.coverPhotoUrl ? getCoverUrl(voyage.coverPhotoUrl) : undefined;

    // Interest (poll) toggle
    const [currentUserInterest, setCurrentUserInterest] = React.useState<boolean>(voyage?.interestedByCurrentUser ?? false);
    const [countUserInterests, setCountUserInterests] = React.useState<number>(voyage?.interestedCount ?? 0);

    React.useEffect(() => {
        // sync when fetched/refetched
        if (voyage) {
            setCurrentUserInterest(voyage.interestedByCurrentUser);
            setCountUserInterests(voyage.interestedCount ?? 0);
        }
    }, [voyage]);

    const { mutate: setPref, isLoading: isTogglingPref } = useUpdate<{ id: string; voyageId: string; userId: string; interest: "YES" | "NO"; }>();

    const toggleInterest = () => {
        if (!voyage?.id) return;
        const next = !currentUserInterest;
        // optimistic
        setCurrentUserInterest(next);
        setCountUserInterests((c) => (next ? c + 1 : Math.max(0, c - 1)));

        setPref({
            resource: "trip-preferences",
            id: voyage.id,
            values: { interest: next ? "YES" : "NO" },
            mutationMode: "pessimistic", // server is source of truth; we already set local optimistic state above
        }, {
            onError: () => {
                // rollback on error
                setCurrentUserInterest(!next);
                setCountUserInterests((c) => (!next ? c + 1 : Math.max(0, c - 1)));
            },
            onSuccess: () => {
                // Optionally refetch to sync counts
                refetch();
            }
        });
    };

    // Registration flow
    // type RegistrationPayload = { voyageId: number };
    // type RegistrationResponse = { id: number; voyageId: number };
    // const { mutate: createRegistration, isLoading: isSigningUp } = useCreate<RegistrationResponse, RegistrationPayload>();
    const [registered] = React.useState<boolean>(false);
    const [signupError, setSignupError] = React.useState<string | null>(null);

    const canRegister = React.useMemo(() => {
        if (!voyage) return false;
        const now = new Date();
        return within(now, voyage.registrationDates?.from, voyage.registrationDates?.to);
    }, [voyage]);

    const handleSignup = () => {
        if (!voyage?.id) return;
        setSignupError(null);
        // createRegistration({
        //     resource: "registrations", // ⬅️ adaptez ce nom de ressource à votre API si besoin
        //     values: { voyageId: voyage.id },
        // }, {
        //     onSuccess: () => {
        //         setRegistered(true);
        //     },
        //     onError: (e) => {
        //         const msg = e instanceof Error ? e.message : "Inscription impossible";
        //         setSignupError(msg);
        //     }
        // });
    };

    if (!Number.isFinite(numericId)) {
        return (
            <div className="container mx-auto max-w-5xl p-4">
                <Alert variant="destructive">
                    <AlertTitle>Identifiant invalide</AlertTitle>
                    <AlertDescription>Impossible de charger ce voyage : l'URL ne contient pas d'identifiant valide.</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button asChild variant="secondary"><Link to="/voyages"><ChevronLeft className="h-4 w-4 mr-1"/>Retour aux voyages</Link></Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-5xl p-4 space-y-4">
                <div className="aspect-[5/2] w-full overflow-hidden rounded-2xl bg-muted" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3">
                        <Skeleton className="h-7 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !voyage) {
        return (
            <div className="container mx-auto max-w-5xl p-4">
                <Alert variant="destructive">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{(error as unknown as Error)?.message ?? "Impossible de charger le voyage."}</AlertDescription>
                </Alert>
                <div className="mt-4 flex items-center gap-2">
                    <Button onClick={() => refetch()} variant="secondary">Réessayer</Button>
                    <Button asChild variant="outline"><Link to="/voyages"><ChevronLeft className="h-4 w-4 mr-1"/>Retour</Link></Button>
                </div>
            </div>
        );
    }

    const dateRange = formatDateRange(voyage.tripDates?.from, voyage.tripDates?.to);
    const regRange = formatDateRange(voyage.registrationDates?.from, voyage.registrationDates?.to);

    return (
        <div className="container mx-auto max-w-5xl p-4">
            <Button asChild variant="ghost" className="-ml-2 mb-3">
                <Link to="/voyages"><ChevronLeft className="h-4 w-4 mr-1"/>Retour aux voyages</Link>
            </Button>

            {/* Cover */}
            <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[5/2]">
                {cover ? (
                    <img src={cover} alt={`Couverture ${voyage.title}`} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">Pas d'image</div>
                )}

                {voyage.poll && typeof voyage.interestedCount === "number" && (
                    <div className="absolute left-3 top-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-xs border flex items-center gap-1">
                        <Heart
                            className={cn(
                                "h-4 w-4 cursor-pointer",
                                currentUserInterest ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            )}
                            onClick={toggleInterest}
                        />
                        <span>{countUserInterests}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Main */}
                <div className="md:col-span-2 space-y-4">
                    {/* Zone synthèse au-dessus des formalités */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium">{voyage.title}</h2>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <div className="text-muted-foreground">Destination</div>
                                <div className="font-medium text-base">{voyage.destination}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4"/>
                                <span>Pays :</span>
                                <span className="font-medium">{voyage.country?.name || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4"/>
                                <span>Période :</span>
                                <span className="font-medium">{dateRange || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4"/>
                                <span>Participants :</span>
                                <span className="font-medium text-foreground">Min {voyage.minParticipants} • Max {voyage.maxParticipants}</span>
                            </div>
                            <Separator />
                            <div className="prose prose-sm max-w-none">
                                {voyage.description ? (
                                    <p>{voyage.description}</p>
                                ) : (
                                    <p className="text-muted-foreground">Aucune description.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents requis */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Formalités & documents requis</h2>
                                <div className="text-sm text-muted-foreground">{voyage.formalities?.length ?? 0} élément(s)</div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Array.isArray(voyage.formalities) && voyage.formalities.length > 0 ? (
                                <ul className="space-y-3">
                                    {voyage.formalities.map((f) => (
                                        <li key={f.id} className="rounded-lg border p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-4 w-4 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium leading-snug">
                                                            {f.documentType?.label || f.documentType?.abr || "Document"}
                                                        </div>
                                                        {f.documentType?.description && (
                                                            <p className="text-sm text-muted-foreground">{f.documentType.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 shrink-0">
                                                    <Badge variant={f.required ? "default" : "secondary"}>
                                                        {f.required ? "Obligatoire" : "Optionnel"}
                                                    </Badge>
                                                    <Badge variant="outline">{f.type}</Badge>
                                                    {typeof f.daysBeforeTrip === "number" && (
                                                        <Badge variant="outline" className="inline-flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" /> J-{f.daysBeforeTrip}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-3">
                                                {f.acceptedMime?.length ? (
                                                    <span>Types acceptés : {f.acceptedMime.join(", ")}</span>
                                                ) : null}
                                                {typeof f.maxSizeMb === "number" ? (
                                                    <span>Taille max : {f.maxSizeMb} Mo</span>
                                                ) : null}
                                                {typeof f.retentionDays === "number" ? (
                                                    <span>Conservation : {f.retentionDays} j</span>
                                                ) : null}
                                                {f.storeScan ? (
                                                    <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5"/>Scan conservé</span>
                                                ) : null}
                                                {f.manuallyAdded ? (
                                                    <span>Ajout manuel</span>
                                                ) : null}
                                            </div>

                                            {f.notes && <p className="mt-2 text-sm">{f.notes}</p>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Aucune formalité n'est renseignée.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <h3 className="font-medium">Informations pratiques</h3>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <div className="text-muted-foreground">Participation familles</div>
                                <div className="font-medium">{formatCurrencyFromCents(voyage.familyContribution)}</div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-muted-foreground">Inscriptions</div>
                                <div className="font-medium">{regRange || "—"}</div>
                                {!canRegister && (
                                    <p className="text-xs text-muted-foreground mt-1">Les inscriptions ne sont pas ouvertes actuellement.</p>
                                )}
                            </div>
                            <Separator />
                            <div>
                                <div className="text-muted-foreground mb-1">Sections concernées</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {voyage.sections?.length ? voyage.sections.map((s) => (
                                        <Badge key={s.id} variant="secondary" className="text-[11px]">{s.label}</Badge>
                                    )) : <span className="text-muted-foreground">—</span>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleSignup} disabled={!canRegister || registered /*|| isSigningUp */}>
                                {registered ? "Inscrit ✅" : /*isSigningUp ? "Inscription..." : */ "S'inscrire"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Encadrants */}
                    <Card>
                        <CardHeader>
                            <h3 className="font-medium">Encadrants</h3>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {voyage.chaperones?.length ? (
                                <ul className="space-y-2">
                                    {voyage.chaperones.map((c) => (
                                        <li key={c.publicId} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarFallback>{(c?.firstName?.[0]?.toUpperCase() ?? '') + (c?.lastName?.[0]?.toUpperCase() ?? '')}
                                            </AvatarFallback></Avatar>
                                            <span>{c.firstName} {c.lastName}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">Non communiqué.</p>
                            )}
                        </CardContent>
                    </Card>

                    {signupError && (
                        <Alert variant="destructive">
                            <AlertTitle>Inscription</AlertTitle>
                            <AlertDescription>{signupError}</AlertDescription>
                        </Alert>
                    )}

                    {isTogglingPref && (
                        <Alert>
                            <AlertTitle>Mise à jour du sondage…</AlertTitle>
                            <AlertDescription>Nous enregistrons votre préférence.</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
}

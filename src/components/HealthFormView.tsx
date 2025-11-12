import { CheckCircle2, AlertCircle, Phone, AlertTriangle, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {HealthFormAdminDTO} from "@/providers/dataProvider.ts";

type HealthFormContent = {
    allergies: {
        drug: string[] | null;
        food: string[] | null;
        other: string[] | null;
        notes: string | null;
    };
    treatments: {
        daily: Array<{ name: string; dose?: string }> | null;
        emergency: Array<{ name: string }> | null;
        hasPAI: boolean;
        paiDetails: string | null;
    };
    emergencyContacts: {
        primary: {
            name: string;
            relation: string;
            phone: string;
            altPhone: string | null;
        };
        secondary: {
            name: string;
            relation: string;
            phone: string;
        } | null;
        backup: {
            name: string;
            relation: string;
            phone: string;
        } | null;
    };
    consentHospitalization: boolean;
    consentTransport: boolean;
    validUntil: string | null;
};


function HealthFormView({ data }: { data?: HealthFormAdminDTO }) {
    if (!data?.exists || !data?.content) {
        return <div className="text-sm text-muted-foreground">Aucune fiche sanitaire transmise.</div>;
    }

    // Si c'est du HTML, afficher comme avant
    if (data.content.trim().startsWith("<")) {
        return (
            <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </div>
        );
    }

    // Sinon, parser le JSON
    let healthForm: HealthFormContent | null = null;
    try {
        healthForm = JSON.parse(data.content);
    } catch {
        // Si le parsing échoue, afficher en texte brut
        return (
            <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{data.content}</pre>
            </div>
        );
    }

    if (!healthForm) {
        return <div className="text-sm text-muted-foreground">Format de fiche invalide.</div>;
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec validité */}
            {healthForm.validUntil && (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Valide jusqu'au {new Date(healthForm.validUntil).toLocaleDateString("fr-FR")}
                    </Badge>
                </div>
            )}

            {/* Allergies */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Allergies</h3>
                </div>
                <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
                    {healthForm.allergies.drug?.length ? (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="text-muted-foreground min-w-[140px] font-medium">Médicamenteuses :</span>
                            <span className="flex-1">{healthForm.allergies.drug.join(", ")}</span>
                        </div>
                    ) : null}
                    {healthForm.allergies.food?.length ? (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="text-muted-foreground min-w-[140px] font-medium">Alimentaires :</span>
                            <span className="flex-1">{healthForm.allergies.food.join(", ")}</span>
                        </div>
                    ) : null}
                    {healthForm.allergies.other?.length ? (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="text-muted-foreground min-w-[140px] font-medium">Autres :</span>
                            <span className="flex-1">{healthForm.allergies.other.join(", ")}</span>
                        </div>
                    ) : null}
                    {healthForm.allergies.notes && (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 pt-2 border-t">
                            <span className="text-muted-foreground min-w-[140px] font-medium">Notes :</span>
                            <span className="flex-1">{healthForm.allergies.notes}</span>
                        </div>
                    )}
                    {!healthForm.allergies.drug?.length &&
                        !healthForm.allergies.food?.length &&
                        !healthForm.allergies.other?.length &&
                        !healthForm.allergies.notes && (
                            <span className="text-muted-foreground">Aucune allergie déclarée</span>
                        )}
                </div>
            </div>

            {/* Traitements */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Traitements</h3>
                </div>
                <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
                    {healthForm.treatments.daily?.length ? (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="text-muted-foreground min-w-[140px] font-medium">Quotidiens :</span>
                            <span className="flex-1">
                                {healthForm.treatments.daily.map(t =>
                                    t.dose ? `${t.name} (${t.dose})` : t.name
                                ).join(" ; ")}
                            </span>
                        </div>
                    ) : null}
                    {healthForm.treatments.emergency?.length ? (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="text-muted-foreground min-w-[140px] font-medium">Urgence :</span>
                            <span className="flex-1">
                                {healthForm.treatments.emergency.map(t => t.name).join(" ; ")}
                            </span>
                        </div>
                    ) : null}
                    {healthForm.treatments.hasPAI && (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">PAI existant</Badge>
                                {healthForm.treatments.paiDetails && (
                                    <span className="text-xs text-muted-foreground">{healthForm.treatments.paiDetails}</span>
                                )}
                            </div>
                        </div>
                    )}
                    {!healthForm.treatments.daily?.length &&
                        !healthForm.treatments.emergency?.length &&
                        !healthForm.treatments.hasPAI && (
                            <span className="text-muted-foreground">Aucun traitement déclaré</span>
                        )}
                </div>
            </div>

            {/* Contacts d'urgence */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Contacts d'urgence</h3>
                </div>
                <div className="space-y-3">
                    {/* Contact principal */}
                    <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
                        <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">
                            Contact principal
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                <span className="text-muted-foreground min-w-[100px] font-medium">Nom :</span>
                                <span className="flex-1">{healthForm.emergencyContacts.primary.name}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                <span className="text-muted-foreground min-w-[100px] font-medium">Lien :</span>
                                <span className="flex-1">{healthForm.emergencyContacts.primary.relation}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                <span className="text-muted-foreground min-w-[100px] font-medium">Téléphone :</span>
                                <span className="flex-1 font-mono">{healthForm.emergencyContacts.primary.phone}</span>
                            </div>
                            {healthForm.emergencyContacts.primary.altPhone && (
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Tél. alt. :</span>
                                    <span className="flex-1 font-mono">{healthForm.emergencyContacts.primary.altPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact secondaire */}
                    {healthForm.emergencyContacts.secondary && (
                        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
                            <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                Contact secondaire
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Nom :</span>
                                    <span className="flex-1">{healthForm.emergencyContacts.secondary.name}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Lien :</span>
                                    <span className="flex-1">{healthForm.emergencyContacts.secondary.relation}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Téléphone :</span>
                                    <span className="flex-1 font-mono">{healthForm.emergencyContacts.secondary.phone}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact de secours */}
                    {healthForm.emergencyContacts.backup && (
                        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
                            <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                Contact de secours
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Nom :</span>
                                    <span className="flex-1">{healthForm.emergencyContacts.backup.name}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Lien :</span>
                                    <span className="flex-1">{healthForm.emergencyContacts.backup.relation}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                    <span className="text-muted-foreground min-w-[100px] font-medium">Téléphone :</span>
                                    <span className="flex-1 font-mono">{healthForm.emergencyContacts.backup.phone}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Autorisations */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold">Autorisations</h3>
                <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        {healthForm.consentHospitalization ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <span>Soins et hospitalisation autorisés</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                <span>Soins et hospitalisation non autorisés</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        {healthForm.consentTransport ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <span>Transport autorisé</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                <span>Transport non autorisé</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HealthFormView;
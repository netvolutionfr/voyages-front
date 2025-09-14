// Remplit le form à partir d’un IVoyage (édition)
import type {IVoyage} from "@/pages/voyages/IVoyage.ts";
import type {VoyageFormData} from "@/schemas/voyageSchema.ts";
import type {VoyageUpsertRequest} from "@/pages/voyages/dto/VoyageUpsertRequest.tsx";
import type {VoyageDTO} from "@/pages/voyages/dto/VoyageDTO.tsx";

export function voyageToFormDefaults(v: IVoyage): Partial<VoyageFormData> {
    return {
        nom: v.nom ?? "",
        description: v.description ?? null,
        destination: v.destination ?? "",
        // paysId doit pouvoir être undefined en création
        paysId: v.pays?.id ?? undefined,

        // Centimes API → € dans le form
        prixTotal: v.prixTotal != null ? v.prixTotal / 100 : undefined,
        participationDesFamilles: v.participationDesFamilles != null ? v.participationDesFamilles / 100 : undefined,

        coverPhotoUrl: v.coverPhotoUrl ?? null,

        datesVoyage: { from: new Date(v.datesVoyage.from), to: new Date(v.datesVoyage.to) },
        nombreMinParticipants: v.nombreMinParticipants,
        nombreMaxParticipants: v.nombreMaxParticipants,

        datesInscription: v.datesInscription
            ? { from: new Date(v.datesInscription.from), to: new Date(v.datesInscription.to) }
            : undefined,

        // En édition tu peux pré-remplir via listes → ids si tu les as
        organisateurIds: v.organisateurs?.map(o => o.id) ?? [],
        sectionIds: v.sections?.map(s => s.id) ?? [],
        secteurs: v.secteurs ?? [],
    };
}

// Transforme les valeurs du form en payload API
export function formToUpsertPayload(values: VoyageFormData, id?: number | string | null): VoyageUpsertRequest {
    return {
        id: id ? Number(id) : undefined,
        nom: values.nom,
        description: values.description ?? null,
        destination: values.destination || "",

        // convertir €/float → centimes pour l'API
        prixTotalCents: values.prixTotal != null ? Math.round(values.prixTotal * 100) : undefined,
        participationDesFamilles: values.participationDesFamilles != null ? Math.round(values.participationDesFamilles * 100) : undefined,
        coverPhotoUrl: values.coverPhotoUrl ?? null,

        paysId: Number(values.paysId),

        datesVoyage: {
            from: values.datesVoyage.from.toISOString().slice(0, 10),
            to: values.datesVoyage.to.toISOString().slice(0, 10),
        },

        nombreMinParticipants: values.nombreMinParticipants,
        nombreMaxParticipants: values.nombreMaxParticipants,

        datesInscription: values.datesInscription
            ? {
                from: values.datesInscription.from.toISOString().slice(0, 10),
                to: values.datesInscription.to.toISOString().slice(0, 10),
            }
            : null,

        organisateurIds: values.organisateurIds ?? [],
        sectionIds: values.sectionIds ?? [],
        secteurs: values.secteurs as Array<"CYCLE_BAC" | "CYCLE_POST_BAC">,
    } as VoyageUpsertRequest;
}

const toDate = (s?: string | null) => (s ? new Date(s) : undefined);

export function dtoToForm(v: VoyageDTO): VoyageFormData {
    return {
        nom: v.nom ?? "",
        description: v.description ?? null,
        destination: v.destination ?? "",
        paysId: v.paysId ?? undefined,

        // Centimes API → € dans le form
        prixTotal: v.prixTotal != null ? v.prixTotal / 100 : undefined,
        participationDesFamilles: v.participationDesFamilles != null ? v.participationDesFamilles / 100 : undefined,

        coverPhotoUrl: v.coverPhotoUrl ?? null,
        organisateurIds: v.organisateurs?.map(o => o.id) ?? [],
        sectionIds: v.sections?.map(s => s.id) ?? [],
        secteurs: v.secteurs ?? [],

        nombreMinParticipants: v.nombreMinParticipants ?? 1,
        nombreMaxParticipants: v.nombreMaxParticipants ?? 1,
        // Dates (string ISO) → Date
        // Par défaut aujourd’hui si pb de conversion (pour éviter erreurs dans le form)
        datesVoyage: {
            from: toDate(v.datesVoyage?.from) ?? new Date(),
            to:   toDate(v.datesVoyage?.to)   ?? new Date(),
        },
        datesInscription: v.datesInscription
            ? {
                from: toDate(v.datesInscription.from) ?? new Date(),
                to:   toDate(v.datesInscription.to)   ?? new Date(),
            }
            : null,
    };
}

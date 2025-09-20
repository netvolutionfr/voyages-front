import type {VoyageFormData} from "@/schemas/voyageSchema.ts";
import type {VoyageDTO} from "@/pages/voyages/dto/VoyageDTO.tsx";

export function dtoToForm(v: VoyageDTO): VoyageFormData {
    return {
        nom: v.nom ?? "",
        description: v.description ?? null,
        destination: v.destination ?? "",
        paysId: v.pays.id ?? undefined,

        // Centimes API → € dans le form
        prixTotal: v.prixTotal != null ? v.prixTotal / 100 : undefined,
        participationDesFamilles: v.participationDesFamilles != null ? v.participationDesFamilles / 100 : undefined,

        coverPhotoUrl: v.coverPhotoUrl ?? null,
        organisateurIds: v.organisateurs?.map(o => o.publicId) ?? [],
        sectionIds: v.sections?.map(s => s.publicId) ?? [],
        secteurs: v.secteurs ?? [],

        nombreMinParticipants: v.nombreMinParticipants ?? 1,
        nombreMaxParticipants: v.nombreMaxParticipants ?? 1,
        // Dates (string ISO) → Date
        // Par défaut aujourd’hui si pb de conversion (pour éviter erreurs dans le form)
        datesVoyage: {
            from: v.datesVoyage?.from ?? new Date().toISOString(),
            to:   v.datesVoyage?.to   ?? new Date().toISOString(),
        },
        datesInscription: v.datesInscription
            ? {
                from: v.datesInscription.from ?? new Date().toISOString(),
                to:   v.datesInscription.to   ?? new Date().toISOString(),
            }
            : null,
        sondage: v.sondage ?? false,
    };
}

import type {VoyageFormData} from "@/schemas/voyageSchema.ts";
import type {VoyageDTO} from "@/pages/voyages/dto/VoyageDTO.tsx";

export function dtoToForm(v: VoyageDTO): VoyageFormData {
    return {
        nom: v.title ?? "",
        description: v.description ?? null,
        destination: v.destination ?? "",
        paysId: v.country.id ?? undefined,

        // Centimes API → € dans le form
        prixTotal: v.totalPrice != null ? v.totalPrice / 100 : undefined,
        participationDesFamilles: v.familyContribution != null ? v.familyContribution / 100 : undefined,

        coverPhotoUrl: v.coverPhotoUrl ?? null,
        organisateurIds: v.chaperones?.map(o => o.publicId) ?? [],
        sectionIds: v.sections?.map(s => s.publicId) ?? [],
        secteurs: v.sectors ?? [],

        nombreMinParticipants: v.minParticipants ?? 1,
        nombreMaxParticipants: v.maxParticipants ?? 1,
        // Dates (string ISO) → Date
        // Par défaut aujourd’hui si pb de conversion (pour éviter erreurs dans le form)
        datesVoyage: {
            from: v.tripDates?.from ?? new Date().toISOString(),
            to:   v.tripDates?.to   ?? new Date().toISOString(),
        },
        datesInscription: v.registrationPeriod
            ? {
                from: v.registrationPeriod.from ?? new Date().toISOString(),
                to:   v.registrationPeriod.to   ?? new Date().toISOString(),
            }
            : null,
        sondage: v.poll ?? false,
    };
}

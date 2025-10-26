import type {VoyageFormData} from "@/schemas/voyageSchema.ts";
import type {VoyageDTO} from "@/pages/voyages/dto/VoyageDTO.tsx";

export function dtoToForm(v: VoyageDTO): VoyageFormData {
    return {
        title: v.title ?? "",
        description: v.description ?? null,
        destination: v.destination ?? "",
        countryId: v.country.id ?? undefined,

        // Centimes API → € dans le form
        familyContribution: v.familyContribution != null ? v.familyContribution / 100 : undefined,

        coverPhotoUrl: v.coverPhotoUrl ?? null,
        chaperoneIds: v.chaperones?.map(o => o.publicId) ?? [],
        sectionIds: v.sections?.map(s => s.publicId) ?? [],

        minParticipants: v.minParticipants ?? 1,
        maxParticipants: v.maxParticipants ?? 1,
        // Dates (string ISO) → Date
        // Par défaut aujourd’hui si pb de conversion (pour éviter erreurs dans le form)
        tripDates: {
            from: v.tripDates?.from ?? new Date().toISOString(),
            to:   v.tripDates?.to   ?? new Date().toISOString(),
        },
        registrationDates: v.registrationDates
            ? {
                from: v.registrationDates.from ?? new Date().toISOString(),
                to:   v.registrationDates.to   ?? new Date().toISOString(),
            }
            : null,
        poll: v.poll ?? false,
    };
}

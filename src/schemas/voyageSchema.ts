import { z } from "zod";
import { SAFE_ID_REGEX } from "@/schemas/common";

// accepte Date|string en entrée, sort une string ISO réellement validée
// (date seule YYYY-MM-DD ou datetime ISO 8601 — les deux formes circulent dans le form)
const dateTimeISO = z.preprocess(
    (val) => (val instanceof Date ? val.toISOString().split("T")[0] : val),
    z.union([z.iso.date(), z.iso.datetime()]),
);

const rangeISO = z.object({
    from: dateTimeISO,
    to:   dateTimeISO,
});

export const VoyageSchema = z.object({
    title: z.string().trim().min(1, "Le titre est requis").max(150),
    destination: z.string().trim().min(1, "La destination est requise").max(150),
    countryId: z.number().int().positive(),
    tripDates: rangeISO,
    registrationDates: rangeISO.nullable().optional(),
    minParticipants: z.number().int().min(1).max(1000),
    maxParticipants: z.number().int().min(1).max(1000),
    description: z.string().trim().max(5000).nullable().optional(),
    familyContribution: z.number().min(0).max(100_000).nullable().optional(),
    // Clé de stockage interne uniquement (presign MinIO) : pas d'URL externe,
    // pas de traversée de chemin.
    coverPhotoUrl: z.string().trim().max(512)
        .regex(/^(?!https?:\/\/)(?!.*\.\.)[\w./-]+$/i, "Clé de fichier interne attendue (pas d'URL externe)")
        .nullable().optional(),
    chaperoneIds: z.array(z.string().regex(SAFE_ID_REGEX, "Identifiant d'organisateur invalide")).max(50).default([]),
    sectionIds: z.array(z.string().regex(SAFE_ID_REGEX, "Identifiant de section invalide")).max(100).default([]),
    poll: z.boolean().default(false),
})
    .superRefine((v, ctx) => {
        // comparaisons sur strings ISO → convertis localement en Date pour la validation
        const toD = (s?: string) => (s ? new Date(s) : undefined);
        const i = v.registrationDates;
        const voyFrom = toD(v.tripDates.from);
        if (i?.to && voyFrom && new Date(i.to) >= voyFrom) {
            ctx.addIssue({ code: "custom", path: ["registrationDates"], message: "Les inscriptions doivent se terminer avant le début du voyage." });
        }
        if (v.minParticipants > v.maxParticipants) {
            ctx.addIssue({ code: "custom", path: ["maxParticipants"], message: "Le maximum doit être ≥ au minimum." });
        }
    });

export type VoyageFormData = z.infer<typeof VoyageSchema>;

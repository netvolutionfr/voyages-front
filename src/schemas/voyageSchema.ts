import { z } from "zod";

// accepte Date|string en entrée, sort une string ISO, valide ISO 8601
const dateTimeISO = z.preprocess(
    (val) => (val instanceof Date ? val.toISOString() : val),
    z.string()
);

const rangeISO = z.object({
    from: dateTimeISO,
    to:   dateTimeISO,
});

export const VoyageSchema = z.object({
    nom: z.string().min(1),
    destination: z.string().min(1),
    paysId: z.number().int().positive(),
    datesVoyage: rangeISO,    datesInscription: rangeISO.nullable().optional(),
    nombreMinParticipants: z.number().int().min(1),
    nombreMaxParticipants: z.number().int().min(1),
    description: z.string().nullable().optional(),
    prixTotal: z.number().min(0).nullable().optional(),
    participationDesFamilles: z.number().min(0).nullable().optional(),
    coverPhotoUrl: z.string().nullable().optional(),
    organisateurIds: z.array(z.string().min(1)).default([]),
    sectionIds: z.array(z.string()).default([]),
    secteurs: z.array(z.enum(["CYCLE_BAC","CYCLE_POST_BAC"])).default([]),
    sondage: z.boolean().default(false),
})
    .superRefine((v, ctx) => {
        // comparaisons sur strings ISO → convertis localement en Date pour la validation
        const toD = (s?: string) => (s ? new Date(s) : undefined);
        const i = v.datesInscription;
        const voyFrom = toD(v.datesVoyage.from);
        if (i?.to && voyFrom && new Date(i.to) >= voyFrom) {
            ctx.addIssue({ code: "custom", path: ["datesInscription"], message: "Les inscriptions doivent se terminer avant le début du voyage." });
        }
        if (v.nombreMinParticipants > v.nombreMaxParticipants) {
            ctx.addIssue({ code: "custom", path: ["nombreMaxParticipants"], message: "Le maximum doit être ≥ au minimum." });
        }
    });

export type VoyageFormData = z.infer<typeof VoyageSchema>;

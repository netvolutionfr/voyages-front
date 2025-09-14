import { z } from "zod";

export const VoyageSchema = z.object({
    nom: z.string().min(1, "Le nom du voyage est requis"),
    description: z.string().optional().nullable(),
    destination: z.string().min(1, "La destination est requise"),

    // prix affichés en € dans le form
    prixTotal: z.number().min(0, "Le prix total doit être ≥ 0").optional().nullable(),
    participationDesFamilles: z.number().min(0, "La participation des familles doit être ≥ 0").optional().nullable(),

    coverPhotoUrl: z.string().optional().nullable(),

    paysId: z.number().int().positive("Choisissez un pays"),

    datesVoyage: z.object({
        from: z.date(),
        to: z.date(),
    }),

    nombreMinParticipants: z.number().int().min(1, "Min ≥ 1"),
    nombreMaxParticipants: z.number().int().min(1, "Max ≥ 1"),

    datesInscription: z.object({
        from: z.date(),
        to: z.date(),
    }).optional().nullable(),

    organisateurIds: z.array(z.number().int().positive()).default([]),
    sectionIds: z.array(z.number().int().positive()).default([]),

    secteurs: z.array(z.enum(["CYCLE_BAC","CYCLE_POST_BAC"])).default([]),
})
    .superRefine((val, ctx) => {
        // Dates cohérentes
        const insc = val.datesInscription;
        const voy  = val.datesVoyage;
        if (insc?.to && voy?.from && insc.to >= voy.from) {
            ctx.addIssue({
                code: "custom",
                path: ["datesInscription"],
                message: "Les inscriptions doivent se terminer avant le début du voyage.",
            });
        }
        if (val.nombreMinParticipants > val.nombreMaxParticipants) {
            ctx.addIssue({
                code: "custom",
                path: ["nombreMaxParticipants"],
                message: "Le maximum doit être ≥ au minimum.",
            });
        }
    });

export type VoyageFormData = z.infer<typeof VoyageSchema>;

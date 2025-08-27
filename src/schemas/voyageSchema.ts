import {z} from "zod";

export const VoyageSchema = z.object ({
    nom: z.string().min(1, "Le nom du voyage est requis"),
    description: z.string().optional().nullable(),
    destination: z.string().min(1, "La destination est requise"),
    paysId: z.number().optional().nullable(),
    datesVoyage: z.object({
        from: z.date(),
        to: z.date(),
    }),
    nombreMinParticipants: z.number().int().min(1, "Le nombre minimum de participants doit être au moins 1"),
    nombreMaxParticipants: z.number().int().min(1, "Le nombre maximum de participants doit être au moins 1"),
    datesInscription: z.object({
        from: z.date(),
        to: z.date(),
    }),
}).superRefine((val, ctx) => {
    if (val.datesInscription.to >= val.datesVoyage.from) {
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
            message: "Le nombre maximum de participants doit être supérieur ou égal au nombre minimum.",
        });
    }
});


export type VoyageFormData = z.infer<typeof VoyageSchema>;

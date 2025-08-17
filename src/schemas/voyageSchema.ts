import {z} from "zod";

export const VoyageSchema = z.object ({
    nom: z.string().min(1, "Le nom du voyage est requis"),
    description: z.string().optional().nullable(),
    destination: z.string().min(1, "La destination est requise"),
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
});

export type VoyageFormData = z.infer<typeof VoyageSchema>;

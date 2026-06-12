import {z} from "zod";
import {optionalPhone, requiredShortText} from "@/schemas/common";

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// Date de naissance requise au format jj/mm/aaaa, validée calendairement
const BirthDateSchema = z
    .string()
    .min(1, "La date de naissance est requise")
    .regex(dateRegex, "Format jj/mm/aaaa invalide")
    .refine((val) => {
        const [day, month, year] = val.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }, "Date de naissance non valide");

export const ParticipantSchema = z.object({
    gender: z.enum(["M", "F", "N"], {
        error: "Le genre doit être précisé",
    }),
    lastName: requiredShortText("Le nom est requis"),
    firstName: requiredShortText("Le prénom est requis"),
    birthDate: BirthDateSchema,
    email: z.email("L'email doit être valide").optional().nullable(),
    telephone: optionalPhone,
    sectionId: z.number().int().positive().optional().nullable(),
})

export type ParticipantFormData = z.infer<typeof ParticipantSchema>;

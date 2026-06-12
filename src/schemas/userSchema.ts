import { z } from "zod";
import { SAFE_ID_REGEX, optionalPhone, requiredShortText } from "@/schemas/common";

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

const BirthDateSchema = z
    .union([
        z
            .string()
            .regex(dateRegex, "Format jj/mm/aaaa invalide")
            .refine((val) => {
                if (!val) return true; // chaîne vide acceptée
                const [day, month, year] = val.split("/").map(Number);
                const date = new Date(year, month - 1, day);
                return (
                    date.getFullYear() === year &&
                    date.getMonth() === month - 1 &&
                    date.getDate() === day
                );
            }, "Date de naissance non valide"),
        z.literal(""), // autorise le champ vide
    ])
    .nullable()
    .optional();

export const UserSchema = z.object({
    firstName: requiredShortText("Le prénom est requis"),
    lastName: requiredShortText("Le nom est requis"),
    email: z.email("Email invalide"),
    gender: z.enum(["M", "F", "N"]),
    birthDate: BirthDateSchema,
    telephone: optionalPhone,
    sectionPublicId: z.string().regex(SAFE_ID_REGEX, "Section invalide").nullable().optional(),
    role: z.enum(["STUDENT", "TEACHER", "PARENT", "ADMIN"]),
});

export type UserFormData = z.infer<typeof UserSchema>;

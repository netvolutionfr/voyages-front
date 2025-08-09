import { z } from 'zod'
import {SECTIONS} from "@/config/sections";

const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/

export const ficheRenseignementSchema = z.object({
    sexe: z.enum(["M", "F", "N"]),
    telephone: z.string().min(10, 'Téléphone requis'),
    dateNaissance: z.string()
        .regex(dateRegex, 'Format jj/mm/aaaa invalide')
        .refine(val => {
            const [day, month, year] = val.split('/').map(Number)
            const date = new Date(year, month - 1, day)
            return date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
        }, 'Date de naissance non valide'),
    section: z.enum(SECTIONS),
})

export type ficheRenseignementFormData = z.infer<typeof ficheRenseignementSchema>

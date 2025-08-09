import { z } from 'zod'

export const ficheParentsSchema = z.object({
    parent1Nom: z.string().optional().nullable(),
    parent1Prenom: z.string().optional().nullable(),
    parent1Email: z.email('Email du parent 1 invalide').optional().nullable(),
    parent1Telephone: z.string().optional(),
    parent2Nom: z.string().optional().nullable(),
    parent2Prenom: z.string().optional().nullable(),
    parent2Email: z.email('Email du parent 2 invalide').optional().nullable(),
    parent2Telephone: z.string().optional(),
})

export type ficheParentsFormData = z.infer<typeof ficheParentsSchema>

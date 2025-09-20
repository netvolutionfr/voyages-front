import { z } from 'zod'

export const ficheParentsSchema = z.object({
    parent1LastName: z.string().optional().nullable(),
    parent1FirstName: z.string().optional().nullable(),
    parent1Email: z.email('Email du parent 1 invalide').optional().nullable(),
    parent1Telephone: z.string().optional(),
    parent2LastName: z.string().optional().nullable(),
    parent2FirstName: z.string().optional().nullable(),
    parent2Email: z.email('Email du parent 2 invalide').optional().nullable(),
    parent2Telephone: z.string().optional(),
})

export type ficheParentsFormData = z.infer<typeof ficheParentsSchema>

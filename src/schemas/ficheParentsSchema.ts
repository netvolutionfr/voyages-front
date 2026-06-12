import { z } from 'zod'
import { optionalPhone, optionalShortText } from '@/schemas/common'

export const ficheParentsSchema = z.object({
    parent1LastName: optionalShortText(),
    parent1FirstName: optionalShortText(),
    parent1Email: z.email('Email du parent 1 invalide').optional().nullable(),
    parent1Telephone: optionalPhone,
    parent2LastName: optionalShortText(),
    parent2FirstName: optionalShortText(),
    parent2Email: z.email('Email du parent 2 invalide').optional().nullable(),
    parent2Telephone: optionalPhone,
})

export type ficheParentsFormData = z.infer<typeof ficheParentsSchema>

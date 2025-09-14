// Remplit le form à partir d’un IVoyage (édition)
export function voyageToFormDefaults(v: IVoyage): Partial<VoyageFormData> {
    return {
        nom: v.nom ?? "",
        description: v.description ?? "",
        destination: v.destination ?? "",
        paysId: v.pays?.id as number,

        // Centimes API → € dans le form
        prixTotal: v.prixTotalCents != null ? v.prixTotalCents / 100 : undefined,
        participationDesFamilles: v.participationDesFamilles != null ? v.participationDesFamilles / 100 : undefined,

        coverPhotoUrl: v.coverPhotoUrl ?? undefined,

        datesVoyage: { from: new Date(v.datesVoyage.from), to: new Date(v.datesVoyage.to) },
        nombreMinParticipants: v.nombreMinParticipants,
        nombreMaxParticipants: v.nombreMaxParticipants,

        datesInscription: v.datesInscription
            ? { from: new Date(v.datesInscription.from), to: new Date(v.datesInscription.to) }
            : undefined,

        // En édition tu peux pré-remplir via listes → ids si tu les as
        organisateurIds: v.organisateurs?.map(o => o.id) ?? [],
        sectionIds: v.sections?.map(s => s.id) ?? [],
        secteurs: v.secteurs ?? [],
    };
}

// Transforme les valeurs du form en payload API
export function formToUpsertPayload(values: VoyageFormData, id?: number | string | null): VoyageUpsertRequest {
    return {
        id: id ? Number(id) : null,
        nom: values.nom.trim(),
        description: values.description ?? null,
        destination: values.destination ?? null,

        prixTotalCents: values.prixTotalCents != null ? Math.round(Number(values.prixTotalCents) * 100) : null,
        participationDesFamilles:
            values.participationDesFamilles != null ? Math.round(Number(values.participationDesFamilles) * 100) : null,

        coverPhotoUrl: values.coverPhotoUrl ?? null,

        paysId: values.paysId,

        datesVoyage: {
            from: values.datesVoyage.from.toISOString(),
            to: values.datesVoyage.to.toISOString(),
        },

        nombreMinParticipants: values.nombreMinParticipants,
        nombreMaxParticipants: values.nombreMaxParticipants,

        datesInscription: values.datesInscription
            ? {
                from: values.datesInscription.from.toISOString(),
                to: values.datesInscription.to.toISOString(),
            }
            : null,

        organisateurIds: values.organisateurIds ?? [],
        sectionIds: values.sectionIds ?? [],
        secteurs: values.secteurs ?? [],
    };
}

import { z } from "zod";

/** Identifiant opaque (UUID, base64url…) : pas de caractères de chemin ni de requête,
 *  pour que toute valeur forgée via devtools soit rejetée avant l'appel API. */
export const SAFE_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

export const phoneRegex = /^[+0-9 ().-]{6,20}$/;

/** Téléphone optionnel : format valide ou chaîne vide. */
export const optionalPhone = z
    .union([z.string().trim().regex(phoneRegex, "Téléphone invalide"), z.literal("")])
    .optional();

/** Texte court optionnel, sans espaces parasites ni valeurs whitespace-only persistées. */
export const optionalShortText = (max = 100) => z.string().trim().max(max).optional().nullable();

/** Texte court requis. */
export const requiredShortText = (message: string, max = 100) =>
    z.string().trim().min(1, message).max(max);

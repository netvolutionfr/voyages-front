import type { ReactNode } from "react";

/** État vide illustré : courbes de niveau d'une carte marine, point d'étape ambre.
 *  Décoratif uniquement (aria-hidden), le message porte l'information. */
const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
        <svg
            viewBox="0 0 120 80"
            className="h-20 w-30 text-primary/35"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
        >
            <path d="M20 62 C8 48 14 30 34 26 C54 22 84 18 98 32 C112 46 100 62 78 66 C56 70 32 76 20 62 Z" />
            <path d="M32 58 C24 48 28 36 42 33 C58 30 80 28 90 38 C100 48 90 58 72 61 C56 64 40 68 32 58 Z" opacity="0.7" />
            <path d="M44 54 C40 48 44 42 54 40 C66 38 76 38 81 44 C86 50 78 55 66 56 C56 57 48 60 44 54 Z" opacity="0.45" />
            <circle cx="62" cy="47" r="3" className="fill-sun" stroke="none" />
        </svg>
        <div className="space-y-1">
            <p className="font-medium">{title}</p>
            {children && <div className="text-sm text-muted-foreground">{children}</div>}
        </div>
    </div>
);

export default EmptyState;

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconGlobe } from "@tabler/icons-react";

/** Habillage des écrans publics (connexion, inscription, OTP) : nuit marine
 *  et fine ligne d'horizon ambre. Volontairement identique en thème clair et
 *  sombre — c'est la vitrine de l'application, pas une surface de travail. */
const PublicShell = ({ children }: { children: ReactNode }) => (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(180deg,oklch(0.32_0.06_238),oklch(0.17_0.03_242)_70%)] p-6">
        {/* Décor : halo solaire posé sur la ligne d'horizon */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[58%] h-64 w-2xl max-w-full -translate-x-1/2 -translate-y-full bg-[radial-gradient(ellipse_at_bottom,oklch(0.75_0.14_70/0.25),transparent_65%)]" />
            <div className="absolute inset-x-0 top-[58%] h-px bg-[linear-gradient(90deg,transparent,oklch(0.78_0.14_75/0.7),transparent)]" />
        </div>

        <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-[oklch(0.97_0.008_235)]">
                <IconGlobe className="size-6 text-[oklch(0.78_0.14_75)]" />
                <span className="font-display text-xl font-semibold">Voyages scolaires</span>
            </Link>

            {children}

            <p className="text-center text-xs text-[oklch(0.97_0.008_235)]/80">
                <Link to="/mentions-legales" className="underline hover:text-[oklch(0.97_0.008_235)]">
                    Mentions légales et protection des données
                </Link>
            </p>
        </div>
    </div>
);

export default PublicShell;

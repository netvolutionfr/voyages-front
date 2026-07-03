import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { IconArrowLeft } from "@tabler/icons-react";

/** Valeur juridique à faire renseigner par l'établissement avant mise en production. */
function Placeholder({ children }: { children: string }) {
    return (
        <span className="rounded bg-amber-100 px-1 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            [À compléter : {children}]
        </span>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-semibold">{title}</h2>
            {children}
        </section>
    );
}

/** Page publique : les mentions légales et l'information RGPD doivent être
 *  consultables sans authentification (notamment depuis l'écran de connexion). */
const MentionsLegales = () => {
    return (
        <div className="mx-auto w-full max-w-3xl space-y-8 p-6 text-sm leading-relaxed">
            <div className="space-y-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link to="/">
                        <IconArrowLeft />
                        Retour
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Mentions légales et protection des données</h1>
                <p className="text-muted-foreground">Dernière mise à jour : juillet 2026</p>
            </div>

            <Section title="Éditeur du site">
                <p>
                    Le présent site de gestion des voyages scolaires est édité par{" "}
                    <Placeholder>dénomination complète de l'établissement</Placeholder>,{" "}
                    <Placeholder>adresse postale</Placeholder>.
                </p>
                <p>
                    Directeur de la publication : <Placeholder>nom du chef d'établissement</Placeholder>.
                    Contact : <Placeholder>email et téléphone de l'établissement</Placeholder>.
                </p>
            </Section>

            <Section title="Hébergement">
                <p>
                    Le site est hébergé par <Placeholder>raison sociale de l'hébergeur</Placeholder>,{" "}
                    <Placeholder>adresse de l'hébergeur</Placeholder>.
                </p>
            </Section>

            <Separator />

            <Section title="Protection des données personnelles (RGPD)">
                <p>
                    Le responsable du traitement est <Placeholder>dénomination de l'établissement</Placeholder>.
                    Contact pour toute question relative aux données personnelles :{" "}
                    <Placeholder>email du référent RGPD / DPO</Placeholder>.
                </p>

                <h3 className="font-semibold">Finalités et bases légales</h3>
                <p>
                    Les données sont traitées pour l'organisation et le suivi des voyages scolaires : inscription
                    des élèves, gestion des documents de voyage, suivi sanitaire et communication avec les familles.
                    Ces traitements reposent sur l'exécution de la mission d'organisation des voyages confiée à
                    l'établissement et, pour la fiche sanitaire (données de santé), sur le consentement explicite du
                    représentant légal ou de l'utilisateur.
                </p>

                <h3 className="font-semibold">Données traitées</h3>
                <ul className="list-disc space-y-1 pl-6">
                    <li>Identité et coordonnées (nom, prénom, date de naissance, email, téléphone, section) ;</li>
                    <li>Liens familiaux (parent responsable, enfants rattachés) ;</li>
                    <li>Documents de voyage (métadonnées et fichiers déposés) ;</li>
                    <li>Fiche sanitaire (données de santé, stockées chiffrées) ;</li>
                    <li>Inscriptions et préférences de voyages ;</li>
                    <li>Données de connexion (passkeys enregistrées, dernière connexion).</li>
                </ul>

                <h3 className="font-semibold">Durées de conservation</h3>
                <p>
                    <Placeholder>durées de conservation par catégorie de données</Placeholder>
                </p>

                <h3 className="font-semibold">Destinataires</h3>
                <p>
                    Les données sont accessibles au personnel habilité de l'établissement (administration,
                    enseignants accompagnateurs) dans la limite de leurs besoins.{" "}
                    <Placeholder>sous-traitants éventuels : hébergeur, stockage de fichiers, envoi d'emails</Placeholder>.
                    Aucune donnée n'est vendue ni transmise à des tiers à des fins commerciales.
                </p>
            </Section>

            <Section title="Vos droits et comment les exercer">
                <p>
                    Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de
                    limitation du traitement, d'opposition et de portabilité de vos données. Cette application vous
                    permet d'exercer directement les principaux droits, après connexion :
                </p>
                <ul className="list-disc space-y-2 pl-6">
                    <li>
                        <strong>Droit d'accès et portabilité</strong> — téléchargez une copie complète de vos données
                        (format JSON) depuis <Link to="/profil/donnees" className="underline">Mon profil → Mes données</Link>.
                    </li>
                    <li>
                        <strong>Droit de rectification</strong> — modifiez directement vos coordonnées depuis{" "}
                        <Link to="/profil" className="underline">Mon profil</Link> ; pour les champs d'identité
                        (nom, prénom, date de naissance, email), utilisez le bouton « Demander une rectification » :
                        la demande est examinée par l'établissement sous un mois.
                    </li>
                    <li>
                        <strong>Droit à l'effacement</strong> — supprimez définitivement votre compte et l'ensemble
                        de vos données depuis <Link to="/profil/donnees" className="underline">Mon profil → Mes données</Link>{" "}
                        (confirmation par code envoyé par email). Cette action n'est pas disponible pour les comptes
                        élèves : contactez l'établissement ou votre parent. Certaines situations (inscription à un
                        voyage en cours, responsabilité d'un élève actif) peuvent différer la suppression.
                    </li>
                </ul>
                <p>
                    Pour les autres droits (limitation, opposition) ou toute difficulté, contactez{" "}
                    <Placeholder>email du référent RGPD / DPO</Placeholder>. Vous disposez également du droit
                    d'introduire une réclamation auprès de la CNIL (
                    <a
                        href="https://www.cnil.fr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        www.cnil.fr
                    </a>
                    ).
                </p>
            </Section>

            <Section title="Cookies">
                <p>
                    Le site n'utilise aucun cookie de mesure d'audience ni de traçage publicitaire. Seuls des
                    cookies strictement nécessaires au fonctionnement sont déposés : un cookie de session sécurisé
                    (<code>refresh_token</code>, httpOnly) permettant de maintenir votre connexion, et un cookie
                    technique de protection contre les attaques CSRF (<code>XSRF-TOKEN</code>). Ces cookies sont
                    exemptés de consentement au sens des lignes directrices de la CNIL.
                </p>
            </Section>
        </div>
    );
};

export default MentionsLegales;

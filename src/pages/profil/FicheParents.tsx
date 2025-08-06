import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardHeader } from "@/components/ui/card";
import { useOne } from "@refinedev/core";

const FicheParents = () => {
    const {data, isLoading, isError} = useOne({
        resource: "me",
        id: "me",
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
        <h1>Fiche des Parents</h1>
            <div>
                <Card>
                    <CardHeader>Fiche de renseignements</CardHeader>
                </Card>
                <h1>Fiche de renseignements</h1>
                {isError && <p>Une erreur est survenue lors du chargement des données.</p>}
                {data && (
                    <div>
                        <p><strong>Nom:</strong> {data.data.nom}</p>
                        <p><strong>Prénom:</strong> {data.data.prenom}</p>
                        <p><strong>Email:</strong> {data.data.email}</p>
                        <p><strong>Téléphone:</strong> {data.data.telephone}</p>
                        <p><strong>Date de naissance:</strong> {data.data.dateNaissance}</p>
                        <p><strong>Adresse:</strong> {data.data.adresse}</p>
                        <p><strong>Code postal:</strong> {data.data.codePostal}</p>
                        <p><strong>Ville:</strong> {data.data.ville}</p>
                    </div>
                )}
            </div>
            );        </div>
    );
}
export default FicheParents;

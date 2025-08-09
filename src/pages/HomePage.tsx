import {useOne} from "@refinedev/core";

const HomePage = () => {
    const { data, isError } = useOne({
        resource: "me",
        id: "me",
    });

    return (
    <>
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        <p>Bienvenue sur votre tableau de bord. Ici, vous pouvez gérer vos informations personnelles et accéder à vos données.</p>
        {isError && <p>Une erreur est survenue lors du chargement des données.</p>}
        {data && (
            <div>
                <pre>
                    {JSON.stringify(data.data, null, 2)}
                </pre>
            </div>
        )}
    </>
    );
};

export default HomePage;

import { useGetIdentity } from "@refinedev/core";
import type {User} from "@/type/User.ts";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

const UserProfile = () => {
    const { data: user, isLoading } = useGetIdentity<User>();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Affiche un message si les données ne sont pas disponibles
    if (!user) {
        return <div>Profil non disponible.</div>;
    }

    return (
        <div className="p-4 border rounded-md">
            <h2 className="text-xl font-bold">Profil de l'utilisateur</h2>
            <p><strong>Nom complet :</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Prénom :</strong> {user.firstName}</p>
            <p><strong>Nom de famille :</strong> {user.lastName}</p>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Rôle :</strong> {user.role}</p>
        </div>
    );
};

export default UserProfile;

import {Button} from "@/components/ui/button.tsx";
import {useLogout} from "@refinedev/core";

const LogoutButton = () => {
    const { mutate: logout } = useLogout();

    return (
        <Button onClick={() => logout()} variant="outline">
            Déconnexion
        </Button>
    );
};

export default LogoutButton;

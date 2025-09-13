import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {IconGlobe} from "@tabler/icons-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useCreate} from "@refinedev/core";
import {useState} from "react";

const FirstLoginPage = () => {
    const { mutate, isSuccess } = useCreate({
        resource: "first-login", // → POST /api/public/first-login
        dataProviderName: "public", // on va déclarer ce provider
    });

    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({
            values: {
                email,
            },
        });
    };

    if (isSuccess) {
        return (
            <div className="flex h-svh items-center justify-center p-6">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Merci !</CardTitle>
                            <CardDescription>
                                Si votre adresse figure dans notre base, vous recevrez un email avec les instructions.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
   }
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <IconGlobe className="size-4" />
                    </div>
                    Voyages Scolaires
                </a>
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Première connexion</CardTitle>
                        <CardDescription>
                            Saisissez votre email pour continuer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6">
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Votre adresse email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Suite...
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
export default FirstLoginPage;

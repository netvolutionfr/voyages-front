import './App.css'
import {Route, Routes} from "react-router-dom";
import {Refine} from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import {authProvider} from "@/providers/authProvider.ts";
import routerProvider from "@refinedev/react-router";
import {accessControlProvider} from "@/providers/accessControlProvider.ts";
import DashboardLayout from "@/components/layout/DashboardLayout.tsx";

const HomePage = () => (
    <>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p>Bienvenue sur votre tableau de bord. Ici, vous pouvez gérer vos informations personnelles et accéder à vos données.</p>
    </>
);

function App() {
    return (
            <Refine
                routerProvider={routerProvider}
                dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
                authProvider={authProvider}
                accessControlProvider={accessControlProvider}
                resources={[{ name: "posts", list: "/posts" }]}
            >
                <Routes>
                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={<HomePage />} />
                    </Route>
                </Routes>
            </Refine>
    );
}
export default App;
